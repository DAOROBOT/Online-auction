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
                return res.status(404).json({ message: 'Auction Not Found' });
            }
            
            res.json(auction);
        } catch (error) {
            next(error);
        }
    },

    // POST /auctions
    createAuction: async function(req, res, next) {
        try {
            const { title, startingPrice, stepPrice, buyNowPrice, endTime, categoryId, description, autoExtend, images } = req.body;

            // 1. Validate dữ liệu đầu vào
            if (!title || !startingPrice || !stepPrice || !endTime || !categoryId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            if (Number(stepPrice) <= 0) {
                return res.status(400).json({ message: 'Step price must be positive' });
            }

            if (buyNowPrice && Number(buyNowPrice) <= Number(startingPrice)) {
                return res.status(400).json({ message: 'Buy Now price must be greater than Starting price' });
            }

            if (!images || images.length < 3) {
                return res.status(400).json({ message: 'At least 3 images are required' });
            }

            // 2. Chuẩn bị dữ liệu để lưu
            const auctionData = {
                sellerId: req.user.id, // Lấy ID người đang đăng nhập
                categoryId: Number(categoryId),
                title,
                description,
                startingPrice: Number(startingPrice),
                currentPrice: Number(startingPrice), // Giá hiện tại = Giá khởi điểm lúc tạo
                stepPrice: Number(stepPrice),
                buyNowPrice: buyNowPrice ? Number(buyNowPrice) : null,
                endTime,
                autoExtend: autoExtend || false,
                images,
            };

            // 3. Gọi Service
            const auction = await auctionService.create(auctionData);

            if (!auction) {
                throw new Error('Failed to insert auction record.');
            }

            // const files = req.files;

            // if (!files || files.length === 0) {
            //     return res.status(400).json({ error: 'At least one image is required.' });
            // }

            // const imagesData = files.map((file, index) => ({
            //     auction_id: auction.auction_id,
            //     image_url: file.path,
            //     is_primary: index === 0
            // }));

            // const insertedImages = auctionService.upload(imagesData);

            return res.status(201).json({
                message: 'Auction created successfully!',
                auction: auction,
                // images: insertedImages
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
            
            // Check quyền sở hữu (chỉ người bán mới được sửa)
            const existingAuction = await auctionService.findById(id);
            if (!existingAuction) {
                return res.status(404).json({ message: 'Auction Not Found' });
            }
            
            if (existingAuction.sellerId !== req.user.id) {
                return res.status(403).json({ message: 'Unauthorized to update this auction' });
            }

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

            const existingAuction = await auctionService.findById(id);
            if (!existingAuction) {
                return res.status(404).json({ message: 'Auction Not Found' });
            }

            // Check quyền (Admin hoặc chính chủ mới được xóa)
            if (req.user.role !== 'admin' && existingAuction.sellerId !== req.user.id) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            await auctionService.delete(id);
            res.json({ message: 'Deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

export default controller;