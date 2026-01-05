import db from "../db/index.js"

import {users, bids, auctions, userFavorites} from "../db/schema.js"

import { eq, or, ilike, and, sql, count, desc } from "drizzle-orm";

import dotenv from 'dotenv'

dotenv.config();

const service = {
    findAll: async function(){
        return db.select().from(users);
    },

    // Get users with pagination, filtering, and search
    findAllPaginated: async function({ page = 1, limit = 10, search = '', role = '', status = '' }) {
        const offset = (page - 1) * limit;
        
        // Build where conditions
        const conditions = [];
        
        if (search) {
            conditions.push(
                or(
                    ilike(users.username, `%${search}%`),
                    ilike(users.email, `%${search}%`),
                    ilike(users.fullName, `%${search}%`)
                )
            );
        }
        
        if (role && role !== 'all') {
            conditions.push(eq(users.role, role));
        }
        
        if (status && status !== 'all') {
            conditions.push(eq(users.status, status));
        }

        // Get total count
        const countQuery = db.select({ count: count() }).from(users);
        if (conditions.length > 0) {
            countQuery.where(and(...conditions));
        }
        const [{ count: totalCount }] = await countQuery;

        // Get paginated results
        let query = db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            fullName: users.fullName,
            role: users.role,
            status: users.status,
            avatarUrl: users.avatarUrl,
            createdAt: users.createdAt,
            isVerified: users.isVerified,
            ratingCount: users.ratingCount,
            positiveRatingCount: users.positiveRatingCount,
        }).from(users);
        
        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }
        
        const result = await query
            .orderBy(desc(users.createdAt))
            .limit(limit)
            .offset(offset);

        return {
            users: result,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            }
        };
    },

    // Get user stats (bids count, auctions count)
    getUserStats: async function(userId, role) {
        // Total bids
        const bidsResult = await db
            .select({ count: count() })
            .from(bids)
            .where(eq(bids.bidderId, userId));
        
        // Total auctions (as seller)
        const auctionsResult = await db
            .select({ count: count() })
            .from(auctions)
            .where(eq(auctions.sellerId, userId));

        // Total auctions still active
        const activeListings = await db
            .select({ count: count() })
            .from(auctions)
            .where(and(eq(auctions.sellerId, userId), eq(auctions.status, 'active')));

        // Total sold auctions
        const soldItems = await db
            .select({ count: count() })
            .from(auctions)
            .where(and(eq(auctions.sellerId, userId), eq(auctions.status, 'sold')));
        
        // Total won auctions
        const wonAuctions = await db
            .select({ count: count() })
            .from(auctions)
            .where(eq(auctions.winnerId, userId));

        // Total active bids (auctions where user has placed a bid and auction is still active)
        const activeBids = await db
            .select({ count: count() })
            .from(bids)
            .innerJoin(auctions, eq(auctions.id, bids.auctionId))
            .where(and(eq(bids.bidderId, userId), eq(auctions.status, 'active')))
            .groupBy(auctions.id);

        // Total favourite products
        const favoriteProducts = await db
            .select({ count: count() })
            .from(userFavorites)
            .innerJoin(auctions, eq(auctions.id, userFavorites.auctionId))
            .where(eq(userFavorites.userId, userId));

        return {
            totalBids: bidsResult[0]?.count || 0,
            totalAuctions: auctionsResult[0]?.count || 0,
            totalActiveListings: activeListings[0]?.count || 0,
            totalSoldItems: soldItems[0]?.count || 0,
            totalWonAuctions: wonAuctions[0]?.count || 0,
            totalActiveBids: activeBids.length,
            totalFavoriteProducts: favoriteProducts[0]?.count || 0,
        };
    },

    getById: async function(id){
        const result = await db.select().from(users).where(eq(users.id, id));
        return result.length > 0 ? result[0] : null;
    },

    getByEmail: async function(email){
        const result = await db.select().from(users).where(eq(users.email, email));
        return result.length > 0 ? result[0] : null;
    },

    getByUsername: async function(username){
        console.log('Searching for user by username:', username);
        const result = await db.select().from(users).where(eq(users.username, username));
        return result.length > 0 ? result[0] : null;
    },

    getByGoogleId: async function(googleId){
        const result = await db.select().from(users).where(eq(users.googleId, googleId));
        return result.length > 0 ? result[0] : null;
    },

    getByFacebookId: async function(facebookId){
        const result = await db.select().from(users).where(eq(users.facebookId, facebookId));
        return result.length > 0 ? result[0] : null;
    },

    create: async function(userData){
        const result = await db.insert(users).values(userData).returning();
        return result[0];
    },

    update: async function(id, info){
        if(info.createdAt) {
            info.createdAt = new Date(info.createdAt);
        }
        return db.update(users).set(info).where(eq(users.id, id)).returning();
    },

    delete: async function(id){
        return db.delete(users).where(eq(users.id, id));
    },

    // Ban a user
    banUser: async function(id) {
        const result = await db.update(users)
            .set({ status: 'banned' })
            .where(eq(users.id, id))
            .returning();
        return result[0];
    },

    // Unban a user
    unbanUser: async function(id) {
        const result = await db.update(users)
            .set({ status: 'active' })
            .where(eq(users.id, id))
            .returning();
        return result[0];
    },
    
    // getUserAuctions: async function(userId, role) {
    //     let activeListings = [];
    //     let soldItems = []
    //     if (role === 'seller') {
    //         activeListings = await db
    //             .select()
    //             .from(auctions)
    //             .where(and(eq(auctions.sellerId, userId), eq(auctions.status, 'active')));

    //         soldItems = await db
    //             .select()
    //             .from(auctions)
    //             .where(and(eq(auctions.sellerId, userId), eq(auctions.status, 'sold')));
    //     }
        
    //     // Get won auctions
    //     const wonAuctions = await db
    //         .select()
    //         .from(auctions)
    //         .where(eq(auctions.winnerId, userId));

    //     // Get active bids (auctions where user has placed a bid and auction is still active)
    //     const activeBids = await db
    //         .select({
    //             auction: auctions
    //         })
    //         .from(bids)
    //         .innerJoin(auctions, eq(auctions.id, bids.auctionId))
    //         .where(and(eq(bids.bidderId, userId), eq(auctions.status, 'active')))
    //         .groupBy(auctions.id);

    //     // TODO: Add favorites when user_favorites table is created
    //     const favoriteProducts = await db
    //         .select({
    //             auction: auctions
    //         })
    //         .from(userFavorites)
    //         .innerJoin(auctions, eq(auctions.id, userFavorites.auctionId))
    //         .where(eq(userFavorites.userId, userId));

    //     return {
    //         activeListings,
    //         soldItems,
    //         wonAuctions,
    //         activeBids: activeBids.map(b => b.auction),
    //         favoriteProducts,
    //         // Counts for metadata
    //         wonAuctionCount: wonAuctions.length,
    //         activeAuctionCount: activeListings.length,
    //     };
    // },

    getUserAuctions: async function(userId, tab, category) {
        let baseQuery = db
            .select({
                ...auctions,
                image_url: sql`(SELECT image_url FROM auction_images WHERE auction_images.auction_id = auctions.auction_id AND is_primary = true LIMIT 1)`,
            })
            .from(auctions);

        let whereConditions = [];

        switch (tab) {
        case 'active-bids':
            baseQuery.innerJoin(bids, eq(bids.auctionId, auctions.id));
            whereConditions.push(and(eq(bids.bidderId, userId), eq(auctions.status, 'active')));
            baseQuery.groupBy(auctions.id);
            break;

        case 'favorites':
            baseQuery.innerJoin(userFavorites, eq(userFavorites.auctionId, auctions.id));
            whereConditions.push(eq(userFavorites.userId, userId));
            break;

        case 'my-listings':
            whereConditions.push(and(eq(auctions.sellerId, userId), eq(auctions.status, 'active')));
            break;

        case 'sold-items':
            whereConditions.push(and(eq(auctions.sellerId, userId), eq(auctions.status, 'sold')));
            break;

        case 'won-auctions':
            whereConditions.push(and(
                eq(auctions.winnerId, userId),
                or(eq(auctions.status, 'sold'), eq(auctions.status, 'ended'))
            ));
            break;

        default:
            return res.status(400).json({ error: "Invalid tab specified" });
        }

        if (category && category !== 'All Categories') {
            // whereConditions.push(eq(auctions.categoryId, parseInt(category)));
            whereConditions.push(eq(auctions.name, category));
        }

        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

        baseQuery.where(whereClause);
        
        // baseQuery.orderBy(desc(auctions.end_time));

        return await baseQuery;
    }

}

export default service;

