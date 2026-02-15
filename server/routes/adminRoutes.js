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

  // User Management
  getAllUsers,
  deleteUser,

  // Book Management
  getAllBooks,
  deleteBook,

  // Order Management
  getAllOrders,
  adminUpdateOrderStatus,
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

// ============================================
// USER MANAGEMENT ROUTES
// ============================================

// @route   GET /api/admin/users
// @desc    Get all users with pagination & search
// @access  Private/Admin
// Query params: page, limit, search, role
router.get('/users', getAllUsers);

// @route   PUT /api/admin/users/:userId/toggle-status
// @desc    Toggle user active/inactive status
// @access  Private/Admin
router.put('/users/:userId/toggle-status', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isVerified = !user.isVerified;
    await user.save();
    
    res.json({ message: 'User status updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

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

// @route   PUT /api/admin/books/:bookId/toggle-status
// @desc    Toggle book available/sold status
// @access  Private/Admin
router.put('/books/:bookId/toggle-status', async (req, res) => {
  try {
    const Book = require('../models/Book');
    const book = await Book.findById(req.params.bookId);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    book.status = book.status === 'available' ? 'sold' : 'available';
    await book.save();
    
    res.json({ message: 'Book status updated', book });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update book status' });
  }
});

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
// Body: { status }
router.put('/orders/:orderId/status', adminUpdateOrderStatus);

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
// Query params: startDate, endDate
router.get('/reports/sales', getSalesReport);

// @route   GET /api/admin/reports/categories
// @desc    Get category-wise sales report
// @access  Private/Admin
router.get('/reports/categories', async (req, res) => {
  try {
    const Order = require('../models/Order');
    
    const categories = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'books',
          localField: 'items.book',
          foreignField: '_id',
          as: 'bookData'
        }
      },
      { $unwind: '$bookData' },
      {
        $group: {
          _id: '$bookData.category',
          value: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          orders: 1,
          _id: 0
        }
      }
    ]);
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch category report' });
  }
});

module.exports = router;