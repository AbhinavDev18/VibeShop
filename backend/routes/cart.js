const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mockDB = require('../config/mockDB');
const { protect } = require('../middleware/auth');

// Helper to find/create cart in Mock DB
const getMockCart = (userId) => {
  if (!mockDB.carts[userId]) {
    mockDB.carts[userId] = {
      user: userId,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  return mockDB.carts[userId];
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (global.isMockDB) {
      const cart = getMockCart(req.user._id);

      // Populate products manually
      const populatedItems = cart.items.map(item => {
        if (item.type === 'single') {
          const productDetail = mockDB.products.find(p => p._id === String(item.product));
          return { ...item, product: productDetail };
        } else {
          const productDetails = item.products.map(prodId => 
            mockDB.products.find(p => p._id === String(prodId))
          ).filter(Boolean);
          return { ...item, products: productDetails };
        }
      });

      return res.json({ ...cart, items: populatedItems });
    } else {
      let cart = await Cart.findOne({ user: req.user._id })
        .populate('items.product')
        .populate('items.products');
      
      if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
      }
      return res.json(cart);
    }
  } catch (error) {
    console.error('Fetch cart error:', error.message);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
router.post('/add', protect, async (req, res) => {
  const { type, productId, productIds, customName, discount } = req.body;

  try {
    if (global.isMockDB) {
      const cart = getMockCart(req.user._id);

      if (type === 'single') {
        // Find if product exists in products list
        const productExists = mockDB.products.find(p => p._id === productId);
        if (!productExists) {
          return res.status(404).json({ message: 'Product not found' });
        }

        // Check if single item is already in cart
        const existingItem = cart.items.find(
          item => item.type === 'single' && String(item.product) === productId
        );

        if (existingItem) {
          existingItem.qty += 1;
        } else {
          cart.items.push({
            _id: 'citem_' + Date.now() + Math.random().toString(36).substr(2, 5),
            type: 'single',
            product: productId,
            qty: 1
          });
        }
      } else if (type === 'combined') {
        // Check if a combined bundle with the exact same custom name already exists
        const existingItem = cart.items.find(
          item => item.type === 'combined' && item.customName === customName
        );

        if (existingItem) {
          existingItem.qty += 1;
        } else {
          cart.items.push({
            _id: 'citem_' + Date.now() + Math.random().toString(36).substr(2, 5),
            type: 'combined',
            products: productIds,
            customName: customName,
            discount: discount || 0,
            qty: 1
          });
        }
      }

      // Return populated cart
      const populatedItems = cart.items.map(item => {
        if (item.type === 'single') {
          const productDetail = mockDB.products.find(p => p._id === String(item.product));
          return { ...item, product: productDetail };
        } else {
          const productDetails = item.products.map(prodId => 
            mockDB.products.find(p => p._id === String(prodId))
          ).filter(Boolean);
          return { ...item, products: productDetails };
        }
      });

      return res.json({ ...cart, items: populatedItems });

    } else {
      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
      }

      if (type === 'single') {
        const existingItem = cart.items.find(
          item => item.type === 'single' && item.product && item.product.toString() === productId
        );

        if (existingItem) {
          existingItem.qty += 1;
        } else {
          cart.items.push({
            type: 'single',
            product: productId,
            qty: 1
          });
        }
      } else if (type === 'combined') {
        const existingItem = cart.items.find(
          item => item.type === 'combined' && item.customName === customName
        );

        if (existingItem) {
          existingItem.qty += 1;
        } else {
          cart.items.push({
            type: 'combined',
            products: productIds,
            customName: customName,
            discount: discount || 0,
            qty: 1
          });
        }
      }

      await cart.save();

      const populatedCart = await Cart.findById(cart._id)
        .populate('items.product')
        .populate('items.products');

      return res.json(populatedCart);
    }
  } catch (error) {
    console.error('Add to cart error:', error.message);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:id
// @access  Private
router.put('/update/:id', protect, async (req, res) => {
  const itemId = req.params.id;
  const { qty } = req.body;

  if (qty === undefined || Number(qty) < 1) {
    return res.status(400).json({ message: 'Valid quantity is required' });
  }

  try {
    if (global.isMockDB) {
      const cart = getMockCart(req.user._id);

      const cartItem = cart.items.find(item => String(item._id) === itemId);
      if (!cartItem) {
        return res.status(404).json({ message: 'Cart item not found' });
      }

      cartItem.qty = Number(qty);

      // Return populated
      const populatedItems = cart.items.map(item => {
        if (item.type === 'single') {
          const productDetail = mockDB.products.find(p => p._id === String(item.product));
          return { ...item, product: productDetail };
        } else {
          const productDetails = item.products.map(prodId => 
            mockDB.products.find(p => p._id === String(prodId))
          ).filter(Boolean);
          return { ...item, products: productDetails };
        }
      });

      return res.json({ ...cart, items: populatedItems });

    } else {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      const cartItem = cart.items.find(item => item._id.toString() === itemId);
      if (!cartItem) {
        return res.status(404).json({ message: 'Cart item not found' });
      }

      cartItem.qty = Number(qty);
      await cart.save();

      const populatedCart = await Cart.findById(cart._id)
        .populate('items.product')
        .populate('items.products');

      return res.json(populatedCart);
    }
  } catch (error) {
    console.error('Update cart item error:', error.message);
    res.status(500).json({ message: 'Server error updating cart quantity' });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  const itemId = req.params.id;

  try {
    if (global.isMockDB) {
      const cart = getMockCart(req.user._id);

      cart.items = cart.items.filter(item => String(item._id) !== itemId);

      // Return populated
      const populatedItems = cart.items.map(item => {
        if (item.type === 'single') {
          const productDetail = mockDB.products.find(p => p._id === String(item.product));
          return { ...item, product: productDetail };
        } else {
          const productDetails = item.products.map(prodId => 
            mockDB.products.find(p => p._id === String(prodId))
          ).filter(Boolean);
          return { ...item, products: productDetails };
        }
      });

      return res.json({ ...cart, items: populatedItems });

    } else {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      cart.items = cart.items.filter(item => item._id.toString() !== itemId);
      await cart.save();

      const populatedCart = await Cart.findById(cart._id)
        .populate('items.product')
        .populate('items.products');

      return res.json(populatedCart);
    }
  } catch (error) {
    console.error('Remove cart item error:', error.message);
    res.status(500).json({ message: 'Server error removing item from cart' });
  }
});

// @desc    Checkout / Clear cart
// @route   POST /api/cart/checkout
// @access  Private
router.post('/checkout', protect, async (req, res) => {
  try {
    if (global.isMockDB) {
      const cart = getMockCart(req.user._id);
      cart.items = [];
      return res.json({ message: 'Checkout successful', items: [] });
    } else {
      const cart = await Cart.findOne({ user: req.user._id });
      if (cart) {
        cart.items = [];
        await cart.save();
      }
      return res.json({ message: 'Checkout successful', items: [] });
    }
  } catch (error) {
    console.error('Checkout error:', error.message);
    res.status(500).json({ message: 'Server error during checkout' });
  }
});

module.exports = router;
