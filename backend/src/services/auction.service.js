import db from '../config/db.js';
import { auctions } from '../models/auction.model.js';
import { eq } from 'drizzle-orm';

const auctionService = {
    /**
     * Get all auctions with optional filters
    */
//   async findAll(filters = {}) {
//     try {
//       let query = db.select().from(auctions);
      
//       // Apply filters if provided
//       if (filters.status) {
//         query = query.where(eq(auctions.status, filters.status));
//       }
//       if (filters.category) {
//         query = query.where(eq(auctions.category, filters.category));
//       }
//       if (filters.sellerId) {
//         query = query.where(eq(auctions.sellerId, parseInt(filters.sellerId)));
//       }
      
//       const result = await query;
//       return result;
//     } catch (error) {
//       throw new Error(`Error fetching auctions: ${error.message}`);
//     }
//   },
    findAll: async function() {
        return db.select().from(auctions);
    },

    /**
     * Get auction by ID
   */
    findById: async function (id) {
        try {
        const result = await db
            .select()
            .from(auctions)
            .where(eq(auctions.id, id))
            .limit(1);
        
        return result.length > 0 ? result[0] : null;
        } catch (error) {
        throw new Error(`Error fetching auction: ${error.message}`);
        }
    },

    /**
     * Create a new auction
    */
    create: async function (auction) {
        try {
        // Validate required fields
        if (!auction.name || !auction.price || !auction.sellerId) {
            throw new Error('Name, price, and sellerId are required');
        }

        // Convert auctionEndTime to Date if it's a string
        if (auction.auctionEndTime && typeof auction.auctionEndTime === 'string') {
            auction.auctionEndTime = new Date(auction.auctionEndTime);
        }

        const result = await db.insert(auctions).values(auction).returning();
        return result[0];
        } catch (error) {
        throw new Error(`Error creating auction: ${error.message}`);
        }
    },

    /**
     * Update a auction
    */
    async update( id, auction ) {
        try {
            console.log('Updating auction with data:', auction);
            const updateData = {};
            if (auction.name !== undefined) updateData.name = auction.name;
            if (auction.description !== undefined) updateData.description = auction.description;
            if (auction.price !== undefined) updateData.price = parseFloat(auction.price);
            if (auction.startingBid !== undefined) updateData.startingBid = parseFloat(auction.startingBid);
            if (auction.currentBid !== undefined) updateData.currentBid = parseFloat(auction.currentBid);
            if (auction.category !== undefined) updateData.category = auction.category;
            if (auction.imageUrl !== undefined) updateData.imageUrl = auction.imageUrl;
            if (auction.status !== undefined) updateData.status = auction.status;
            if (auction.auctionEndTime !== undefined) { updateData.auctionEndTime = auction.auctionEndTime ? new Date(auction.auctionEndTime) : null; }
            updateData.updatedAt = new Date();

            const result = await db
                .update(auctions)
                .set(updateData)
                .where(eq(auctions.id, id))
                .returning();
            return result[0];
        } catch (error) {
        throw new Error(`Error updating auction: ${error.message}`);
        }
    },

    /**
     * Delete a auction
    */
    async delete(id) {
        try {
        const result = await db
            .delete(auctions)
            .where(eq(auctions.id, parseInt(id)))
            .returning();

        return result[0];
        } catch (error) {
        throw new Error(`Error deleting auction: ${error.message}`);
        }
    },

    /**
     * Get auctions by seller ID
    */
    async findBySellerId(sellerId) {
        try {
        const result = await db
            .select()
            .from(auctions)
            .where(eq(auctions.sellerId, parseInt(sellerId)));

        return result;
        } catch (error) {
        throw new Error(`Error fetching auctions by seller: ${error.message}`);
        }
    },

    /**
     * Get active auctions
     */
    async findActive() {
        try {
        const result = await db
            .select()
            .from(auctions)
            .where(eq(auctions.status, 'active'));

        return result;
        } catch (error) {
        throw new Error(`Error fetching active auctions: ${error.message}`);
        }
    }
};

export default auctionService;
