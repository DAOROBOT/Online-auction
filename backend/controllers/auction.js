import auctionService from "../services/auction.js";

const controller = {
    
    // GET /auctions
    list: async function(req, res, next) {
        try {
            const auctions = await auctionService.findAll();
            res.json(auctions);
        } catch (error) {
            next(error);
        }
    },

    // GET /auctions/:id
    get: async function(req, res, next) {
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
    create: async function(req, res, next) {
        try {
            const [newAuction] = auctionService.create(req.body);

            if (!newAuction) {
                throw new Error('Failed to insert auction record.');
            }

            // Extract Files
            const files = req.files;

            if (!files || files.length === 0) {
                return res.status(400).json({ error: 'At least one image is required.' });
            }

            const images = files.map((file, index) => ({
                auction_id: newAuction.auction_id,
                image_url: file.path,
                is_primary: index === 0
            }));

            const insertedImages = auctionService.upload(images);

            return res.status(201).json({
                message: 'Auction created successfully!',
                auction: newAuction,
                images: insertedImages
            });

        } catch (error) {
            console.error('Create Auction Error:', error);
            return res.status(500).json({ error: error.message });
        }
    },

    // PUT /auctions/:id
    update: async function(req, res, next) {
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
    delete: async function(req, res, next) {
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