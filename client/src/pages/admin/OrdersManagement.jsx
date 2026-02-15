import { useState, useEffect } from 'react';
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock, FiEye } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import { orderManagementAPI } from '../../services/adminApi';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filterStatus, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderManagementAPI.getAllOrders({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: filterStatus !== 'all' ? filterStatus : undefined
      });
      setOrders(response.data.orders);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderManagementAPI.updateOrderStatus(orderId, newStatus);
      alert('Order status updated successfully');
      setShowStatusModal(false);
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      await orderManagementAPI.deleteOrder(orderId);
      alert('Order deleted successfully');
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete order');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="text-yellow-500" size={20} />;
      case 'confirmed': return <FiPackage className="text-blue-500" size={20} />;
      case 'shipped': return <FiTruck className="text-purple-500" size={20} />;
      case 'delivered': return <FiCheckCircle className="text-green-500" size={20} />;
      case 'cancelled': return <FiXCircle className="text-red-500" size={20} />;
      default: return <FiClock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statuses = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1">Track and manage all orders</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              {statuses.map(status => (
                <option key={status} value={status.toLowerCase()}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Book</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Buyer</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Seller</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm font-semibold text-gray-900">
                            #{order._id?.slice(-8).toUpperCase()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={order.book?.image}
                              alt={order.book?.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                            <div className="max-w-xs">
                              <p className="font-semibold text-gray-900 line-clamp-1">{order.book?.title}</p>
                              <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {order.buyer?.firstName} {order.buyer?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{order.buyer?.mobile}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">
                            {order.seller?.firstName} {order.seller?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{order.seller?.mobile}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowStatusModal(true);
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold ${getStatusColor(order.status)} hover:opacity-80 transition-opacity`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => window.open(`/book/${order.book?._id}`, '_blank')}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Book"
                            >
                              <FiEye className="text-blue-600" size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Order"
                            >
                              <FiXCircle className="text-red-600" size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Status Update Modal */}
        {showStatusModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Update Order Status</h3>
              <p className="text-gray-600 mb-6">
                Order #{selectedOrder._id?.slice(-8).toUpperCase()}
              </p>
              
              <div className="space-y-3">
                {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(selectedOrder._id, status)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                      selectedOrder.status === status
                        ? `${getStatusColor(status)} ring-2 ring-offset-2`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getStatusIcon(status)}
                    <span className="capitalize">{status}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowStatusModal(false)}
                className="w-full mt-4 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statuses.slice(1).map((status) => {
            const count = orders.filter(o => o.status === status.toLowerCase()).length;
            const statusLower = status.toLowerCase();
            return (
              <div
                key={status}
                className={`rounded-2xl p-6 text-white ${
                  statusLower === 'pending' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                  statusLower === 'confirmed' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  statusLower === 'shipped' ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                  statusLower === 'delivered' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  'bg-gradient-to-br from-red-500 to-red-600'
                }`}
              >
                <p className="text-sm opacity-90 mb-1">{status}</p>
                <p className="text-3xl font-bold">{count}</p>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrdersManagement;