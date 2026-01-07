import auctionService from "../services/auction.js";

const controller = {
    
    // GET /auctions/top
    listTop: async function(req, res, next) {
        try {
            const { userId, status, sortBy, page, limit } = req.query;
            const viewId = req.user ? req.user.id : null;
            
            const auctions = await auctionService.findByOrder({ 
                userId: userId ? parseInt(userId) : null,
                viewId: viewId ? parseInt(viewId) : null,
                status: status || 'active',
                sortBy: sortBy || 'newest',
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 5,
            });

            res.json(auctions);
        } catch (error) {
            next(error);
        }
    },

    listProfile: async function(req, res, next) {
        try {
            const { username, status, category } = req.query;

            if (!username || !status) {
                return res.status(400).json({ error: "Missing Required Fields" });
            }

            const results = await auctionService.findByStatus(username, status, category);

            return res.status(200).json(results);

        } catch (error) {
            console.error("Tab Query Error:", error);
            return res.status(500).json({ error: "Internal Server Error" });
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
    create: async function(req, res, next) {
        try {
            const { title, startingPrice, stepPrice, buyNowPrice, endTime, categoryId, description, autoExtend } = req.body;
            const images = req.files;

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
            const info = {
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
            };

            // 3. Gọi Service
            const auction = await auctionService.create(info, images);

            if (!auction) {
                throw new Error('Failed to insert auction record.');
            }

            return res.status(201).json({
                message: 'Auction created successfully!',
                auction: auction,
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