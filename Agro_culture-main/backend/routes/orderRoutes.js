const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('buyer'), createOrder);

router.route('/myorders')
  .get(protect, getMyOrders);

module.exports = router;
