const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  createProductReview
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, authorize('farmer'), createProduct);

router.route('/:id')
  .get(getProductById);

router.route('/:id/reviews')
  .post(protect, createProductReview);

module.exports = router;
