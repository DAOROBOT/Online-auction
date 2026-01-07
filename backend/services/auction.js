import db from "../db/index.js"
import { categories, auctions, auctionImages, users, userFavorites, bids, descriptionLogs, comments } from "../db/schema.js"
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
                    with: { bidder: true }
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
                    with: { bidder: true }
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

    // Tìm thông tin 1 sản phẩm
    findById: async function(id) {
        return await db.query.auctions.findFirst({
            where: eq(auctions.id, id),
            with: {category : {columns : {name : true}}},
            limit: 1,
        });
    },

    findImages: async function(id) {
        return await db.select().from(auctionImages).where(eq(auctionImages.auctionId, id));
    },

    findDescription: async function(id) {
        return await db.query.descriptionLogs.findMany({
            where: eq(descriptionLogs.auctionId, id),
            orderBy: [desc(descriptionLogs.editedAt)]
        });

        // return {
        //     current: logs.length > 0 ? logs[0].contentSnapshot : null,
        //     history: logs
        // };
    },

    findComments: async function(id) {
        return await db.query.comments.findMany({
            where: eq(comments.auctionId, id),
            with: {
                user: {
                    columns: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatarUrl: true
                    }
                }
            },
            // Order by oldest first (standard for forums) or newest first
            orderBy: [desc(comments.createdAt)] 
        });

        // Optional: Organize into a tree structure if your UI needs nested replies
        // This simple version returns a flat list with parent_id included
        // return result.map(comment => ({
        //     ...comment,
        //     user: {
        //         id: comment.user.id,
        //         name: comment.user.fullName || comment.user.username,
        //         avatar: comment.user.avatarUrl
        //     }
        // }));
    },

    // Tạo đấu giá mới (Có Transaction để lưu ảnh an toàn)
    create: async function(info, images) {
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

    upload: async function(images) {
        return await db.insert(auctionImages).values(images).returning();
    },
    
    update: async function(id, auc) {
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