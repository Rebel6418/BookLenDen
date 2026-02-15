const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  // Dashboard
  getDashboardStats,
  getSalesChart,
  getRecentOrders,
  getRecentUsers,
  getTopBooks,
  getOrderStatusDistribution,

  // User Management
  getAllUsers,
  deleteUser,

  // Book Management
  getAllBooks,
  deleteBook,

  // Order Management
  getAllOrders,
  updateOrderStatus,
  deleteOrder,

  // Reports
  getSalesReport
} = require('../controllers/adminController');

// ============================================
// APPLY MIDDLEWARE TO ALL ROUTES
// ============================================

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// ============================================
// DASHBOARD ROUTES
// ============================================

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', getDashboardStats);

// @route   GET /api/admin/sales-chart
// @desc    Get sales chart data (30 days)
// @access  Private/Admin
router.get('/sales-chart', getSalesChart);

// @route   GET /api/admin/recent-orders
// @desc    Get recent orders (last 10)
// @access  Private/Admin
router.get('/recent-orders', getRecentOrders);

// @route   GET /api/admin/recent-users
// @desc    Get recent users (last 10)
// @access  Private/Admin
router.get('/recent-users', getRecentUsers);

// @route   GET /api/admin/top-books
// @desc    Get top selling books
// @access  Private/Admin
router.get('/top-books', getTopBooks);

// @route   GET /api/admin/order-status-distribution
// @desc    Get order status distribution
// @access  Private/Admin
router.get('/order-status-distribution', getOrderStatusDistribution);

// ============================================
// USER MANAGEMENT ROUTES
// ============================================

// @route   GET /api/admin/users
// @desc    Get all users with pagination & search
// @access  Private/Admin
// Query params: page, limit, search, role
router.get('/users', getAllUsers);

// @route   DELETE /api/admin/users/:userId
// @desc    Delete user (cannot delete admins)
// @access  Private/Admin
router.delete('/users/:userId', deleteUser);

// ============================================
// BOOK MANAGEMENT ROUTES
// ============================================

// @route   GET /api/admin/books
// @desc    Get all books with pagination & filters
// @access  Private/Admin
// Query params: page, limit, search, category, status
router.get('/books', getAllBooks);

// @route   DELETE /api/admin/books/:bookId
// @desc    Delete any book
// @access  Private/Admin
router.delete('/books/:bookId', deleteBook);

// ============================================
// ORDER MANAGEMENT ROUTES
// ============================================

// @route   GET /api/admin/orders
// @desc    Get all orders with pagination & filters
// @access  Private/Admin
// Query params: page, limit, search, status
router.get('/orders', getAllOrders);

// @route   PUT /api/admin/orders/:orderId/status
// @desc    Update order status (admin can update any order)
// @access  Private/Admin
// Body: { status, note }
router.put('/orders/:orderId/status', updateOrderStatus);

// @route   DELETE /api/admin/orders/:orderId
// @desc    Delete order
// @access  Private/Admin
router.delete('/orders/:orderId', deleteOrder);

// ============================================
// ANALYTICS & REPORTS ROUTES
// ============================================

// @route   GET /api/admin/reports/sales
// @desc    Get sales report with date range
// @access  Private/Admin
// Query params: startDate, endDate, groupBy (day/month/year)
router.get('/reports/sales', getSalesReport);

module.exports = router;