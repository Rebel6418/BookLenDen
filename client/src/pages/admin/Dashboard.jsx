import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, ShoppingBag, IndianRupee, RefreshCw } from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { format } from 'date-fns';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import { adminAPI } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [salesChart, setSalesChart] = useState([]);
  const [orderDistribution, setOrderDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data
      const [statsRes, ordersRes, usersRes, booksRes, chartRes, distRes] = await Promise.all([
        adminAPI.getDashboardStats().catch(() => ({ data: { stats: {} } })),
        adminAPI.getRecentOrders().catch(() => ({ data: { orders: [] } })),
        adminAPI.getRecentUsers().catch(() => ({ data: { users: [] } })),
        adminAPI.getTopBooks().catch(() => ({ data: { books: [] } })),
        adminAPI.getSalesChart().catch(() => ({ data: { data: [] } })),
        adminAPI.getOrderStatusDistribution().catch(() => ({ data: { distribution: [] } }))
      ]);

      // Set data safely
      setStats(statsRes.data.stats || {});
      setRecentOrders(ordersRes.data.orders || []);
      setRecentUsers(usersRes.data.users || []);
      setTopBooks(booksRes.data.books || []);
      setSalesChart(chartRes.data.data || []);
      setOrderDistribution(distRes.data.distribution || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 403) {
        alert('Access denied. Admin privileges required.');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers || 0}
            icon={Users}
            color="indigo"
            trend="up"
            trendValue="+12%"
          />
          <StatCard
            title="Total Books"
            value={stats.totalBooks || 0}
            icon={BookOpen}
            color="green"
            trend="up"
            trendValue="+8%"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders || 0}
            icon={ShoppingBag}
            color="blue"
            trend="up"
            trendValue="+23%"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`}
            icon={IndianRupee}
            color="orange"
            trend="up"
            trendValue="+15%"
          />
        </div>

        {/* Sales Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Trend (Last 30 Days)</h2>
          {salesChart && salesChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesChart}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="_id" 
                  stroke="#6b7280"
                  tickFormatter={(value) => {
                    try {
                      return format(new Date(value), 'MMM dd');
                    } catch {
                      return value;
                    }
                  }}
                />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Sales']}
                  labelFormatter={(label) => {
                    try {
                      return format(new Date(label), 'MMM dd, yyyy');
                    } catch {
                      return label;
                    }
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#4f46e5" 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No sales data available
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status</h2>
            {orderDistribution && orderDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderDistribution}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry._id}: ${entry.count}`}
                  >
                    {orderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No order data available
              </div>
            )}
          </div>

          {/* Top Selling Books */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Selling Books</h2>
            <div className="space-y-3">
              {topBooks && topBooks.length > 0 ? (
                topBooks.slice(0, 5).map((book, index) => (
                  <div key={book._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{book.title || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{book.totalSold || 0} sold</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">₹{book.revenue || 0}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No top selling books data
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {order.invoiceNumber || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        ₹{order.totalAmount || 0}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          order.orderStatus === 'confirmed' ? 'bg-yellow-100 text-yellow-700' :
                          order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.orderStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      No recent orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentUsers && recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user._id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-bold">
                      {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {user.firstName || ''} {user.lastName || ''}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{user.email || 'No email'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No recent users
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;