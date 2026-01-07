import systemService from "../services/system.js";

const controller = {
    
    // GET /stats 
    getLiveStats: async function(req, res, next) {
        try {
            console.log("Fetching live stats...");
            const stats = await systemService.getLiveStats();
            res.json(stats);
        } catch (error) {
            next(error);
        }
    },

}

export default controller;