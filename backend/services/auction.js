import db from "../db/index.js"
import { categories, auctions, auctionImages, users, userFavorites, bids } from "../db/schema.js"
import { and, or, eq, asc, desc, count, inArray } from "drizzle-orm";

const service = {
    // Lấy danh sách top các sản phẩm ứng của mục tương ứng (Homepage)
    findByOrder: async function({ 
        userId = null,
        viewId = null,
        status = 'active',
        sortBy = 'newest',
    } = {}) {

        const limit = 5;

        // Sorting Logic
        let orderByClause;

        switch(sortBy) {
            case 'endingSoon':
                orderByClause = [asc(auctions.endTime)];
                break;
            case 'mostBids':
                orderByClause = [desc(auctions.bidCount)];
                break;
            case 'highestPrice':
                orderByClause = [desc(auctions.currentPrice)];
                break;
            default: // 'newest'
                orderByClause = [desc(auctions.createdAt)];
        }

        // Dynamic Conditions
        const whereConditions = [];

        if (status) {
            whereConditions.push(eq(auctions.status, status));
        }

        if (userId) {
            whereConditions.push(eq(auctions.sellerId, userId));
        }

        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : null;

        const foundAuctions = await db.query.auctions.findMany({
            where: whereClause,
            with: {
                images: true,
                seller: true,
                category: true,
                bids: {
                    orderBy: [desc(bids.amount)],
                    limit: 1,
                    with: {
                        bidder: true
                    }
                },
            },
            orderBy: orderByClause,
            limit: limit,
        });
        
        let favoriteAuctions = new Set();
        
        if (viewId && foundAuctions.length > 0) {
            const auctionIds = foundAuctions.map(a => a.id);
            
            const favorites = await db.select({ auctionId: userFavorites.auctionId })
                .from(userFavorites)
                .where(and(
                    eq(userFavorites.userId, viewId),
                    inArray(userFavorites.auctionId, auctionIds)
                ));

            favoriteAuctions = new Set(favorites.map(f => f.auctionId));
        }
        
        // Map Result
        return foundAuctions.map(auction => {
            const sellerRating = auction.seller.ratingCount > 0 ? (auction.seller.positiveRatingCount / auction.seller.ratingCount) * 100 : 100;
            return {
                ...auction,
                image: auction.images.find(img => img.isPrimary)?.imageUrl || auction.images[0]?.imageUrl || null,
                seller: {
                    username: auction.seller.username,
                    rating: parseFloat(sellerRating.toFixed(1)),
                },
                category: auction.category?.name || 'Uncategorized',
                bids: auction.bids[0],
                isFavorited: favoriteAuctions.has(auction.id)
        }});
    },

    // Lấy danh sách sản phẩm liên quan của mục tương ứng (Profile)
    findByStatus: async function(username, status, category = null) {
        const user = await db.query.users.findFirst({
            where: eq(users.username, username),
            columns: { id: true }
        });

        if (!user) {
            throw new Error("User not found");
        }

        const userId = user.id;

        const conditions = [];

        if (category && category !== 'All Categories') {
            const categoryFilter = await db.query.categories.findFirst({
                where: eq(categories.name, category),
                columns: { id: true }
            });

            if (categoryFilter) {
                conditions.push(eq(auctions.categoryId, categoryFilter.id));
            } else {
                throw new Error("Category not found");
            }
        }

        switch (status) {
            case 'my-listings':
                conditions.push(and(eq(auctions.sellerId, userId), eq(auctions.status, 'active')));
                break;

            case 'sold-items':
                conditions.push(and(eq(auctions.sellerId, userId), eq(auctions.status, 'sold')));
                break;

            case 'won-auctions':
                conditions.push(and(eq(auctions.winnerId, userId), or(eq(auctions.status, 'sold'), eq(auctions.status, 'ended'))));
                break;

            case 'favorites':
                const myFavs = await db.query.userFavorites.findMany({
                    where: eq(userFavorites.userId, userId),
                    columns: { auctionId: true }
                });
                
                const favIds = myFavs.map(f => f.auctionId);
                
                if (favIds.length === 0) return [];
                
                conditions.push(inArray(auctions.id, favIds));
                break;

            case 'active-bids':
                const myBids = await db.query.bids.findMany({
                    where: eq(bids.bidderId, userId),
                    columns: { auctionId: true }
                });

                const bidAuctionIds = [...new Set(myBids.map(b => b.auctionId))];

                if (bidAuctionIds.length === 0) return [];

                conditions.push(and(inArray(auctions.id, bidAuctionIds), eq(auctions.status, 'active')));
                break;

            default:
                throw new Error("Invalid tab specified");
        }

        const result = await db.query.auctions.findMany({
            where: and(...conditions),
            with: {
                images: true, 
                seller: true,
                category: true,
                bids: {
                    orderBy: [desc(bids.amount)],
                    limit: 1,
                    with: {
                        bidder: true
                    }
                }
            },
            // orderBy: [desc(auctions.createdAt)]
        });

        let favoriteAuctions = new Set();

        if (status != 'favorites' && result.length > 0) {
            const auctionIds = result.map(a => a.id);
            
            const favorites = await db.select({ auctionId: userFavorites.auctionId })
                .from(userFavorites)
                .where(and(
                    eq(userFavorites.userId, userId),
                    inArray(userFavorites.auctionId, auctionIds)
                ));

            favoriteAuctions = new Set(favorites.map(f => f.auctionId));
        }

        return result.map(auction => {
            const sellerRating = auction.seller.ratingCount > 0 ? (auction.seller.positiveRatingCount / auction.seller.ratingCount) * 100 : 100;
            return {
                ...auction,
                image: auction.images.find(img => img.isPrimary)?.imageUrl || auction.images[0]?.imageUrl || null,
                seller: {
                    username: auction.seller.username,
                    rating: parseFloat(sellerRating.toFixed(1)),
                },
                category: auction.category?.name || 'Uncategorized',
                bids: auction.bids[0],
                isFavorited: status === 'favorites' ? true : favoriteAuctions?.has(auction.id)
        }});
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
    }
}

export default service;