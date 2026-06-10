const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get logged in user's cart
// @route   GET /api/cart
// @access  Private/Buyer
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ buyerId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ buyerId: req.user._id, products: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private/Buyer
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ buyerId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ buyerId: req.user._id, products: [] });
    }

    const itemIdx = cart.products.findIndex(
      (p) => p.productId.toString() === productId.toString()
    );

    if (itemIdx > -1) {
      // Product exists, increment quantity
      cart.products[itemIdx].quantity += qty;
    } else {
      // Add new item
      cart.products.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: qty
      });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private/Buyer
const removeFromCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const cart = await Cart.findOne({ buyerId: req.user._id });

    if (cart) {
      cart.products = cart.products.filter(
        (p) => p.productId.toString() !== productId.toString()
      );
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   POST /api/cart/clear
// @access  Private/Buyer
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyerId: req.user._id });

    if (cart) {
      cart.products = [];
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};
