import db from "../db/index.js"

import {users, bids, auctions} from "../db/schema.js"

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
    getUserStats: async function(userId) {
        // Get total bids
        const bidsResult = await db
            .select({ count: count() })
            .from(bids)
            .where(eq(bids.bidderId, userId));
        
        // Get total auctions (as seller)
        const auctionsResult = await db
            .select({ count: count() })
            .from(auctions)
            .where(eq(auctions.sellerId, userId));

        return {
            totalBids: bidsResult[0]?.count || 0,
            totalAuctions: auctionsResult[0]?.count || 0,
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
    update: async function(id, user){
        if(user.createdAt) {
            user.createdAt = new Date(user.createdAt);
        }
        return db.update(users).set(user).where(eq(users.id, id));
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
    getUserAuctions: async function(userId, role) {
        // Get active listings (for sellers)
        let activeListings = [];
        if (role === 'seller') {
            activeListings = await db
                .select()
                .from(auctions)
                .where(and(eq(auctions.sellerId, userId), eq(auctions.status, 'active')));
        }
        
        // Get sold items (for sellers)
        const soldItems = await db
            .select()
            .from(auctions)
            .where(and(eq(auctions.sellerId, userId), eq(auctions.status, 'sold')));
        
        // Get won auctions
        const wonAuctions = await db
            .select()
            .from(auctions)
            .where(eq(auctions.winnerId, userId));

        // Get active bids (auctions where user has placed a bid and auction is still active)
        const activeBids = await db
            .select({
                auction: auctions
            })
            .from(bids)
            .innerJoin(auctions, eq(auctions.id, bids.auctionId))
            .where(and(eq(bids.bidderId, userId), eq(auctions.status, 'active')))
            .groupBy(auctions.id);

        // TODO: Add favorites when user_favorites table is created
        const favoriteProducts = [];

        return {
            activeListings,
            soldItems,
            wonAuctions,
            activeBids: activeBids.map(b => b.auction),
            favoriteProducts,
            // Counts for metadata
            wonAuctionCount: wonAuctions.length,
            activeAuctionCount: activeListings.length,
        };
    }


}

export default service;

