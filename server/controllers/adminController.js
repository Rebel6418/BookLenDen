const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');

// ============================================
// DASHBOARD STATS (Fixed)
// ============================================

const getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats...');

    // Basic counts with error handling
    const totalUsers = await User.countDocuments({ role: 'user' }).catch(() => 0);
    const totalBooks = await Book.countDocuments().catch(() => 0);
    const totalOrders = await Order.countDocuments().catch(() => 0);

    // Calculate revenue safely
    let totalRevenue = 0;
    try {
      const revenueResult = await Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      totalRevenue = revenueResult[0]?.total || 0;
    } catch (error) {
      console.log('Revenue calculation failed, using 0');
    }

    console.log('✅ Stats:', { totalUsers, totalBooks, totalOrders, totalRevenue });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalBooks,
        totalOrders,
        totalRevenue
      }
    });

  } catch (error) {
    console.error('❌ Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// ============================================
// SALES CHART DATA
// ============================================

const getSalesChart = async (req, res) => {
  try {
    console.log('📈 Fetching sales chart data...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).catch(() => []);

    console.log(`✅ Found ${salesData.length} data points`);

    res.status(200).json({
      success: true,
      data: salesData
    });

  } catch (error) {
    console.error('❌ Sales Chart Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales chart data',
      error: error.message
    });
  }
};

// ============================================
// RECENT ORDERS
// ============================================

const getRecentOrders = async (req, res) => {
  try {
    console.log('📦 Fetching recent orders...');

    const orders = await Order.find()
      .populate('buyer', 'firstName lastName email')
      .populate('items.book', 'title author image')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .catch(() => []);

    console.log(`✅ Found ${orders.length} recent orders`);

    res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('❌ Recent Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent orders',
      error: error.message
    });
  }
};

// ============================================
// RECENT USERS
// ============================================

const getRecentUsers = async (req, res) => {
  try {
    console.log('👥 Fetching recent users...');

    const users = await User.find({ role: 'user' })
      .select('firstName lastName email createdAt profilePicture')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .catch(() => []);

    console.log(`✅ Found ${users.length} recent users`);

    res.status(200).json({
      success: true,
      users
    });

  } catch (error) {
    console.error('❌ Recent Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent users',
      error: error.message
    });
  }
};

// ============================================
// TOP SELLING BOOKS
// ============================================

const getTopBooks = async (req, res) => {
  try {
    console.log('📚 Fetching top books...');

    const topBooks = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.book',
          title: { $first: '$items.title' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]).catch(() => []);

    console.log(`✅ Found ${topBooks.length} top books`);

    res.status(200).json({
      success: true,
      books: topBooks
    });

  } catch (error) {
    console.error('❌ Top Books Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top books',
      error: error.message
    });
  }
};

// ============================================
// ORDER STATUS DISTRIBUTION
// ============================================

const getOrderStatusDistribution = async (req, res) => {
  try {
    console.log('📊 Fetching order status distribution...');

    const distribution = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]).catch(() => []);

    console.log(`✅ Found ${distribution.length} status types`);

    res.status(200).json({
      success: true,
      distribution
    });

  } catch (error) {
    console.error('❌ Status Distribution Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order status distribution',
      error: error.message
    });
  }
};

// ============================================
// USER MANAGEMENT
// ============================================

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = 'all' } = req.query;

    console.log(`👥 Getting users - Page: ${page}, Search: ${search}`);

    let query = {};

    if (role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ]);

    console.log(`✅ Found ${users.length} users`);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
        totalUsers,
        usersPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('❌ Get Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// ============================================
// DELETE USER
// ============================================

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🗑️  Deleting user ${userId}`);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    await User.findByIdAndDelete(userId);

    console.log(`✅ User deleted: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// ============================================
// BOOK MANAGEMENT
// ============================================

const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', category = 'all', status = 'all' } = req.query;

    console.log(`📚 Getting books - Page: ${page}`);

    let query = {};

    if (category !== 'all') {
      query.category = category;
    }

    if (status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [books, totalBooks] = await Promise.all([
      Book.find(query)
        .populate('seller', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Book.countDocuments(query)
    ]);

    console.log(`✅ Found ${books.length} books`);

    res.status(200).json({
      success: true,
      books,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBooks / parseInt(limit)),
        totalBooks,
        booksPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('❌ Get Books Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch books',
      error: error.message
    });
  }
};

// ============================================
// DELETE BOOK
// ============================================

const deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    console.log(`🗑️  Admin deleting book ${bookId}`);

    const book = await Book.findByIdAndDelete(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    console.log(`✅ Book deleted: ${book.title}`);

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete Book Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete book',
      error: error.message
    });
  }
};

// ============================================
// ORDER MANAGEMENT
// ============================================

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all', search = '' } = req.query;

    console.log(`📦 Getting orders - Page: ${page}`);

    let query = {};

    if (status !== 'all') {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .populate('buyer', 'firstName lastName email')
        .populate('items.book', 'title author image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query)
    ]);

    console.log(`✅ Found ${orders.length} orders`);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        ordersPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('❌ Get Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// ============================================
// UPDATE ORDER STATUS
// ============================================

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    console.log(`🔄 Updating order ${orderId} to ${status}`);

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = status;

    if (status === 'delivered') {
      order.actualDelivery = new Date();
      order.paymentStatus = 'paid';
    }

    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order ${status} by admin`,
      updatedBy: req.user._id
    });

    await order.save();

    console.log(`✅ Order status updated`);

    res.status(200).json({
      success: true,
      message: `Order ${status} successfully`,
      order
    });

  } catch (error) {
    console.error('❌ Update Order Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// ============================================
// DELETE ORDER
// ============================================

const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log(`🗑️  Admin deleting order ${orderId}`);

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`✅ Order deleted: ${order.invoiceNumber}`);

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
  }
};

// ============================================
// SALES REPORT
// ============================================

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    console.log('📊 Generating sales report...');

    let dateQuery = { orderStatus: { $ne: 'cancelled' } };

    if (startDate && endDate) {
      dateQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let dateFormat;
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const salesData = await Order.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).catch(() => []);

    console.log('✅ Sales report generated');

    res.status(200).json({
      success: true,
      report: salesData
    });

  } catch (error) {
    console.error('❌ Sales Report Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales report',
      error: error.message
    });
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
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
};