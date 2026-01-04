import auctionService from "../services/auction.js";

const controller = {
    
    // GET /auctions
    listAuctions: async function(req, res, next) {
        try {
            const auctions = await auctionService.findAll();
            res.json(auctions);
        } catch (error) {
            next(error);
        }
    },

    // GET /auctions/:id
    getAuction: async function(req, res, next) {
        try {
            const id = Number(req.params.id);
            const auction = await auctionService.findById(id);
            
            if (!auction) {
                res.status(404);
                throw new Error('Auction Not Found');
            }
            
            res.json(auction);
        } catch (error) {
            next(error);
        }
    },

    // POST /auctions
    createAuction: async function(req, res, next) {
        try {
            const { title, startingPrice, stepPrice, buyNowPrice, endTime, categoryId } = req.body;

            // --- VALIDATION ---
            if (!title || !startingPrice || !stepPrice || !endTime || !categoryId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            if (Number(stepPrice) <= 0) {
                return res.status(400).json({ message: 'Step price must be positive' });
            }

            if (buyNowPrice && Number(buyNowPrice) <= Number(startingPrice)) {
                return res.status(400).json({ message: 'Buy Now price must be greater than Starting price' });
            }

            // Gán sellerId từ user đang đăng nhập (đã có từ middleware auth)
            const auctionData = {
                ...req.body,
                sellerId: req.user.id, 
                currentPrice: Number(startingPrice) // Giá hiện tại ban đầu = Giá khởi điểm
            };

            const auction = await auctionService.create(auctionData);
            res.status(201).json(auction);
        } catch (error) {
            next(error);
        }
    },

    // PUT /auctions/:id
    updateAuction: async function(req, res, next) {
        try {
            const id = Number(req.params.id);
            
            // 1. Check if it exists
            const existingAuction = await auctionService.findById(id);
            if (!existingAuction) {
                res.status(404);
                throw new Error('Auction Not Found');
            }

            // 2. Update
            const updatedAuction = await auctionService.update(id, req.body);
            res.json(updatedAuction);
        } catch (error) {
            next(error);
        }
    },

    // DELETE /auctions/:id
    deleteAuction: async function(req, res, next) {
        try {
            const id = Number(req.params.id);

            // 1. Check if it exists
            const existingAuction = await auctionService.findById(id);
            if (!existingAuction) {
                res.status(404);
                throw new Error('Auction Not Found');
            }

            // 2. Delete
            await auctionService.delete(id);
            res.json({}); // Return empty JSON on success
        } catch (error) {
            next(error);
        }
    }
}

export default controller;