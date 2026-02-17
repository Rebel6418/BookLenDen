import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const MySales = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchSales(); }, []);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/orders/seller/my-sales');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch sales:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      setUpdatingOrder(orderId);
      const res = await api.post(`/orders/${orderId}/confirm`);
      if (res.data.success) {
        alert('✅ Order confirmed! Shiprocket pickup scheduled automatically!');
        fetchSales();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to confirm order';
      if (msg.includes('seller address')) {
        if (window.confirm('⚠️ Seller address is required for Shiprocket pickup!\n\nGo to Profile → Update Address?')) {
          navigate('/profile');
        }
      } else {
        alert(msg);
      }
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleUpdateStatus = async (orderId, status, trackingNumber = '') => {
    try {
      setUpdatingOrder(orderId);
      await api.put(`/orders/${orderId}/status`, { status, trackingNumber });
      alert(`✅ Order marked as ${status}!`);
      fetchSales();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(o => o.orderStatus === selectedStatus);

  const statusColors = {
    pending:   'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
    shipped:   'bg-purple-100 text-purple-800 border-purple-300',
    delivered: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300'
  };

  const statusEmoji = {
    pending: '⏳', confirmed: '✅', shipped: '🚚', delivered: '📦', cancelled: '❌'
  };

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.orderStatus === 'pending').length,
    confirmed: orders.filter(o => o.orderStatus === 'confirmed').length,
    shipped: orders.filter(o => o.orderStatus === 'shipped').length,
    delivered: orders.filter(o => o.orderStatus === 'delivered').length,
    cancelled: orders.filter(o => o.orderStatus === 'cancelled').length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📦 My Sales</h1>
            <p className="text-gray-600 mt-1">Manage your book orders</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-3 text-center">
            <p className="text-2xl font-bold text-green-700">
              ₹{orders.filter(o => o.orderStatus === 'delivered')
                .reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
            </p>
            <p className="text-xs text-green-600">Total Earned</p>
          </div>
        </div>

        {/* IMPORTANT: Seller Address Alert */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold text-amber-800">Seller Address Required for Shiprocket!</p>
            <p className="text-amber-700 text-sm mt-1">
              To enable automatic pickup, please update your seller address in
              <button onClick={() => navigate('/profile')} className="text-amber-900 underline font-semibold ml-1">
                Profile Settings
              </button>
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {Object.entries(counts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                selectedStatus === status
                  ? 'border-gray-800 bg-gray-800 text-white shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-400'
              }`}
            >
              <p className="text-xl font-bold">{count}</p>
              <p className="text-xs capitalize mt-1">
                {status === 'all' ? '📚 All' : `${statusEmoji[status]} ${status}`}
              </p>
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-16 text-center">
            <p className="text-6xl mb-4">📭</p>
            <h3 className="text-xl font-bold text-gray-900">No orders found</h3>
            <p className="text-gray-500 mt-2">
              {selectedStatus === 'all'
                ? 'You have no orders yet. Start selling books!'
                : `No ${selectedStatus} orders.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-md overflow-hidden">

                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-full border-2 text-sm font-bold ${statusColors[order.orderStatus]}`}>
                      {statusEmoji[order.orderStatus]} {order.orderStatus.toUpperCase()}
                    </span>
                    <div>
                      <p className="font-mono font-bold text-gray-900">#{order.invoiceNumber?.slice(-10)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-700">₹{order.totalAmount}</p>
                    <p className="text-xs text-gray-500">{order.paymentMethod === 'cod' ? '💵 COD' : '💳 Online'}</p>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-6">
                  {/* Items */}
                  <div className="mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex gap-3 py-2 border-b last:border-0">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-500">by {item.author}</p>
                          <p className="text-sm text-gray-600 mt-1">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>

                  {/* Buyer Info (Only Platform shows address - PRIVATE) */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-xs font-bold text-blue-700 mb-1">📦 DELIVER TO (Buyer Info):</p>
                    <p className="text-sm font-semibold text-gray-800">{order.shippingAddress?.fullName}</p>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
                    </p>
                    <p className="text-sm text-gray-600">📞 {order.shippingAddress?.mobile}</p>
                    <p className="text-xs text-blue-600 mt-2 italic">
                      🔒 Shiprocket handles pickup & delivery automatically
                    </p>
                  </div>

                  {/* Tracking (if available) */}
                  {order.trackingNumber && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                      <p className="text-xs font-bold text-purple-700">📦 TRACKING NUMBER:</p>
                      <p className="text-lg font-bold text-purple-900 mt-1">{order.trackingNumber}</p>
                      <a
                        href={`https://www.shiprocket.in/shipment-tracking/?id=${order.trackingNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-purple-600 underline"
                      >
                        Track on Shiprocket →
                      </a>
                    </div>
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap gap-3 mt-4">

                    {/* PENDING → Confirm (Auto Shiprocket) */}
                    {order.orderStatus === 'pending' && (
                      <button
                        onClick={() => handleConfirmOrder(order._id)}
                        disabled={updatingOrder === order._id}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold transition-all shadow-md disabled:opacity-50"
                      >
                        {updatingOrder === order._id ? (
                          <><span className="animate-spin">⏳</span> Processing...</>
                        ) : (
                          <>✅ Confirm & Schedule Pickup</>
                        )}
                      </button>
                    )}

                    {/* CONFIRMED → Mark Shipped (with tracking) */}
                    {order.orderStatus === 'confirmed' && (
                      <button
                        onClick={() => {
                          const tracking = prompt('Enter Shiprocket AWB/Tracking Number (optional):');
                          handleUpdateStatus(order._id, 'shipped', tracking || '');
                        }}
                        disabled={updatingOrder === order._id}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all shadow-md disabled:opacity-50"
                      >
                        🚚 Mark as Shipped
                      </button>
                    )}

                    {/* SHIPPED → Mark Delivered */}
                    {order.orderStatus === 'shipped' && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'delivered')}
                        disabled={updatingOrder === order._id}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold transition-all shadow-md disabled:opacity-50"
                      >
                        📦 Mark as Delivered
                      </button>
                    )}

                    {/* DELIVERED Badge */}
                    {order.orderStatus === 'delivered' && (
                      <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-xl font-bold border-2 border-green-300">
                        🎉 Delivered! Payment Released
                      </div>
                    )}

                    {/* CANCELLED Badge */}
                    {order.orderStatus === 'cancelled' && (
                      <div className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-800 rounded-xl font-bold border-2 border-red-300">
                        ❌ Cancelled - {order.cancellationReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySales;