import db from "../db/index.js";
import { categories } from "../db/schema.js";
import { eq, isNull } from "drizzle-orm";

const service = {
    findAll: async function(){
        const mainCategories = await db.select({
            id: categories.id,
            name: categories.name,
        }).from(categories).where(isNull(categories.parentId));
        console.log('Main Categories:', mainCategories);
        const categoriesWithSub = [];
        for (const mainCat of mainCategories) {
            const subCategories = await db.select({
                id: categories.id,
                name: categories.name,
            }).from(categories).where(eq(categories.parentId, mainCat.id));
            categoriesWithSub.push({
                ...mainCat,
                subcategories: subCategories
            });
        }
        console.log('Categories with Subcategories:', categoriesWithSub);
        return categoriesWithSub;
    },
}

export default service;