import auctionService from "../services/auction.service.js";
const controller = {
  /**
   * GET all auctions with optional filters
   */
  listAuctions: function (req, res, next) {
    // const filters = {
    //   status: req.query.status,
    //   category: req.query.category,
    //   sellerId: req.query.sellerId
    // };
    
    // // Remove undefined filters
    // Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    auctionService.findAll().then((auctions) => {
      res.json({
        success: true,
        message: 'auctions retrieved successfully',
        data: auctions,
        count: auctions.length
      });
    }).catch(next);
  },

  /**
   * GET auction by ID
   */
  getAuction: function (req, res, next) {
    const id = Number(req.params.id);
    auctionService.findById(id).then((auction) => {
      if (auction) {
        res.json({
          success: true,
          message: 'auction retrieved successfully',
          data: auction
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'auction not found',
        });
      }
    }).catch(next);
  },

  /**
   * POST create a new auction
   */
  createAuction: function (req, res, next) {
    auctionService.create(req.body).then((newAuction) => {
      res.status(201).json({
        success: true,
        message: 'auction created successfully',
        data: newAuction
      });
    }).catch(next);
  },

  /**
   * PUT update a auction
   */
  updateAuction: function(req, res, next) {
    const id = Number(req.params.id);
    const auction = req.body;
    
    auctionService.findById(id).then((found) => {
      if (!found) {
        res.status(404).json({
          success: false,
          message: 'auction not found',
        });
      } else {
        auctionService.update(id, auction).then((updatedauction) => {
          res.json({
            success: true,
            message: 'auction updated successfully',
            data: updatedauction
          });
        }).catch(next);
      }
    }).catch(next);
  },

  /**
   * DELETE a auction
   */
  deleteAuction: function (req, res, next) {
    const id = Number(req.params.id);
    auctionService.findById(id).then((auction) => {
      if (!auction) {
        res.status(404).json({
          success: false,
          message: 'auction not found',
        });
      } else {
        auctionService.delete(id).then((deletedAuction) => {
          res.json({
            success: true,
            message: 'auction deleted successfully',
            data: deletedAuction
          });
        }).catch(next);
      }
    }).catch(next);
  },

  // /**
  //  * GET auctions by seller ID
  //  */
  // getauctionsBySeller: function (req, res, next) {
  //   const sellerId = Number(req.params.sellerId);
  //   auctionService.findBySellerId(sellerId).then((auctions) => {
  //     res.json({
  //       success: true,
  //       message: 'Seller auctions retrieved successfully',
  //       data: auctions,
  //       count: auctions.length
  //     });
  //   }).catch(next);
  // },

  // /**
  //  * GET active auctions only
  //  */
  // getActiveauctions: function (req, res, next) {
  //   auctionService.findActive().then((auctions) => {
  //     res.json({
  //       success: true,
  //       message: 'Active auctions retrieved successfully',
  //       data: auctions,
  //       count: auctions.length
  //     });
  //   }).catch(next);
  // }
}

export default controller;