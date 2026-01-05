import { Router } from "express";
import requireAuth, { requireSeller } from "../middleware/auth.js";
import auctionController from "../controllers/auction.js"
import { uploadProductImage } from "../config/cloudinary.js";

const route = new Router();

// GET: All Auctions
route.get('/', auctionController.list);

// Get: Specific Auction
route.get('/:id', auctionController.get);

route.use(requireAuth);

// POST: Create New Auction
route.post('/', requireSeller, uploadProductImage.array('images', 10), auctionController.create);

// PUT: Update Specific Auction
route.put('/:id', requireSeller, auctionController.update);

// DELETE: Remove Specific Auction
route.delete('/:id', auctionController.delete);

export default route;