import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiHeart, FiShare2, FiMapPin, FiPhone, FiMail, FiStar, FiShoppingCart } from 'react-icons/fi';
import { booksAPI, cartAPI } from '../services/api';
import ReviewsList from '../components/ReviewsList';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwner = book?.seller?._id === currentUser?._id;

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const response = await booksAPI.getById(id);
      setBook(response.data.book);
      setLiked(response.data.book.likes?.includes(currentUser._id));
    } catch (err) {
      setError('Failed to load book details');
      console.error(err);
    } finally {
      setLoading(false);
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
      await cartAPI.add({ bookId: book._id, quantity: 1 });
      alert('Book added to cart!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `Check out ${book.title} by ${book.author}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Book Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const images = book.image ? [book.image] : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <button onClick={() => navigate('/')} className="hover:text-blue-600">Home</button>
          <span className="mx-2">/</span>
          <button onClick={() => navigate(`/?category=${book.category}`)} className="hover:text-blue-600">
            {book.category}
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{book.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Image Gallery */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
              <img
                src={images[selectedImage]}
                alt={book.title}
                className="w-full h-96 object-contain bg-gray-100"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/600x800/3b82f6/ffffff?text=📚+Book';
                }}
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-1 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Book Details */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-xl text-gray-600 mb-4">by {book.author}</p>

                {/* Rating */}
                {book.totalReviews > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          size={20}
                          className={`${
                            star <= Math.round(book.averageRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600">
                      {book.averageRating.toFixed(1)} ({book.totalReviews} reviews)
                    </span>
                  </div>
                )}

                {/* Condition Badge */}
                <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${
                  book.condition === 'New' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {book.condition}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  <FiShare2 size={20} />
                </button>
                <button
                  onClick={() => setLiked(!liked)}
                  className={`p-3 rounded-full border transition-colors ${
                    liked 
                      ? 'bg-red-50 border-red-300 text-red-600' 
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <FiHeart size={20} className={liked ? 'fill-current' : ''} />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">₹{book.price}</span>
                {book.originalPrice && book.originalPrice > book.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">₹{book.originalPrice}</span>
                    <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                      {Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-green-600 font-medium mt-2">✓ Free Delivery</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-8">
              {!isOwner ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={!book.isAvailable || addingToCart}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiShoppingCart size={24} />
                    {addingToCart ? 'Adding...' : book.isAvailable ? 'Add to Cart' : 'Sold Out'}
                  </button>

                  <button
                    onClick={() => navigate('/cart')}
                    disabled={!book.isAvailable}
                    className="w-full py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/edit-book/${book._id}`)}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                  >
                    Edit Book
                  </button>
                  <button
                    onClick={() => navigate('/manage-books')}
                    className="w-full py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    Manage Books
                  </button>
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="bg-white rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">Book Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-800">{book.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language</span>
                  <span className="font-medium text-gray-800">{book.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Condition</span>
                  <span className="font-medium text-gray-800">{book.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium text-gray-800">{book.views}</span>
                </div>
              </div>
            </div>

           {/* Seller Info */}
            {!isOwner && book.seller && (
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-bold text-gray-800 mb-4">Seller Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {book.seller.firstName?.[0] || book.seller.name?.[0] || 'S'}
                    </div>
                    <span className="font-medium text-gray-800">
                      {book.seller.firstName} {book.seller.lastName}
                    </span>
                  </div>

                  {book.seller.mobile && (
                    <a
                      href={`tel:${book.seller.mobile}`}
                      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <FiPhone size={18} />
                      <span>{book.seller.mobile}</span>
                    </a>
                  )}

                  {book.seller.email && (
                    <a
                      href={`mailto:${book.seller.email}`}
                      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <FiMail size={18} />
                      <span>{book.seller.email}</span>
                    </a>
                  )}
                </div>
              </div>
            )}

        {/* Description */}
        {book.description && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {book.description}
            </p>
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>

          {/* Rating Summary */}
          {book.totalReviews > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="text-center md:border-r md:border-gray-300 md:pr-8">
                  <div className="text-5xl font-bold text-gray-800 mb-2">
                    {book.averageRating.toFixed(1)}
                  </div>
                  <div className="flex gap-1 justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        size={20}
                        className={`${
                          star <= Math.round(book.averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm">{book.totalReviews} reviews</p>
                </div>

                <div className="flex-1 w-full">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = book.ratings?.get?.(star.toString()) || 0;
                    const percentage = book.totalReviews > 0 ? (count / book.totalReviews) * 100 : 0;
                    
                    return (
                      <div key={star} className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-600 w-8">{star}★</span>
                        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <ReviewsList bookId={book._id} />
        </div>
      </div>
    </div>
  );
};

export default BookDetails;