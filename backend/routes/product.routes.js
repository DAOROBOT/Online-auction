const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.get('/:id/related', productController.getRelated);

module.exports = router;
