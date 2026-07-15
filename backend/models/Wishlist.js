const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['single', 'combined'],
    required: true,
    default: 'single'
  },
  // Used if type is 'single'
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  // Used if type is 'combined'
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  customName: {
    type: String
  },
  discount: {
    type: Number,
    default: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [wishlistItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
