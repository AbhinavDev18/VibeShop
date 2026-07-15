const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vibe_coding_shop';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000 // 3 seconds timeout
    });
    console.log('✅ MongoDB connected successfully');
    global.isMockDB = false;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.warn('⚠️ Falling back to In-Memory Local Database Mock. The application will be fully functional, but data will reset when the server restarts.');
    global.isMockDB = true;
  }
};

module.exports = connectDB;
