const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['single', 'combined'],
    required: true,
    default: 'single'
  },
  // If single product
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  // If combined bundle of products
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  customName: {
    type: String
  },
  discount: {
    type: Number,
    default: 0
  },
  qty: {
    type: Number,
    required: true,
    default: 1
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
