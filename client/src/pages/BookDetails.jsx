import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiShoppingCart, FiZap, FiTruck, FiShield, FiPackage, FiAward, FiChevronLeft } from 'react-icons/fi';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/400x600/3b82f6/ffffff?text=📚+Book';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/books/${id}`);
      if (response.data.success) {
        setBook(response.data.book);
      }
    } catch (err) {
      setError('Failed to load book details');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      const response = await api.post('/cart/add', {
        bookId: book._id,
        quantity: 1
      });

      if (response.data.success) {
        alert('✅ Book added to cart!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    await handleAddToCart();
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Book Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <FiChevronLeft size={20} />
          Back to Books
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Image */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <img
                  src={getImageUrl(book.image)}
                  alt={book.title}
                  className="w-full h-auto object-contain rounded-lg"
                  style={{ maxHeight: '400px' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/400x600/3b82f6/ffffff?text=📚+Book';
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !book.isAvailable}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiShoppingCart size={20} />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                
                <button
                  onClick={handleBuyNow}
                  disabled={addingToCart || !book.isAvailable}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiZap size={20} />
                  Buy Now
                </button>
              </div>

              {!book.isAvailable && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-semibold text-center">
                    ⚠️ Currently Unavailable
                  </p>
                </div>
              )}

              {/* Trust Badges */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <FiTruck className="text-green-600" size={20} />
                  <span>Free Delivery (5-7 days)</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <FiShield className="text-blue-600" size={20} />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <FiPackage className="text-purple-600" size={20} />
                  <span>Quality Checked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  book.condition === 'New' 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}>
                  {book.condition === 'New' ? '✨ Brand New' : '📘 Used - Good Condition'}
                </span>
                {book.category && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-300">
                    {book.category}
                  </span>
                )}
                {book.subcategory && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">
                    {book.subcategory}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {book.title}
              </h1>

              {/* Author */}
              <p className="text-xl text-gray-600 mb-6">
                by <span className="font-semibold text-gray-800">{book.author}</span>
              </p>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-red-600">₹{book.price}</span>
                  <span className="text-lg text-gray-500 line-through">₹{Math.round(book.price * 1.5)}</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-sm font-bold rounded">
                    {Math.round((1 - book.price / (book.price * 1.5)) * 100)}% OFF
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Inclusive of all taxes</p>
              </div>

              {/* Description */}
              {book.description && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">📖 About this book</h3>
                  <p className="text-gray-700 leading-relaxed">{book.description}</p>
                </div>
              )}

              {/* Additional Details */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Product Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Condition</span>
                    <span className="text-gray-900 font-semibold">{book.condition}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Category</span>
                    <span className="text-gray-900 font-semibold">{book.category}</span>
                  </div>
                  {book.language && (
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Language</span>
                      <span className="text-gray-900 font-semibold">{book.language}</span>
                    </div>
                  )}
                  {book.edition && (
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Edition</span>
                      <span className="text-gray-900 font-semibold">{book.edition}</span>
                    </div>
                  )}
                  {book.publishYear && (
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Year</span>
                      <span className="text-gray-900 font-semibold">{book.publishYear}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ Seller Info - Amazon Style (PRIVATE - Platform as Seller) */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <FiAward className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg mb-1">Sold by BookLenDen</p>
                    <p className="text-sm text-gray-600 mb-3">
                      Verified seller • Quality guaranteed • Secure transactions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-green-700 border border-green-200">
                        ✓ Trusted Platform
                      </span>
                      <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-blue-700 border border-blue-200">
                        ✓ Safe Delivery
                      </span>
                      <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-purple-700 border border-purple-200">
                        ✓ 100% Authentic
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-xs text-gray-600 italic">
                    🔒 Your purchase is secure. Seller details are kept private for your safety.
                  </p>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <FiTruck className="text-green-600" size={24} />
                  <div>
                    <p className="font-bold text-green-800">Free Delivery in 5-7 days</p>
                    <p className="text-sm text-green-700">Cash on Delivery available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;