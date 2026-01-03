import { Router } from "express";
import requireAuth, { requireSeller } from "../middleware/auth.js";
import auctionController from "../controllers/auction.js"

const route = new Router();

// GET: All Auctions
route.get('/', auctionController.listAuctions);

// Get: Specific Auction
route.get('/:id', auctionController.getAuction);

route.use(requireAuth);

// POST: Create New Auction
route.post('/', requireSeller, auctionController.createAuction);

// PUT: Update Specific Auction
route.put('/:id', requireSeller, auctionController.updateAuction);

// DELETE: Remove Specific Auction
route.delete('/:id', auctionController.deleteAuction);

export default route;