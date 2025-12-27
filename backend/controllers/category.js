import categoryService from "../services/category.js";

const controller = {
    
    // GET /categories
    listCategories: async function(req, res, next) {
        try {
            const categories = await categoryService.findAll();
            console.log(categories);
            res.json(categories);
        } catch (error) {
            next(error);
        }
    },

}

export default controller;