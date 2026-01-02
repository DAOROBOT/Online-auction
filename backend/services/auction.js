import db from "../db/index.js"
import { auctions } from "../db/schema.js"
import { eq } from "drizzle-orm";

const service = {
    findAll: async function(){
        return db.select().from(auctions);
    },
    findById: async function(id){
        return await db.select().from(auctions).where(eq(auctions.id, id));
    },
    create: async function(auction){
        if(auction.created_at) {
            auction.created_at = new Date(auction.created_at);
        }
        if(auction.end_time) {
            auction.end_time = new Date(auction.end_time);
        }
        return await db.insert(auctions).values(auction).returning();
    },
    update: async function(id, auc){
        if(auc.created_at) {
            auc.created_at = new Date(auc.created_at);
        }
        if(auc.end_time) {
            auc.end_time = new Date(auc.end_time);
        }
        await db.update(auctions).set(auc).where(eq(auctions.id, id));
    },
    delete: async function(id){
        console.log('Deleting auction with ID:', id);
        await db.delete(auctions).where(eq(auctions.id, id));
    }
}

export default service;