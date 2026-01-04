import db from "../db/index.js"
import { auctions, auctionImages } from "../db/schema.js" // Đảm bảo đã import auctionImages
import { eq } from "drizzle-orm";

const service = {
    findAll: async function(){
        // Join để lấy luôn ảnh đại diện (ảnh đầu tiên)
        const result = await db.query.auctions.findMany({
            with: {
                images: true, // Lấy kèm danh sách ảnh
                seller: true, // Lấy thông tin người bán
            },
            orderBy: (auctions, { desc }) => [desc(auctions.createdAt)],
        });
        
        // Map lại dữ liệu để frontend dễ dùng (lấy ảnh đầu tiên làm ảnh chính)
        return result.map(auction => ({
            ...auction,
            image: auction.images.length > 0 ? auction.images[0].imageUrl : 'https://via.placeholder.com/300',
            sellerName: auction.seller.username // Flatten seller name
        }));
    },

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

    create: async function(auctionData){
        // 1. Tách thông tin ảnh ra khỏi dữ liệu auction
        const { images, ...mainInfo } = auctionData;

        // Xử lý ngày tháng
        mainInfo.createdAt = new Date();
        mainInfo.endTime = new Date(mainInfo.endTime);
        
        // Mặc định status
        mainInfo.status = 'active';

        return await db.transaction(async (tx) => {
            // 2. Tạo Auction
            const [newAuction] = await tx.insert(auctions).values(mainInfo).returning();

            // 3. Nếu có ảnh, lưu vào bảng auction_images
            if (images && images.length > 0) {
                const imageValues = images.map(url => ({
                    auctionId: newAuction.id,
                    imageUrl: url
                }));
                await tx.insert(auctionImages).values(imageValues);
            }

            return newAuction;
        });
    },

    update: async function(id, auc){
        if(auc.endTime) auc.endTime = new Date(auc.endTime);
        await db.update(auctions).set(auc).where(eq(auctions.id, id));
    },

    delete: async function(id){
        // Xóa ảnh trước (nếu không set cascade ở DB)
        await db.delete(auctionImages).where(eq(auctionImages.auctionId, id));
        await db.delete(auctions).where(eq(auctions.id, id));
    }
}

export default service;