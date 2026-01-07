import db from "../db/index.js"
import { auctions, categories, auctionImages, bids } from "../db/schema.js"
import { sql, eq, and, desc, asc, count, inArray, gte, lte } from "drizzle-orm";

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

        // Full-text search condition - MUST MATCH INDEX EXACTLY
        if (q && q.trim()) {
            const searchQuery = q.trim();
            conditions.push(sql`(
                to_tsvector('english'::regconfig, 
                    (COALESCE(${auctions.title}, ''::character varying))::text || ' '::text || 
                    COALESCE(${auctions.description}, ''::text)
                ) @@ websearch_to_tsquery('english', ${searchQuery})
                OR
                ${auctions.categoryId} IN (
                    SELECT ${categories.id}
                    FROM ${categories}
                    WHERE to_tsvector('english'::regconfig, 
                        (COALESCE(${categories.name}, ''::character varying))::text
                    ) @@ websearch_to_tsquery('english', ${searchQuery})
                )
            )`)
        }

        // Category filter
        if (category && category !== 'All') {
            conditions.push(
                sql`${auctions.categoryId} IN (
                    SELECT ${categories.id}
                    FROM ${categories}
                    WHERE ${categories.name} = ${category}
                )`
            );
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

        // const countResult = await db
        //     .select({ count: count() })
        //     .from(auctions)
        //     .where(whereClause);

        // const totalItems = countResult.length > 0 ? parseInt(countResult[0].count) : 0;

        // Fetch highest bids per auction
        return {
            data: results,
            // total: totalItems
        };
    },
}

export default service;