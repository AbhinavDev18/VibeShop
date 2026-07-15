const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const mockDB = require('../config/mockDB');
const { protect } = require('../middleware/auth');

// Helper to find/create wishlist in Mock DB
const getMockWishlist = (userId) => {
  if (!mockDB.wishlists[userId]) {
    mockDB.wishlists[userId] = {
      user: userId,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  return mockDB.wishlists[userId];
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (global.isMockDB) {
      const wishlist = getMockWishlist(req.user._id);
      
      // Populate products manually in mock mode
      const populatedItems = wishlist.items.map(item => {
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

      return res.json({ ...wishlist, items: populatedItems });
    } else {
      let wishlist = await Wishlist.findOne({ user: req.user._id })
        .populate('items.product')
        .populate('items.products');
      
      if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user._id, items: [] });
      }
      return res.json(wishlist);
    }
  } catch (error) {
    console.error('Fetch wishlist error:', error.message);
    res.status(500).json({ message: 'Server error fetching wishlist' });
  }
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
// @access  Private
router.post('/add', protect, async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    if (global.isMockDB) {
      const wishlist = getMockWishlist(req.user._id);
      
      // Check if product exists in products list
      const productExists = mockDB.products.find(p => p._id === productId);
      if (!productExists) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check if product is already in wishlist as a single item
      const itemExists = wishlist.items.find(
        item => item.type === 'single' && String(item.product) === productId
      );

      if (itemExists) {
        return res.status(400).json({ message: 'Product already in wishlist' });
      }

      wishlist.items.push({
        _id: 'witem_' + Date.now() + Math.random().toString(36).substr(2, 5),
        type: 'single',
        product: productId,
        createdAt: new Date()
      });

      // Prepare populated items to return
      const populatedItems = wishlist.items.map(item => {
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

      return res.json({ ...wishlist, items: populatedItems });
    } else {
      let wishlist = await Wishlist.findOne({ user: req.user._id });
      if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user._id, items: [] });
      }

      // Check if item already exists
      const itemExists = wishlist.items.find(
        item => item.type === 'single' && item.product && item.product.toString() === productId
      );

      if (itemExists) {
        return res.status(400).json({ message: 'Product already in wishlist' });
      }

      wishlist.items.push({
        type: 'single',
        product: productId
      });

      await wishlist.save();
      
      const populatedWishlist = await Wishlist.findById(wishlist._id)
        .populate('items.product')
        .populate('items.products');

      return res.json(populatedWishlist);
    }
  } catch (error) {
    console.error('Add to wishlist error:', error.message);
    res.status(500).json({ message: 'Server error adding to wishlist' });
  }
});

// @desc    Delete item from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  const itemId = req.params.id;

  try {
    if (global.isMockDB) {
      const wishlist = getMockWishlist(req.user._id);
      
      const initialLength = wishlist.items.length;
      wishlist.items = wishlist.items.filter(item => String(item._id) !== itemId);

      if (wishlist.items.length === initialLength) {
        return res.status(404).json({ message: 'Wishlist item not found' });
      }

      // Return populated
      const populatedItems = wishlist.items.map(item => {
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

      return res.json({ ...wishlist, items: populatedItems });
    } else {
      const wishlist = await Wishlist.findOne({ user: req.user._id });
      if (!wishlist) {
        return res.status(404).json({ message: 'Wishlist not found' });
      }

      wishlist.items = wishlist.items.filter(item => item._id.toString() !== itemId);
      await wishlist.save();

      const populatedWishlist = await Wishlist.findById(wishlist._id)
        .populate('items.product')
        .populate('items.products');

      return res.json(populatedWishlist);
    }
  } catch (error) {
    console.error('Delete wishlist item error:', error.message);
    res.status(500).json({ message: 'Server error removing wishlist item' });
  }
});

