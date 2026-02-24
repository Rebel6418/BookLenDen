import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  // ✅ Image URL Helper
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
        alert('Book added to cart successfully!');
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-8">
            {/* Image Section */}
            <div className="flex items-center justify-center bg-gray-100 rounded-xl p-8">
              <img
                src={getImageUrl(book.image)}
                alt={book.title}
                className="max-h-96 w-auto object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/400x600/3b82f6/ffffff?text=📚+Book';
                }}
              />
            </div>

            {/* Details Section */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${
                    book.condition === 'New' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {book.condition}
                  </span>
                  {book.category && (
                    <span className="ml-2 inline-block px-4 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                      {book.category}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                  {book.title}
                </h1>

                <p className="text-xl text-gray-600 mb-6">
                  by <span className="font-semibold">{book.author}</span>
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-blue-600">₹{book.price}</span>
                  </div>
                </div>

                {book.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{book.description}</p>
                  </div>
                )}

                {/* Seller Info */}
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Seller Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 font-medium mb-1">
                      {book.seller?.name || `${book.seller?.firstName} ${book.seller?.lastName}`}
                    </p>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Mobile:</span> {book.seller?.mobile}
                    </p>
                    {book.seller?.email && (
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Email:</span> {book.seller?.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !book.isAvailable}
                  className="flex-1 px-6 py-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={addingToCart || !book.isAvailable}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {!book.isAvailable && (
                <p className="text-red-600 text-center mt-4 font-semibold">
                  This book is currently unavailable
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;