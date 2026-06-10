const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const OrderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shippingAddress: {
    name: { type: String, required: true },
    addr: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true }
  },
  products: [OrderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
