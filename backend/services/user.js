import db from "../db/index.js"

import {users} from "../db/schema.js"

import { eq } from "drizzle-orm";

import dotenv from 'dotenv'

dotenv.config();




const service = {
    findAll: async function(){
        return db.select().from(users);
    },
    getById: async function(id){
        return db.select().from(users).where(eq(users.userId, id));
    },
    getByEmail: async function(email){
        const result = await db.select().from(users).where(eq(users.email, email));
        return result.length > 0 ? result[0] : null;
    },
    getByUsername: async function(username){
        const result = await db.select().from(users).where(eq(users.username, username));
        // return result.length > 0 ? result[0] : null;
        return result;
    },
    create: async function(userData){
        const result = await db.insert(users).values(userData).returning();
        return result[0];
    },
    update: async function(id, user){
        if(user.createdAt) {
            user.createdAt = new Date(user.createdAt);
        }
        return db.update(users).set(user).where(eq(users.userId, id));
    },
    delete: async function(id){
        return db.delete(users).where(eq(users.userId, id));
    }
}

export default service;

