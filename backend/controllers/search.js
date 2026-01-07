import searchService from "../services/search.js";

const controller = {
    
    // GET /search
    searchAuctions: async function(req, res, next) {
        try {
            const { q, category, minPrice, maxPrice, sortBy, page, status } = req.query;
            console.log(req.query);
            const pageNum = parseInt(page) || 1;
            const limit = 12;
            const offset = (pageNum - 1) * limit;
            console.log({ q, category, minPrice, maxPrice, sortBy, pageNum, limit, offset });
            
            const result = await searchService.findAuctions({
                q,
                category,
                minPrice: minPrice ? parseFloat(minPrice) : null,
                maxPrice: maxPrice ? parseFloat(maxPrice) : null,
                sortBy,
                limit,
                offset,
                status
            });
        
            res.json({
                data: result.data,
                metadata:{
                    page: pageNum,
                    totalPages: Math.ceil(result.total / limit),
                    totalItems: result.total,
                    itemsInPage: result.data.length
                },
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /search/favorites
    searchFavorites: async function(req, res, next) {
        try {
            const { q, category, minPrice, maxPrice, sortBy, page, status } = req.query;
            console.log(req.query);
            const pageNum = parseInt(page) || 1;
            const limit = 12;
            const offset = (pageNum - 1) * limit;
            console.log({ q, category, minPrice, maxPrice, sortBy, pageNum, limit, offset });
            
            const result = await searchService.findFavorites({
                q,
                category,
                minPrice: minPrice ? parseFloat(minPrice) : null,
                maxPrice: maxPrice ? parseFloat(maxPrice) : null,
                sortBy,
                limit,
                offset,
                status
            });
        
            res.json({
                data: result.data,
                metadata:{
                    page: pageNum,
                    totalPages: Math.ceil(result.total / limit),
                    totalItems: result.total,
                    itemsInPage: result.data.length
                },
            });
        } catch (error) {
            next(error);
        }
    },  

}

export default controller;