import db from "../db/index.js"
import { auctions, auctionImages } from "../db/schema.js"
import { eq } from "drizzle-orm";

const service = {
    findAll: async function(){
        const result = await db.select().from(auctions);
        return result.length > 0 ? result[0] : null
    },
    findById: async function(id){
        const result = await db.select().from(auctions).where(eq(auctions.id, id));
        return result.length > 0 ? result[0] : null
    },
    create: async function(auction){
        auction.createdAt = auction.createdAt ? new Date(auction.createdAt) : new Date();
        auction.endTime = auction.endTime ? new Date(auction.endTime) : new Date(auction.createdAt.getTime() + 24*60*60*1000); // default to 24 hours later
        return await db.insert(auctions).values(auction).returning();
    },
    upload: async function(images){
        return await db.insert(auctionImages).values(images).returning();
    },
    update: async function(id, auc){
        if(auc.createdAt) {
            auc.createdAt = new Date(auc.createdAt);
        }
        if(auc.endTime) {
            auc.endTime = new Date(auc.endTime);
        }
        await db.update(auctions).set(auc).where(eq(auctions.id, id));
    },
    delete: async function(id){
        console.log('Deleting auction with ID:', id);
        await db.delete(auctions).where(eq(auctions.id, id));
    }
}

export default service;