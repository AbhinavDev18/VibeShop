const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mockDB = require('../config/mockDB');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    if (global.isMockDB) {
      return res.json(mockDB.products);
    } else {
      const products = await Product.find({});
      return res.json(products);
    }
  } catch (error) {
    console.error('Fetch products error:', error.message);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    if (global.isMockDB) {
      const product = mockDB.products.find((p) => p._id === req.params.id);
      if (product) {
        return res.json(product);
      } else {
        return res.status(404).json({ message: 'Product not found' });
      }
    } else {
      const product = await Product.findById(req.params.id);
      if (product) {
        return res.json(product);
      } else {
        return res.status(404).json({ message: 'Product not found' });
      }
    }
  } catch (error) {
    console.error('Fetch single product error:', error.message);
    res.status(500).json({ message: 'Server error fetching product' });
  }
});

module.exports = router;
