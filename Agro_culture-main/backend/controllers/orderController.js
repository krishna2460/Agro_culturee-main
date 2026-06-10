const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Buyer
const createOrder = async (req, res) => {
  try {
    const { name, addr, city, pincode, mobile, email, products } = req.body;

    if (!name || !addr || !city || !pincode || !mobile || !email || !products || products.length === 0) {
      return res.status(400).json({ message: 'Order details and products are required' });
    }

    // Map items to snapshot structure
    const orderProducts = [];
    for (const item of products) {
      const prod = await Product.findById(item.productId);
      if (!prod) {
        return res.status(404).json({ message: `Product not found with ID ${item.productId}` });
      }
      orderProducts.push({
        productId: prod._id,
        name: prod.name,
        price: prod.price,
        category: prod.category,
        quantity: Number(item.quantity) || 1
      });
    }

    const order = new Order({
      buyerId: req.user._id,
      shippingAddress: {
        name,
        addr,
        city,
        pincode,
        mobile,
        email
      },
      products: orderProducts,
      status: 'pending'
    });

    const createdOrder = await order.save();

    // Clear buyer's cart after successful checkout
    const cart = await Cart.findOne({ buyerId: req.user._id });
    if (cart) {
      cart.products = [];
      await cart.save();
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders
};
