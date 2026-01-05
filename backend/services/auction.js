import db from "../db/index.js"
import { auctions, auctionImages } from "../db/schema.js"
import { eq } from "drizzle-orm";

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
    create: async function(auctionData){
        // 1. Tách danh sách ảnh ra
        const { images, ...mainInfo } = auctionData;

        // 2. Chuẩn hóa dữ liệu ngày tháng
        mainInfo.createdAt = new Date();
        mainInfo.endTime = new Date(mainInfo.endTime);
        mainInfo.status = 'active';
        mainInfo.bidCount = 0;

        // 3. Thực hiện Transaction (Tạo Auction -> Tạo Images)
        return await db.transaction(async (tx) => {
            // Insert bảng auctions
            const [newAuction] = await tx.insert(auctions).values(mainInfo).returning();

            // Insert bảng auction_images (nếu có ảnh)
            if (images && images.length > 0) {
                const imageValues = images.map((url, index) => ({
                    auctionId: newAuction.id,
                    imageUrl: url,
                    isPrimary: index === 0 // Ảnh đầu tiên là ảnh chính
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
    }
}

export default service;