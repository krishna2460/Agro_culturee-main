const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('buyer'));

router.route('/')
  .get(getCart)
  .post(addToCart);

router.route('/clear')
  .post(clearCart);

router.route('/:productId')
  .delete(removeFromCart);

module.exports = router;
