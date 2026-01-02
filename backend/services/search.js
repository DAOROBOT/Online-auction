import db from "../db/index.js"
import { auctions, users, categories, auctionImages, bids } from "../db/schema.js"
import { sql, eq, and, desc, asc, inArray, gte, lte } from "drizzle-orm";

const service = {
    findAll: async function(){
        return db.select().from(auctions);
    },
    findAuctions: async function({ q, category, minPrice, maxPrice, sortBy, limit, offset, status }){
        console.log('=== Search Service Called ===');
        console.log({ q, category, minPrice, maxPrice, sortBy, limit, offset, status });
        
        // Build WHERE conditions
        const conditions = [];
        
        // Status filter - default to 'active' for public search, allow all for admin
        if (status && status !== 'all') {
            conditions.push(eq(auctions.status, status));
        } else if (!status) {
            // Default behavior: only show active auctions for public search
            conditions.push(eq(auctions.status, 'active'));
        }
        // If status === 'all', don't add any status condition (admin view)

        // Full-text search condition
        if (q && q.trim()) {
            console.log('Adding full-text search for:', q);
            conditions.push(
                sql`to_tsvector('english', ${auctions.title} || ' ' || ${auctions.description}) @@ plainto_tsquery('english', ${q})`
            );
        }

        if (category && category !== 'All') {
            console.log('Filtering by category:', category);
            conditions.push(eq(categories.name, category));
        }

        if (minPrice) {
            conditions.push(gte(auctions.currentPrice, minPrice.toString()));
        }

        if (maxPrice) {
            conditions.push(lte(auctions.currentPrice, maxPrice.toString()));
        }

        // Build ORDER BY
        let orderBy;
        switch (sortBy) {
            case 'popularity':
                orderBy = desc(auctions.bidCount);
                break;
            case 'price-asc':
                orderBy = asc(auctions.currentPrice);
                break;
            case 'price-desc':
                orderBy = desc(auctions.currentPrice);
                break;
            case 'ending-soon':
                orderBy = asc(auctions.endTime);
                break;
            case 'newest':
                orderBy = desc(auctions.createdAt);
                break;
            case 'aToZ':
                orderBy = asc(auctions.title);
                break;
            case 'zToA':
                orderBy = desc(auctions.title);
                break;
            default:
                // Default to newest
                orderBy = desc(auctions.createdAt);
        }
        console.log('Order by:', sortBy, orderBy);
        
        // Build where clause - handle empty conditions
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        
        // Main query
        const results = await db
            .select({
                id: auctions.id,
                title: auctions.title,
                currentPrice: auctions.currentPrice,
                startingPrice: auctions.startingPrice,
                buyNowPrice: auctions.buyNowPrice,
                endTime: auctions.endTime,
                createdAt: auctions.createdAt,
                bidCount: auctions.bidCount,
                status: auctions.status,
                sellerName: users.fullName,
                sellerId: users.id,
                categoryName: categories.name,
                primaryImage: auctionImages.imageUrl
            })
            .from(auctions)
            .innerJoin(users, eq(auctions.sellerId, users.id))
            .innerJoin(categories, eq(auctions.categoryId, categories.id))
            .leftJoin(auctionImages, and(
                eq(auctions.id, auctionImages.auctionId),
                eq(auctionImages.isPrimary, true)
            ))
            .where(whereClause)
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);
        
        console.log('Results found:', results.length);
        if (results.length > 0) {
            console.log('First result:', results[0]);
        }

        // Fetch highest bids per auction (no raw SQL, query builder only)
        const auctionIds = results.map(r => r.id);
        let highestBidsByAuction = {};
        if (auctionIds.length > 0) {
            const topBids = await db
                .select({
                    auctionId: bids.auctionId,
                    bidderId: bids.bidderId,
                    bidderName: users.fullName,
                    amount: bids.amount
                })
                .from(bids)
                .innerJoin(users, eq(bids.bidderId, users.id))
                .where(inArray(bids.auctionId, auctionIds))
                .orderBy(bids.auctionId, desc(bids.amount));

            // Reduce to highest per auction
            for (const bid of topBids) {
                if (!highestBidsByAuction[bid.auctionId]) {
                    highestBidsByAuction[bid.auctionId] = bid;
                }
            }
        }

        // Get total count
        const countResult = await db
            .select({ count: sql`count(*)`.as('count') })
            .from(auctions)
            .innerJoin(users, eq(auctions.sellerId, users.id))
            .innerJoin(categories, eq(auctions.categoryId, categories.id))
            .where(whereClause);

        const totalItems = countResult.length > 0 ? parseInt(countResult[0].count) : 0;
        console.log('Total items matching filters:', totalItems);
        console.log('=== End Search Service ===\n');
        
        return {
            data: results.map(row => ({
                id: row.id,
                title: row.title,
                currentPrice: parseFloat(row.currentPrice),
                startingPrice: row.startingPrice ? parseFloat(row.startingPrice) : null,
                buyNowPrice: row.buyNowPrice ? parseFloat(row.buyNowPrice) : null,
                endTime: row.endTime,
                createdAt: row.createdAt,
                bidCount: parseInt(row.bidCount || 0),
                status: row.status,
                primaryImage: row.primaryImage || 'https://via.placeholder.com/300',
                image: row.primaryImage || 'https://via.placeholder.com/300',
                category: row.categoryName,
                categoryName: row.categoryName,
                sellerName: row.sellerName,
                sellerId: row.sellerId,
                highestBidder: highestBidsByAuction[row.id]
                    ? {
                        id: highestBidsByAuction[row.id].bidderId,
                        name: highestBidsByAuction[row.id].bidderName,
                        amount: highestBidsByAuction[row.id].amount ? parseFloat(highestBidsByAuction[row.id].amount) : null
                    }
                    : null,
                seller: {
                    name: row.sellerName
                }
            })),
            total: totalItems
        };
    },
}

export default service;