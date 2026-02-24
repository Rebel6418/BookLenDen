const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const app = express();
const shiprocketRoutes = require('./routes/ShiprocketRoutes');
// ============================================
// MIDDLEWARE
// ============================================

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Body Parser
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

// ============================================
// ROUTES
// ============================================

// Public Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/otp', require('./routes/otpRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));

// Protected Routes (User)
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
// 🆕 ADMIN ROUTES (Protected - Admin Only)
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BookLenDen Server is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ERROR HANDLERS
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});
app.use('/api/shiprocket', shiprocketRoutes);

// ============================================
// DATABASE CONNECTION & SERVER START
// ============================================

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
      console.log('');
      console.log('   🔓 PUBLIC ROUTES:');
      console.log('   POST   /api/auth/register');
      console.log('   POST   /api/auth/login');
      console.log('   POST   /api/otp/send-otp');
      console.log('   POST   /api/otp/verify-otp');
      console.log('   POST   /api/otp/resend-otp');
      console.log('   GET    /api/books');
      console.log('   GET    /api/books/:id');
      console.log('');
      console.log('   🔒 PROTECTED ROUTES (User):');
      console.log('   GET    /api/books/my');
      console.log('   POST   /api/books');
      console.log('   PUT    /api/books/:id');
      console.log('   DELETE /api/books/:id');
      console.log('   GET    /api/cart');
      console.log('   POST   /api/cart/add');
      console.log('   GET    /api/orders/my-orders');
      console.log('   POST   /api/orders');
      console.log('   GET    /api/users/profile');
      console.log('   PUT    /api/users/profile');
      console.log('   GET    /api/wishlist');
      console.log('');
      console.log('   👑 ADMIN ROUTES (Admin Only):');
      console.log('   GET    /api/admin/dashboard/stats');
      console.log('   GET    /api/admin/users');
      console.log('   GET    /api/admin/users/:userId');
      console.log('   PUT    /api/admin/users/:userId');
      console.log('   DELETE /api/admin/users/:userId');
      console.log('   GET    /api/admin/books');
      console.log('   PUT    /api/admin/books/:bookId');
      console.log('   DELETE /api/admin/books/:bookId');
      console.log('   GET    /api/admin/orders');
      console.log('   PUT    /api/admin/orders/:orderId/status');
      console.log('   DELETE /api/admin/orders/:orderId');
      console.log('   GET    /api/admin/reports/sales');
      console.log('');
      console.log('   ℹ️  OTHER:');
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

module.exports = app;