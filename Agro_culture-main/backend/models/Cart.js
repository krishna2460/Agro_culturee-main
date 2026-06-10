const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1, min: 1 },
  addedAt: { type: Date, default: Date.now }
});

const CartSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [CartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);
