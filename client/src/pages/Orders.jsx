import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { ordersAPI } from '../services/api';
import WriteReview from '../components/WriteReview';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'sales'
  const [showReviewModal, setShowReviewModal] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = activeTab === 'orders' 
        ? await ordersAPI.getMyOrders()
        : await ordersAPI.getMySales();
      
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await ordersAPI.cancel(orderId);
      fetchOrders();
      alert('Order cancelled successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, { status });
      fetchOrders();
      alert('Order status updated');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="text-yellow-500" />;
      case 'confirmed': return <FiPackage className="text-blue-500" />;
      case 'shipped': return <FiTruck className="text-purple-500" />;
      case 'delivered': return <FiCheckCircle className="text-green-500" />;
      case 'cancelled': return <FiXCircle className="text-red-500" />;
      default: return <FiClock className="text-gray-500" />;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            My Purchases
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'sales'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            My Sales
          </button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FiPackage size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">
              {activeTab === 'orders' 
                ? "You haven't placed any orders yet" 
                : "You haven't made any sales yet"}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between mb-6 pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-mono text-sm font-semibold text-gray-800">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Book Details */}
                  <div className="flex gap-6 mb-6">
                    <img
                      src={order.book?.image}
                      alt={order.book?.title}
                      className="w-24 h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/200x300/gray/fff?text=Book';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {order.book?.title}
                      </h3>
                      <p className="text-gray-600 mb-2">by {order.book?.author}</p>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>Qty: {order.quantity}</span>
                        <span>•</span>
                        <span className="font-semibold text-gray-800">₹{order.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      {activeTab === 'orders' ? 'Seller' : 'Buyer'} Information
                    </p>
                    <p className="text-gray-800">
                      {activeTab === 'orders' 
                        ? `${order.seller?.firstName} ${order.seller?.lastName}`
                        : `${order.buyer?.firstName} ${order.buyer?.lastName}`}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {activeTab === 'orders' ? order.seller?.mobile : order.buyer?.mobile}
                    </p>
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Shipping Address</p>
                      <p className="text-gray-800">{order.shippingAddress.name}</p>
                      <p className="text-gray-600 text-sm">{order.shippingAddress.address}</p>
                      <p className="text-gray-600 text-sm">
                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </p>
                      <p className="text-gray-600 text-sm">{order.shippingAddress.mobile}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {activeTab === 'orders' ? (
                      <>
                        <button
                          onClick={() => navigate(`/book/${order.book._id}`)}
                          className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        >
                          View Book
                        </button>

                        {order.status === 'delivered' && (
                          <button
                            onClick={() => setShowReviewModal({
                              orderId: order._id,
                              bookId: order.book._id,
                              bookTitle: order.book.title
                            })}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Write Review
                          </button>
                        )}

                        {['pending', 'confirmed'].includes(order.status) && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                          >
                            Confirm Order
                          </button>
                        )}

                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'shipped')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Mark as Shipped
                          </button>
                        )}

                        {order.status === 'shipped' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'delivered')}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                          >
                            Mark as Delivered
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && (
          <WriteReview
            bookId={showReviewModal.bookId}
            bookTitle={showReviewModal.bookTitle}
            orderId={showReviewModal.orderId}
            onClose={() => setShowReviewModal(null)}
            onSuccess={() => {
              setShowReviewModal(null);
              fetchOrders();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Orders;