import express from 'express';
import auctionController from '../controllers/auction.controller.js';

const router = express.Router();

/**
 * GET all auctions
 * Query params: status, category, sellerId
 */
router.get('/', auctionController.listAuctions);

// /**
//  * GET active auctions only
//  */
// router.get('/active/list', auctionController.getActiveauctions);

// /**
//  * GET auctions by seller ID
//  */
// router.get('/seller/:sellerId', auctionController.getauctionsBySeller);

/**
 * GET auction by ID
 */
router.get('/:id', auctionController.getAuction);

/**
 * POST create a new auction
 * Body: { name, description, price, startingBid, currentBid, category, imageUrl, status, sellerId, auctionEndTime }
 */
router.post('/', auctionController.createAuction);

/**
 * PUT update a auction
 * Body: { name, description, price, startingBid, currentBid, category, imageUrl, status, auctionEndTime }
 */
router.put('/:id', auctionController.updateAuction);

/**
 * DELETE a auction
 */
router.delete('/:id', auctionController.deleteAuction);

export default router;
