require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const wishlistRoutes = require('./routes/wishlist');
const cartRoutes = require('./routes/cart');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

global.isMockDB = false;

// Connect Database in background
connectDB();

// Routes Setup
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);

// Status check route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'active',
    database: global.isMockDB ? 'mock-in-memory' : 'mongodb',
    timestamp: new Date()
  });
});

// Start listener only when run directly (local development)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`👉 API status checked at http://localhost:${PORT}/api/status`);
  });
}

module.exports = app;

