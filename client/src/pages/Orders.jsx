import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock, 
  FiDownload, FiFilter, FiSearch, FiChevronDown, FiChevronUp,
  FiMapPin, FiPhone, FiCalendar, FiDollarSign, FiAlertCircle
} from 'react-icons/fi';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const navigate = useNavigate();

  const statusFilters = [
    { value: 'all', label: 'All Orders', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmed', color: 'blue' },
    { value: 'shipped', label: 'Shipped', color: 'purple' },
    { value: 'delivered', label: 'Delivered', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/400x600/3b82f6/ffffff?text=📚+Book';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedStatus, searchQuery]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/orders/my-orders');
      console.log('Orders response:', response.data);
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.orderStatus === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order => {
        const invoiceMatch = order.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());
        const bookMatch = order.items.some(item => 
          item.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return invoiceMatch || bookMatch;
      });
    }

    setFilteredOrders(filtered);
  };

  const handleCancelOrder = async (orderId) => {
    if (!cancelReason.trim()) {
      alert('Please provide a cancellation reason');
      return;
    }

    try {
      const response = await api.post(`/orders/${orderId}/cancel`, {
        reason: cancelReason
      });

      if (response.data.success) {
        alert('Order cancelled successfully!');
        setCancellingOrder(null);
        setCancelReason('');
        fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleDownloadInvoice = async (orderId, invoiceNumber) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceNumber}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download invoice');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="w-5 h-5" />;
      case 'confirmed': return <FiCheckCircle className="w-5 h-5" />;
      case 'shipped': return <FiTruck className="w-5 h-5" />;
      case 'delivered': return <FiPackage className="w-5 h-5" />;
      case 'cancelled': return <FiXCircle className="w-5 h-5" />;
      default: return <FiClock className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getOrderProgress = (status) => {
    const steps = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(status);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const canCancelOrder = (order) => {
    return order.orderStatus === 'pending' || order.orderStatus === 'confirmed';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-full p-8 inline-block mb-6 shadow-lg">
            <FiPackage className="w-24 h-24 text-gray-300" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">No orders yet</h2>
          <p className="text-gray-600 text-lg mb-8">
            Start shopping to see your orders here!
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600 text-lg">Track and manage your orders</p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by order ID or book name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
            </div>

            {/* Status Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all"
            >
              <FiFilter className="w-5 h-5" />
              <span>Filter by Status</span>
              {showFilters ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          </div>

          {/* Status Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-3">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedStatus(filter.value)}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                      selectedStatus === filter.value
                        ? `bg-${filter.color}-100 text-${filter.color}-800 border-2 border-${filter.color}-300 shadow-md`
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {filter.label}
                    {filter.value === 'all' && ` (${orders.length})`}
                    {filter.value !== 'all' && ` (${orders.filter(o => o.orderStatus === filter.value).length})`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FiAlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="font-bold capitalize">{order.orderStatus}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Order ID: <span className="font-mono font-bold text-gray-900">#{order.invoiceNumber?.slice(-8)}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          <FiCalendar className="inline w-4 h-4 mr-1" />
                          Placed on: {formatDate(order.orderDate || order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition-all font-medium"
                    >
                      {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                      {expandedOrder === order._id ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                  </div>

                  {/* Progress Bar (for non-cancelled orders) */}
                  {order.orderStatus !== 'cancelled' && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${getOrderProgress(order.orderStatus)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-600">
                        <span className={order.orderStatus === 'pending' ? 'font-bold text-blue-600' : ''}>Pending</span>
                        <span className={order.orderStatus === 'confirmed' ? 'font-bold text-blue-600' : ''}>Confirmed</span>
                        <span className={order.orderStatus === 'shipped' ? 'font-bold text-blue-600' : ''}>Shipped</span>
                        <span className={order.orderStatus === 'delivered' ? 'font-bold text-green-600' : ''}>Delivered</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items (Always Visible) */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                        <img
                          src={getImageUrl(item.book?.image)}
                          alt={item.title}
                          className="w-20 h-28 object-cover rounded-lg shadow-md"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/100x150/gray/fff?text=Book';
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">by {item.author}</p>
                          <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                          <p className="text-blue-600 font-bold text-lg mt-2">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expanded Details */}
                  {expandedOrder === order._id && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Delivery Address */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FiMapPin className="text-blue-600" />
                            Delivery Address
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
                            <p className="text-gray-700 mt-2">
                              {order.shippingAddress.addressLine1}
                              {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                            </p>
                            <p className="text-gray-700">
                              {order.shippingAddress.city}
                              {order.shippingAddress.state && `, ${order.shippingAddress.state}`} - {order.shippingAddress.pincode}
                            </p>
                            <p className="text-gray-700 mt-2 flex items-center gap-2">
                              <FiPhone className="w-4 h-4" />
                              {order.shippingAddress.mobile}
                            </p>
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FiDollarSign className="text-green-600" />
                            Order Summary
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal</span>
                              <span className="font-semibold">₹{order.totalAmount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Delivery</span>
                              <span className="font-semibold text-green-600">FREE</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between">
                              <span className="font-bold text-lg">Total</span>
                              <span className="font-bold text-2xl text-blue-600">₹{order.totalAmount}</span>
                            </div>
                            <div className="pt-2">
                              <span className="text-sm text-gray-600">Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</span>
                            </div>
                            {order.estimatedDelivery && order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                              <div className="pt-2 border-t border-gray-200">
                                <span className="text-sm text-gray-600">Estimated Delivery: </span>
                                <span className="text-sm font-semibold text-green-600">{formatDate(order.estimatedDelivery)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Order Actions */}
                      <div className="mt-8 flex flex-wrap gap-4">
                        <button
                          onClick={() => handleDownloadInvoice(order._id, order.invoiceNumber)}
                          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-md hover:shadow-lg"
                        >
                          <FiDownload className="w-5 h-5" />
                          Download Invoice
                        </button>

                        {canCancelOrder(order) && (
                          <button
                            onClick={() => setCancellingOrder(order._id)}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all shadow-md hover:shadow-lg"
                          >
                            <FiXCircle className="w-5 h-5" />
                            Cancel Order
                          </button>
                        )}

                        {order.orderStatus === 'delivered' && (
                          <button
                            onClick={() => navigate(`/book/${order.items[0].book._id}`)}
                            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-all shadow-md hover:shadow-lg"
                          >
                            Write Review
                          </button>
                        )}
                      </div>

                      {/* Cancellation Reason */}
                      {order.orderStatus === 'cancelled' && order.cancellationReason && (
                        <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                          <p className="text-sm font-semibold text-red-800">Cancellation Reason:</p>
                          <p className="text-sm text-red-700 mt-1">{order.cancellationReason}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancel Order Modal */}
        {cancellingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cancel Order</h3>
              <p className="text-gray-600 mb-6">Please provide a reason for cancellation:</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Changed my mind, Found better price, etc."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 resize-none"
                rows="4"
              />
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setCancellingOrder(null);
                    setCancelReason('');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => handleCancelOrder(cancellingOrder)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;