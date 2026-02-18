import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiEye, FiStar } from 'react-icons/fi';

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/300x400/e0e7ff/4f46e5?text=📚+Book';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // TODO: Call wishlist API
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    // TODO: Add to cart API call
    alert('Added to cart!');
  };

  const calculateDiscount = () => {
    const mrp = Math.round(book.price * 1.4); // 40% discount assumed
    const discount = Math.round(((mrp - book.price) / mrp) * 100);
    return { mrp, discount };
  };

  const { mrp, discount } = calculateDiscount();

  return (
    <div 
      onClick={() => navigate(`/book/${book._id}`)}
      className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-blue-200"
    >
      {/* Image Container */}
      <div className="relative h-72 bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
        <img
          src={getImageUrl(book.image)}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            if (!imageError) {
              e.target.src = 'https://placehold.co/300x400/e0e7ff/4f46e5?text=📚+Book';
              setImageError(true);
            }
          }}
        />
        
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="p-3 bg-white text-gray-800 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transform hover:scale-110 transition-all"
              title="Add to Cart"
            >
              <FiShoppingCart size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/book/${book._id}`);
              }}
              className="p-3 bg-white text-gray-800 rounded-full shadow-lg hover:bg-purple-600 hover:text-white transform hover:scale-110 transition-all"
              title="Quick View"
            >
              <FiEye size={20} />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
            book.condition === 'New' 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            {book.condition === 'New' ? '✨ New' : '📘 Used'}
          </span>
          
          {/* Wishlist Heart */}
          <button
            onClick={handleWishlist}
            className={`p-2 rounded-full shadow-lg backdrop-blur-sm transition-all ${
              isWishlisted 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <FiHeart size={18} className={isWishlisted ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
              {discount}% OFF
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {book.category && (
          <span className="text-xs text-purple-600 font-semibold uppercase tracking-wide">
            {book.category}
          </span>
        )}

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base mt-1 mb-1 line-clamp-2 leading-snug min-h-[2.5rem]" title={book.title}>
          {book.title}
        </h3>

        {/* Author */}
        <p className="text-gray-500 text-sm mb-3 truncate" title={book.author}>
          by {book.author}
        </p>

        {/* Rating (Placeholder) */}
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4].map((star) => (
            <FiStar key={star} size={14} className="text-yellow-400 fill-current" />
          ))}
          <FiStar size={14} className="text-gray-300" />
          <span className="text-xs text-gray-500 ml-1">(4.0)</span>
        </div>

        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-gray-900">
            ₹{book.price}
          </span>
          {discount > 0 && (
            <>
              <span className="text-sm text-gray-400 line-through">
                ₹{mrp}
              </span>
            </>
          )}
        </div>

        {/* Add to Cart Button - Always Visible on Mobile, Hover on Desktop */}
        <button
          onClick={handleAddToCart}
          className="w-full py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 md:opacity-0 md:group-hover:opacity-100"
        >
          <FiShoppingCart size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default BookCard;