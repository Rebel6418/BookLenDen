import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  // ✅ Image URL Helper
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/400x600/3b82f6/ffffff?text=📚+Book';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/cart');
      if (response.data.success) {
        // ✅ Filter out items with null/undefined books
        const validCart = {
          ...response.data.cart,
          items: (response.data.cart?.items || []).filter(item => item.book && item.book._id)
        };
        setCart(validCart);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (bookId, newQuantity) => {
    if (!bookId || newQuantity < 1) return;

    setUpdating(true);
    try {
      const response = await api.put('/cart/update', {
        bookId,
        quantity: newQuantity
      });

      if (response.data.success) {
        // ✅ Filter out items with null/undefined books
        const validCart = {
          ...response.data.cart,
          items: (response.data.cart?.items || []).filter(item => item.book && item.book._id)
        };
        setCart(validCart);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update cart');
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (bookId) => {
    if (!bookId) return;

    setUpdating(true);
    try {
      const response = await api.delete(`/cart/remove/${bookId}`);
      if (response.data.success) {
        // ✅ Filter out items with null/undefined books
        const validCart = {
          ...response.data.cart,
          items: (response.data.cart?.items || []).filter(item => item.book && item.book._id)
        };
        setCart(validCart);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.book?.price || 0) * item.quantity;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-24 w-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some books to get started!</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              // ✅ Skip items with null/undefined books
              if (!item.book || !item.book._id) return null;

              return (
                <div key={item._id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={getImageUrl(item.book.image)}
                      alt={item.book.title || 'Book'}
                      className="w-24 h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/200x300/gray/ffffff?text=📚';
                      }}
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {item.book.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">by {item.book.author}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.book.condition === 'New' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.book.condition}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.book._id, item.quantity - 1)}
                            disabled={updating || item.quantity <= 1}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.book._id, item.quantity + 1)}
                            disabled={updating}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-600 hover:text-blue-600 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            ₹{item.book.price * item.quantity}
                          </p>
                          <button
                            onClick={() => removeItem(item.book._id)}
                            disabled={updating}
                            className="text-sm text-red-600 hover:text-red-700 font-medium mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({cart.items.length})</span>
                  <span>₹{calculateTotal()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">₹{calculateTotal()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full mt-3 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;