// @desc    Combine multiple wishlist items
// @route   POST /api/wishlist/combine
// @access  Private
router.post('/combine', protect, async (req, res) => {
  const { itemIds, customName, discount } = req.body;

  if (!itemIds || !Array.isArray(itemIds) || itemIds.length < 2) {
    return res.status(400).json({ message: 'Please select at least 2 wishlist items to combine' });
  }

  try {
    let flattenedProductIds = [];

    if (global.isMockDB) {
      const wishlist = getMockWishlist(req.user._id);

      // Find the selected items
      const selectedItems = wishlist.items.filter(item => itemIds.includes(String(item._id)));
      
      if (selectedItems.length < 2) {
        return res.status(400).json({ message: 'Some selected items were not found' });
      }

      // Extract and flatten product IDs
      selectedItems.forEach(item => {
        if (item.type === 'single') {
          flattenedProductIds.push(String(item.product));
        } else if (item.type === 'combined') {
          // Flatten existing combined items
          item.products.forEach(pId => flattenedProductIds.push(String(pId)));
        }
      });

      // Remove duplicates just in case
      flattenedProductIds = [...new Set(flattenedProductIds)];

      // Delete the original selected items
      wishlist.items = wishlist.items.filter(item => !itemIds.includes(String(item._id)));

      // Add the new combined item
      wishlist.items.push({
        _id: 'witem_' + Date.now() + Math.random().toString(36).substr(2, 5),
        type: 'combined',
        products: flattenedProductIds,
        customName: customName || `Combo of ${flattenedProductIds.length} Items`,
        discount: discount !== undefined ? Number(discount) : 10,
        createdAt: new Date()
      });

      // Return populated
      const populatedItems = wishlist.items.map(item => {
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

      return res.json({ ...wishlist, items: populatedItems });

    } else {
      const wishlist = await Wishlist.findOne({ user: req.user._id });
      if (!wishlist) {
        return res.status(404).json({ message: 'Wishlist not found' });
      }

      // Find selected items
      const selectedItems = wishlist.items.filter(item => itemIds.includes(item._id.toString()));

      if (selectedItems.length < 2) {
        return res.status(400).json({ message: 'Some selected items were not found' });
      }

      // Extract and flatten products
      selectedItems.forEach(item => {
        if (item.type === 'single') {
          flattenedProductIds.push(item.product.toString());
        } else if (item.type === 'combined') {
          item.products.forEach(pId => flattenedProductIds.push(pId.toString()));
        }
      });

      flattenedProductIds = [...new Set(flattenedProductIds)];

      // Remove the old items
      wishlist.items = wishlist.items.filter(item => !itemIds.includes(item._id.toString()));

      // Add the new combined item
      wishlist.items.push({
        type: 'combined',
        products: flattenedProductIds,
        customName: customName || `Combo of ${flattenedProductIds.length} Items`,
        discount: discount !== undefined ? Number(discount) : 10
      });

      await wishlist.save();

      const populatedWishlist = await Wishlist.findById(wishlist._id)
        .populate('items.product')
        .populate('items.products');

      return res.json(populatedWishlist);
    }
  } catch (error) {
    console.error('Combine items error:', error.message);
    res.status(500).json({ message: 'Server error combining wishlist items' });
  }
});

// @desc    Split a combined item back into single items
// @route   POST /api/wishlist/split/:id
// @access  Private
router.post('/split/:id', protect, async (req, res) => {
  const itemId = req.params.id;

  try {
    if (global.isMockDB) {
      const wishlist = getMockWishlist(req.user._id);

      const combinedItem = wishlist.items.find(
        item => item.type === 'combined' && String(item._id) === itemId
      );

      if (!combinedItem) {
        return res.status(404).json({ message: 'Combined wishlist item not found' });
      }

      // Remove the combined item
      wishlist.items = wishlist.items.filter(item => String(item._id) !== itemId);

      // Add products back as single items
      combinedItem.products.forEach(productId => {
        // Only add if not already in wishlist as a single item
        const exists = wishlist.items.find(
          item => item.type === 'single' && String(item.product) === String(productId)
        );

        if (!exists) {
          wishlist.items.push({
            _id: 'witem_' + Date.now() + Math.random().toString(36).substr(2, 5),
            type: 'single',
            product: productId,
            createdAt: new Date()
          });
        }
      });

      // Return populated
      const populatedItems = wishlist.items.map(item => {
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

      return res.json({ ...wishlist, items: populatedItems });

    } else {
      const wishlist = await Wishlist.findOne({ user: req.user._id });
      if (!wishlist) {
        return res.status(404).json({ message: 'Wishlist not found' });
      }

      const combinedItem = wishlist.items.find(
        item => item.type === 'combined' && item._id.toString() === itemId
      );

      if (!combinedItem) {
        return res.status(404).json({ message: 'Combined wishlist item not found' });
      }

      // Remove the combined item
      wishlist.items = wishlist.items.filter(item => item._id.toString() !== itemId);

      // Add each product back as a single item
      combinedItem.products.forEach(prodId => {
        const exists = wishlist.items.find(
          item => item.type === 'single' && item.product && item.product.toString() === prodId.toString()
        );

        if (!exists) {
          wishlist.items.push({
            type: 'single',
            product: prodId
          });
        }
      });

      await wishlist.save();

      const populatedWishlist = await Wishlist.findById(wishlist._id)
        .populate('items.product')
        .populate('items.products');

      return res.json(populatedWishlist);
    }
  } catch (error) {
    console.error('Split item error:', error.message);
    res.status(500).json({ message: 'Server error splitting wishlist item' });
  }
});

module.exports = router;
