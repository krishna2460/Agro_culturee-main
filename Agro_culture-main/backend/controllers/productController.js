const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const category = req.query.category;
    const query = category ? { category } : {};
    const products = await Product.find(query).populate('farmerId', 'username profile.name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('farmerId', 'username profile.name profile.address mobile');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product (Farmer Only)
// @route   POST /api/products
// @access  Private/Farmer
const createProduct = async (req, res) => {
  try {
    const { name, category, info, price, image } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ message: 'Name, category, and price are required' });
    }

    const product = new Product({
      farmerId: req.user._id,
      name,
      category,
      info: info || '',
      price: Number(price),
      image: image || 'blank.png',
      picStatus: image ? 1 : 0
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      const review = {
        name: req.user.profile.name || req.user.username,
        rating: Number(rating),
        comment,
        createdAt: new Date()
      };

      product.reviews.push(review);
      await product.save();

      res.status(201).json({ message: 'Review added successfully', product });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  createProductReview
};
