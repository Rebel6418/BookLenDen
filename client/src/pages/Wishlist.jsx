import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/wishlist');
      if (response.data.success) {
        setWishlist(response.data.wishlist);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (bookId) => {
    try {
      const response = await api.delete(`/wishlist/remove/${bookId}`);
      if (response.data.success) {
        setWishlist(wishlist.filter(book => book._id !== bookId));
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const addToCart = async (bookId) => {
    try {
      const response = await api.post('/cart/add', { bookId, quantity: 1 });
      if (response.data.success) {
        alert('Book added to cart!');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/400x600/3b82f6/ffffff?text=📚+Book';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.includes('\\') || imagePath.includes('/')) {
      const filename = imagePath.split(/[/\\]/).pop();
      return `http://localhost:5000/uploads/${filename}`;
    }
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-8 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-6">
            <svg className="w-24 h-24 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Your Wishlist is Empty</h2>
          <p className="text-gray-600 text-lg mb-8">Save your favorite books to buy them later!</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            ❤️ Browse Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-4xl">❤️</span>
            My Wishlist
          </h1>
          <p className="text-gray-600 mt-2">{wishlist.length} book{wishlist.length !== 1 ? 's' : ''} saved</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((book) => (
            <div key={book._id} className="group relative bg-white rounded-2xl shadow-card hover:shadow-premium transition-all duration-300 overflow-hidden">
              <button
                onClick={() => removeFromWishlist(book._id)}
                className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-all"
              >
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              <div 
                onClick={() => navigate(`/book/${book._id}`)}
                className="relative h-72 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden cursor-pointer"
              >
                <img
                  src={getImageUrl(book.image)}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/400x600/3b82f6/ffffff?text=📚+Book';
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
                    book.condition === 'New' 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                      : 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white'
                  }`}>
                    {book.condition}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
                  {book.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-1">
                  by {book.author}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ₹{book.price}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => addToCart(book._id)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => navigate(`/book/${book._id}`)}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;