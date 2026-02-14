const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const wishlistRoutes = require('./routes/wishlistRoutes');
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging
app.use((req, res, next) => {
  console.log(`\n🌐 ${req.method} ${req.url}`);
  console.log('📝 Time:', new Date().toLocaleString());
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/otp', require('./routes/otpRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/wishlist', wishlistRoutes); // ✅ NEW: User routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BookLenDen Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ MongoDB Connected Successfully');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 BookLenDen Server is RUNNING!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`📅 Started: ${new Date().toLocaleString()}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('📌 Available Routes:');
      console.log('   POST   /api/auth/register');
      console.log('   POST   /api/auth/login');
      console.log('   POST   /api/otp/send-otp');
      console.log('   POST   /api/otp/verify-otp');
      console.log('   POST   /api/otp/resend-otp');
      console.log('   GET    /api/books');
      console.log('   GET    /api/books/:id');
      console.log('   GET    /api/books/my (protected)');
      console.log('   POST   /api/books (protected)');
      console.log('   PUT    /api/books/:id (protected)');
      console.log('   DELETE /api/books/:id (protected)');
      console.log('   GET    /api/cart (protected)');
      console.log('   POST   /api/cart/add (protected)');
      console.log('   GET    /api/orders/my-orders (protected)');
      console.log('   POST   /api/orders (protected)');
      console.log('   GET    /api/users/profile (protected)'); // ✅ NEW
      console.log('   PUT    /api/users/profile (protected)'); // ✅ NEW
      console.log('   POST   /api/users/change-password (protected)'); // ✅ NEW
      console.log('   POST   /api/users/upload-picture (protected)'); // ✅ NEW
      console.log('   GET    /api/users/stats (protected)'); // ✅ NEW
      console.log('   GET    /api/health');
      console.log('');
      console.log('✨ Ready to accept requests!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  })
  .catch((err) => {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ MongoDB Connection Failed');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', err.message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  });