import { useState, useEffect } from 'react';
import { FiUsers, FiBook, FiShoppingCart, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import { dashboardAPI } from '../../services/adminApi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, salesRes, ordersRes, usersRes, booksRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getSalesChart(30),
        dashboardAPI.getRecentOrders(),
        dashboardAPI.getRecentUsers(),
        dashboardAPI.getTopBooks()
      ]);

      setStats(statsRes.data);
      setSalesData(salesRes.data || []);
      setRecentOrders(ordersRes.data || []);
      setRecentUsers(usersRes.data || []);
      setTopBooks(booksRes.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set empty arrays on error
      setSalesData([]);
      setRecentOrders([]);
      setRecentUsers([]);
      setTopBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const orderStatusData = [
    { name: 'Pending', value: stats?.ordersByStatus?.pending || 0, color: '#FCD34D' },
    { name: 'Confirmed', value: stats?.ordersByStatus?.confirmed || 0, color: '#60A5FA' },
    { name: 'Shipped', value: stats?.ordersByStatus?.shipped || 0, color: '#A78BFA' },
    { name: 'Delivered', value: stats?.ordersByStatus?.delivered || 0, color: '#34D399' },
    { name: 'Cancelled', value: stats?.ordersByStatus?.cancelled || 0, color: '#F87171' }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={FiUsers}
            color="blue"
            trend="up"
            trendValue="+12%"
          />
          <StatCard
            title="Total Books"
            value={stats?.totalBooks || 0}
            icon={FiBook}
            color="green"
            trend="up"
            trendValue="+8%"
          />
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={FiShoppingCart}
            color="purple"
            trend="up"
            trendValue="+23%"
          />
          <StatCard
            title="Revenue"
            value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
            icon={FiDollarSign}
            color="orange"
            trend="up"
            trendValue="+18%"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Sales Trend (30 Days)</h3>
              <FiTrendingUp className="text-green-500" size={24} />
            </div>
            {salesData && salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '0.5rem',
                      color: '#fff'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No sales data available
              </div>
            )}
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders & Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h3>
            <div className="space-y-4">
              {recentOrders && Array.isArray(recentOrders) && recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <img 
                        src={order.book?.image || 'https://placehold.co/200x300/gray/fff?text=Book'} 
                        alt={order.book?.title || 'Book'}
                        className="w-12 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/200x300/gray/fff?text=Book';
                        }}
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{order.book?.title || 'Unknown'}</p>
                        <p className="text-sm text-gray-600">
                          {order.buyer?.firstName || ''} {order.buyer?.lastName || ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{order.totalAmount || 0}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent orders
                </div>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Users</h3>
            <div className="space-y-4">
              {recentUsers && Array.isArray(recentUsers) && recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.firstName || ''} {user.lastName || ''}
                        </p>
                        <p className="text-sm text-gray-600">{user.email || 'No email'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent users
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Selling Books */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Top Selling Books</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topBooks && Array.isArray(topBooks) && topBooks.length > 0 ? (
              topBooks.map((book) => (
                <div key={book._id} className="p-4 border-2 border-gray-100 rounded-xl hover:border-blue-300 transition-all">
                  <img 
                    src={book.image || 'https://placehold.co/200x300/gray/fff?text=Book'} 
                    alt={book.title || 'Book'}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/200x300/gray/fff?text=Book';
                    }}
                  />
                  <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{book.title || 'Unknown'}</h4>
                  <p className="text-xs text-gray-600 mb-2">{book.author || 'Unknown'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-600">₹{book.price || 0}</span>
                    <span className="text-xs text-gray-500">{book.salesCount || 0} sold</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-5 text-center py-8 text-gray-500">
                No top selling books data
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;