const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');

// ============================================
// DASHBOARD STATS
// ============================================

const getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats...');

    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBooks = await Book.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    // Order status distribution
    const statusResult = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const ordersByStatus = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    statusResult.forEach(item => {
      if (item._id && ordersByStatus.hasOwnProperty(item._id)) {
        ordersByStatus[item._id] = item.count;
      }
    });

    const response = {
      totalUsers,
      totalBooks,
      totalOrders,
      totalRevenue,
      ordersByStatus
    };

    console.log('✅ Stats:', response);

    res.json(response);

  } catch (error) {
    console.error('❌ Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
};

// ============================================
// SALES CHART DATA
// ============================================

const getSalesChart = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    console.log(`📈 Fetching sales chart for ${days} days...`);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          revenue: 1,
          orders: 1,
          _id: 0
        }
      }
    ]);

    console.log(`✅ Found ${salesData.length} data points`);

    res.json(salesData);

  } catch (error) {
    console.error('❌ Sales Chart Error:', error);
    res.status(500).json({ message: 'Failed to fetch sales chart data' });
  }
};

// ============================================
// RECENT ORDERS
// ============================================

const getRecentOrders = async (req, res) => {
  try {
    console.log('📦 Fetching recent orders...');

    const orders = await Order.find()
      .populate('buyer', 'firstName lastName email mobile')
      .populate('items.book', 'title author image price')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Transform orders to include book info at root level
    const transformedOrders = orders.map(order => ({
      ...order,
      book: order.items && order.items[0] ? order.items[0].book : null,
      status: order.orderStatus
    }));

    console.log(`✅ Found ${transformedOrders.length} recent orders`);

    res.json(transformedOrders);

  } catch (error) {
    console.error('❌ Recent Orders Error:', error);
    res.status(500).json({ message: 'Failed to fetch recent orders' });
  }
};

// ============================================
// RECENT USERS
// ============================================

const getRecentUsers = async (req, res) => {
  try {
    console.log('👥 Fetching recent users...');

    const users = await User.find({ role: 'user' })
      .select('firstName lastName email mobile createdAt profilePicture')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    console.log(`✅ Found ${users.length} recent users`);

    res.json(users);

  } catch (error) {
    console.error('❌ Recent Users Error:', error);
    res.status(500).json({ message: 'Failed to fetch recent users' });
  }
};

// ============================================
// TOP SELLING BOOKS
// ============================================

const getTopBooks = async (req, res) => {
  try {
    console.log('📚 Fetching top books...');

    const topBooks = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.book',
          title: { $first: '$items.title' },
          salesCount: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { salesCount: -1 } },
      { $limit: 5 }
    ]);

    // Populate book details
    const bookIds = topBooks.map(item => item._id);
    const books = await Book.find({ _id: { $in: bookIds } })
      .select('title author image price')
      .lean();

    const result = topBooks.map(item => {
      const book = books.find(b => b._id.toString() === item._id.toString());
      return {
        _id: item._id,
        title: book?.title || item.title,
        author: book?.author || 'Unknown',
        image: book?.image || '',
        price: book?.price || 0,
        salesCount: item.salesCount,
        revenue: item.revenue
      };
    });

    console.log(`✅ Found ${result.length} top books`);

    res.json(result);

  } catch (error) {
    console.error('❌ Top Books Error:', error);
    res.status(500).json({ message: 'Failed to fetch top books' });
  }
};

// ============================================
// USER MANAGEMENT
// ============================================

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role } = req.query;

    console.log(`👥 Getting users - Page: ${page}, Search: ${search}`);

    let query = {};

    if (role && role !== 'all') {
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

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ]);

    console.log(`✅ Found ${users.length} users`);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });

  } catch (error) {
    console.error('❌ Get Users Error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🗑️ Deleting user ${userId}`);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(userId);

    console.log(`✅ User deleted: ${user.email}`);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('❌ Delete User Error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// ============================================
// BOOK MANAGEMENT
// ============================================

const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category, status } = req.query;

    console.log(`📚 Getting books - Page: ${page}`);

    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [books, total] = await Promise.all([
      Book.find(query)
        .populate('seller', 'firstName lastName mobile email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Book.countDocuments(query)
    ]);

    console.log(`✅ Found ${books.length} books`);

    res.json({
      books,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });

  } catch (error) {
    console.error('❌ Get Books Error:', error);
    res.status(500).json({ message: 'Failed to fetch books' });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;

    console.log(`🗑️ Admin deleting book ${bookId}`);

    const book = await Book.findByIdAndDelete(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    console.log(`✅ Book deleted: ${book.title}`);

    res.json({ message: 'Book deleted successfully' });

  } catch (error) {
    console.error('❌ Delete Book Error:', error);
    res.status(500).json({ message: 'Failed to delete book' });
  }
};

// ============================================
// ORDER MANAGEMENT
// ============================================

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search = '' } = req.query;

    console.log(`📦 Getting orders - Page: ${page}`);

    let query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('buyer', 'firstName lastName email mobile')
        .populate('items.book', 'title author image price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(query)
    ]);

    // Transform orders
    const transformedOrders = orders.map(order => ({
      ...order,
      book: order.items && order.items[0] ? order.items[0].book : null,
      seller: order.items && order.items[0] ? order.items[0].seller : null,
      status: order.orderStatus,
      quantity: order.items && order.items[0] ? order.items[0].quantity : 0
    }));

    console.log(`✅ Found ${transformedOrders.length} orders`);

    res.json({
      orders: transformedOrders,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });

  } catch (error) {
    console.error('❌ Get Orders Error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log(`🔄 Updating order ${orderId} to ${status}`);

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = status;

    if (status === 'delivered') {
      order.actualDelivery = new Date();
      order.paymentStatus = 'paid';
    }

    await order.save();

    console.log(`✅ Order status updated`);

    res.json({ message: `Order ${status} successfully`, order });

  } catch (error) {
    console.error('❌ Update Order Status Error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log(`🗑️ Admin deleting order ${orderId}`);

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log(`✅ Order deleted: ${order.invoiceNumber}`);

    res.json({ message: 'Order deleted successfully' });

  } catch (error) {
    console.error('❌ Delete Order Error:', error);
    res.status(500).json({ message: 'Failed to delete order' });
  }
};

// ============================================
// REPORTS
// ============================================

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log('📊 Generating sales report...');

    let dateQuery = { orderStatus: { $ne: 'cancelled' } };

    if (startDate && endDate) {
      dateQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [salesByDate, salesByCategory, stats] = await Promise.all([
      // Sales by date
      Order.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: '$_id',
            revenue: 1,
            orders: 1,
            _id: 0
          }
        }
      ]),

      // Sales by category
      Order.aggregate([
        { $match: dateQuery },
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
      ]),

      // Overall stats
      Order.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 }
          }
        }
      ])
    ]);

    const totalSales = await Order.aggregate([
      { $match: dateQuery },
      { $unwind: '$items' },
      { $group: { _id: null, total: { $sum: '$items.quantity' } } }
    ]);

    console.log('✅ Sales report generated');

    res.json({
      salesByDate,
      salesByCategory,
      stats: {
        totalRevenue: stats[0]?.totalRevenue || 0,
        totalOrders: stats[0]?.totalOrders || 0,
        totalSales: totalSales[0]?.total || 0,
        avgOrderValue: stats[0]?.totalOrders ? stats[0].totalRevenue / stats[0].totalOrders : 0
      }
    });

  } catch (error) {
    console.error('❌ Sales Report Error:', error);
    res.status(500).json({ message: 'Failed to generate sales report' });
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
};