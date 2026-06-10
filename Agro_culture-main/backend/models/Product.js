const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  info: { type: String },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: 'blank.png' },
  picStatus: { type: Number, default: 0 },
  reviews: [ReviewSchema]
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
