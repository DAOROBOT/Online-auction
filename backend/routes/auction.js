import { Router } from "express";
import requireAuth, { requireSeller } from "../middleware/auth.js";
import auctionController from "../controllers/auction.js"
import { uploadProductImage } from "../config/cloudinary.js";

const route = new Router();

// GET: Top Auctions
route.get('/top', auctionController.listTop);

// GET: Personal Auctions
route.get('/profile', auctionController.listProfile);

// GET: Auction Images
route.get('/images/:id', auctionController.getImages);

// GET: Auction Bids
route.get('/bids/:id', auctionController.getBidHistory);

// GET: Auction Description
route.get('/description/:id', auctionController.getDescription);

// GET: Auction Comments
route.get('/comments/:id', auctionController.getComments);

// Get: Specific Auction
route.get('/:id', auctionController.getById);

route.use(requireAuth);

// POST: Create New Auction
route.post('/', requireSeller, uploadProductImage.array('images', 10), auctionController.create);

// PUT: Update Specific Auction
route.put('/:id', requireSeller, auctionController.update);

// DELETE: Remove Specific Auction
route.delete('/:id', auctionController.delete);

// POST: Place a bid (Auto Bidding supported)
route.post('/:id/bid', requireAuth, auctionController.placeBid);

export default route;