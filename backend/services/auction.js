import db from "../db/index.js"
import { bids, autoBids, users, auctions, auctionImages } from "../db/schema.js"
import { eq, and, desc, gt } from "drizzle-orm";

const service = {
    // Lấy tất cả, kèm ảnh (Lấy ảnh đầu tiên làm ảnh đại diện)
    findAll: async function(){
        const result = await db.query.auctions.findMany({
            with: {
                images: true, 
                seller: true,
            },
            orderBy: (auctions, { desc }) => [desc(auctions.createdAt)],
        });
        
        return result.map(auction => ({
            ...auction,
            image: auction.images.length > 0 ? auction.images[0].imageUrl : 'https://via.placeholder.com/300',
            sellerName: auction.seller.username
        }));
    },

    // Lấy chi tiết 1 sản phẩm
    findById: async function(id){
        const result = await db.query.auctions.findFirst({
            where: eq(auctions.id, id),
            with: {
                images: true,
                seller: true,
                category: true
            }
        });
        
        if (!result) return null;

        return {
            ...result,
            image: result.images.length > 0 ? result.images[0].imageUrl : 'https://via.placeholder.com/300',
            sellerName: result.seller.username
        };
    },

    // Tạo đấu giá mới (Có Transaction để lưu ảnh an toàn)
    create: async function(info, images){
        // Chuẩn hóa dữ liệu ngày tháng
        info.createdAt = new Date();
        info.endTime = new Date(info.endTime);
        info.status = 'active';
        info.bidCount = 0;

        // Thực hiện Transaction (Tạo Auction -> Tạo Images)
        return await db.transaction(async (tx) => {
            // Insert bảng auctions
            const [newAuction] = await tx.insert(auctions).values(info).returning();

            // Insert bảng auction_images (nếu có ảnh)
            if (images && images.length > 0) {
                console.log(images);
                const imageValues = images.map((image, index) => ({
                    auctionId: newAuction.id,
                    imageUrl: image.path,
                    isPrimary: index === 0
                }));
                await tx.insert(auctionImages).values(imageValues);
            }

            return newAuction;
        });
    },

    upload: async function(images){
        return await db.insert(auctionImages).values(images).returning();
    },
    
    update: async function(id, auc){
        if(auc.endTime) auc.endTime = new Date(auc.endTime);
        await db.update(auctions).set(auc).where(eq(auctions.id, id));
    },

    delete: async function(id){
        await db.delete(auctionImages).where(eq(auctionImages.auctionId, id));
        await db.delete(auctions).where(eq(auctions.id, id));
    },

    placeBid: async function(auctionId, userId, userMaxAmount) {
        return await db.transaction(async (tx) => {
            // 1. Lấy thông tin đấu giá hiện tại (Lock row để tránh race condition nếu cần, ở đây làm đơn giản)
            const auction = await tx.query.auctions.findFirst({
                where: eq(auctions.id, auctionId),
                with: { bids: { orderBy: [desc(bids.amount)], limit: 1 } } // Lấy bid cao nhất hiện tại
            });

            if (!auction) throw new Error("Auction not found");
            if (auction.status !== 'active') throw new Error("Auction is not active");
            if (new Date(auction.endTime) < new Date()) throw new Error("Auction has ended");
            if (auction.sellerId === userId) throw new Error("Seller cannot bid on their own product");

            const currentPrice = Number(auction.currentPrice);
            const stepPrice = Number(auction.stepPrice);
            const userBidAmount = Number(userMaxAmount); // Số tiền tối đa user muốn trả

            // Giá thấp nhất hợp lệ để bid lần này
            const minValidBid = currentPrice + (auction.bidCount === 0 ? 0 : stepPrice);

            if (userBidAmount < minValidBid) {
                throw new Error(`Bid amount must be at least ${minValidBid}`);
            }

            // 2. Tìm người đang giữ Auto Bid cao nhất hiện tại (nếu có)
            const existingAutoBid = await tx.query.autoBids.findFirst({
                where: eq(autoBids.auctionId, auctionId),
                orderBy: [desc(autoBids.maxAmount)]
            });

            // --- Logic đấu giá ---
            
            // Xóa auto-bid cũ của chính user này (để cập nhật cái mới)
            await tx.delete(autoBids).where(and(eq(autoBids.auctionId, auctionId), eq(autoBids.userId, userId)));

            // Trường hợp 1: Chưa có ai đặt Auto Bid, hoặc Auto Bid cao nhất hiện tại thấp hơn User mới
            if (!existingAutoBid || Number(existingAutoBid.maxAmount) < userBidAmount) {
                
                // Mức giá mới để thắng người cũ (nếu có người cũ)
                let newCurrentPrice = minValidBid;
                
                // Nếu có người cũ đang giữ Auto Bid, ta chỉ cần trả: Max của họ + Bước giá (hoặc bằng chính mức Max của ta nếu sát quá)
                if (existingAutoBid && existingAutoBid.userId !== userId) {
                    const priceToBeatCompetitor = Number(existingAutoBid.maxAmount) + stepPrice;
                    newCurrentPrice = Math.min(userBidAmount, priceToBeatCompetitor);
                }

                // Lưu Bid mới vào bảng bids (Lịch sử)
                await tx.insert(bids).values({
                    auctionId,
                    bidderId: userId,
                    amount: newCurrentPrice,
                    bidTime: new Date()
                });

                // Cập nhật giá hiện tại cho sản phẩm
                await tx.update(auctions).set({
                    currentPrice: newCurrentPrice,
                    bidCount: (auction.bidCount || 0) + 1,
                    winnerId: userId, // Người mới đang thắng
                    // Auto extend logic
                    endTime: (auction.autoExtend && (new Date(auction.endTime) - new Date() < 5 * 60 * 1000)) 
                        ? new Date(new Date(auction.endTime).getTime() + 5 * 60 * 1000) 
                        : auction.endTime
                }).where(eq(auctions.id, auctionId));

                // Lưu mức giá trần mới của User này vào bảng auto_bids
                await tx.insert(autoBids).values({
                    userId,
                    auctionId,
                    maxAmount: userBidAmount
                });

                return { status: "success", message: "You are the highest bidder!", currentPrice: newCurrentPrice };
            } 
            
            // Trường hợp 2: User mới trả thấp hơn hoặc bằng Auto Bid của người đang giữ đỉnh (User cũ Defend thành công)
            else {
                // Người cũ (existingAutoBid.userId) sẽ tự động bid đè lên người mới
                const competitorMax = Number(existingAutoBid.maxAmount);
                
                // Hệ thống tự động trả giá giúp người cũ: Bằng giá User mới + bước giá (nhưng ko quá Max của người cũ)
                let autoBidAmount = Math.min(competitorMax, userBidAmount + stepPrice);

                // 2.1: Ghi nhận bid của User mới (dù thua nhưng vẫn phải ghi nhận là đã tham gia)
                await tx.insert(bids).values({
                    auctionId,
                    bidderId: userId,
                    amount: userBidAmount,
                    bidTime: new Date()
                });

                // 2.2: Ghi nhận bid tự động của Hệ thống (đại diện cho người cũ)
                // Chỉ bid nếu giá user mới chưa đẩy giá lên tới đỉnh của người cũ
                if (userBidAmount < competitorMax) {
                     await tx.insert(bids).values({
                        auctionId,
                        bidderId: existingAutoBid.userId,
                        amount: autoBidAmount,
                        bidTime: new Date(new Date().getTime() + 100) // Thêm 100ms để nó nằm sau
                    });
                } else {
                    // Nếu user mới trả BẰNG user cũ -> Người cũ vẫn thắng do đến trước, giá giữ nguyên mức Max
                    autoBidAmount = competitorMax;
                }

                // Cập nhật sản phẩm
                await tx.update(auctions).set({
                    currentPrice: autoBidAmount,
                    bidCount: (auction.bidCount || 0) + 2, // +2 vì có bid của user mới và bid tự động
                    winnerId: existingAutoBid.userId, // Người cũ vẫn thắng
                     // Auto extend logic
                     endTime: (auction.autoExtend && (new Date(auction.endTime) - new Date() < 5 * 60 * 1000)) 
                        ? new Date(new Date(auction.endTime).getTime() + 5 * 60 * 1000) 
                        : auction.endTime
                }).where(eq(auctions.id, auctionId));

                return { 
                    status: "outbid", 
                    message: "You have been outbid immediately by an automatic bid!", 
                    currentPrice: autoBidAmount 
                };
            }
        });
    }

}

export default service;