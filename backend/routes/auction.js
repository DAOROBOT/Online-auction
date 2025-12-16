import { Router } from "express";
import auctionController from "../controllers/auction.js"
const route = new Router();

// GET: List Auction
route.get('/', auctionController.listAuction);

// Get: Specific Auction
route.get('/:id', auctionController.getAuction);

// POST: Create  Auction
route.post('/', auctionController.createAuction);

// PUT: Update Auction
route.put('/:id', auctionController.updateAuction);

// DELETE: Remove Auction
route.delete('/:id', auctionController.deleteAuction);

export default route;