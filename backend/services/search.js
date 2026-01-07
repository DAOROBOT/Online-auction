import db from "../db/index.js"
import { auctions, categories, auctionImages, bids } from "../db/schema.js"
import { sql, eq, or, and, desc, asc, count, inArray, gte, lte } from "drizzle-orm";

const service = {
    findAll: async function(){
        return db.select().from(auctions);
    },
    findAuctions: async function({
        q = '',
        category = null,
        minPrice = null,
        maxPrice = null,
        sortBy = 'relevance',
        status = null,
        limit = 20,
        offset = 0,
    }){
        
        // Build WHERE conditions
        const conditions = [];

        let matchedCategoryIds = [];

        // Full-text search condition - MUST MATCH INDEX EXACTLY
        if (q && q.trim()) {
            const searchQuery = q.trim();

            const rows = await db
                .select({ id: categories.id })
                .from(categories)
                .where(
                    sql`to_tsvector('english'::regconfig, 
                        (COALESCE(${categories.name}, ''::character varying))::text
                    ) @@ websearch_to_tsquery('english', ${searchQuery})`
                );

            matchedCategoryIds = rows.map(r => r.id);


            const ftsConditions = [
                sql`to_tsvector('english'::regconfig, 
                    (COALESCE(${auctions.title}, ''::character varying))::text || ' '::text || 
                    COALESCE(${auctions.description}, ''::text)
                ) @@ websearch_to_tsquery('english', ${searchQuery})`
            ];

            if (matchedCategoryIds.length > 0) {
                ftsConditions.push(inArray(auctions.categoryId, matchedCategoryIds));
            }

            conditions.push(sql`(${or(...ftsConditions)})`);
        }

        // Category filter
        let resolvedCategoryId = null;

        if (category && category !== 'All') {
            const cat = await db
                .select({ id: categories.id })
                .from(categories)
                .where(eq(categories.name, category))
                .limit(1);

            if (cat.length) {
                resolvedCategoryId = cat[0].id;
                conditions.push(eq(auctions.categoryId, resolvedCategoryId));
            }
        }

        if (minPrice) {
            conditions.push(gte(auctions.currentPrice, minPrice.toString()));
        }

        if (maxPrice) {
            conditions.push(lte(auctions.currentPrice, maxPrice.toString()));
        }

        // Status filter
        if (status && status !== 'all') {
            conditions.push(eq(auctions.status, status));
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
            case 'relevance':
            default:
                // Sort by relevance when searching, otherwise newest
                if (q && q.trim()) {
                    orderBy = sql`ts_rank(
                        to_tsvector('english'::regconfig, 
                            (COALESCE(${auctions.title}, ''::character varying))::text || ' '::text || 
                            COALESCE(${auctions.description}, ''::text)
                        ),
                        websearch_to_tsquery('english', ${q.trim()})
                    ) DESC`;
                } else {
                    orderBy = desc(auctions.createdAt);
                }
                break;
        }
        
        // Build where clause
        const whereClause = conditions.length > 0 ? and(...conditions) : null;
        
        // Main query
        const results = await db.query.auctions.findMany({
            where: whereClause,
            limit: limit,
            offset: offset,
            orderBy: orderBy,
            with: {
                seller: true,
                category: true,
                images: true,
                // Fetch only the highest bid
                bids: {
                    orderBy: [desc(bids.amount)],
                    limit: 1,
                    with: {
                        bidder: true // Fetch the bidder details
                    }
                }
            }
        });

        const countResult = await db
            .select({ count: count() })
            .from(auctions)
            .where(whereClause);

        const totalItems = countResult.length > 0 ? parseInt(countResult[0].count) : 0;

        return {
            data: results.map(row => {
                const highestBid = row.bids[0]; // Logic handled by 'limit: 1' in query
                const primaryImg = row.images[0]?.imageUrl || 'https://via.placeholder.com/300';

                return {
                    id: row.id,
                    title: row.title,
                    currentPrice: parseFloat(row.currentPrice),
                    startingPrice: row.startingPrice ? parseFloat(row.startingPrice) : null,
                    buyNowPrice: row.buyNowPrice ? parseFloat(row.buyNowPrice) : null,
                    endTime: row.endTime,
                    createdAt: row.createdAt,
                    bidCount: parseInt(row.bidCount || 0),
                    status: row.status,
                    
                    // Mapped Relations
                    category: row.category?.name,
                    categoryName: row.category?.name,
                    sellerName: row.seller?.fullName,
                    sellerId: row.sellerId,
                    primaryImage: primaryImg,
                    image: primaryImg,
                    
                    seller: {
                        name: row.seller?.fullName
                    },

                    highestBidder: highestBid ? {
                        id: highestBid.bidderId,
                        name: highestBid.bidder?.fullName,
                        amount: parseFloat(highestBid.amount)
                    } : null
                };
            }),
            total: totalItems
        };
    },
}

export default service;