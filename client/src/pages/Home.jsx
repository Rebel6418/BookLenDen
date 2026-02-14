import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    condition: 'All',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { name: 'All', icon: '📚' },
    { name: 'Engineering', icon: '⚙️' },
    { name: 'Medical', icon: '⚕️' },
    { name: 'School', icon: '🎒' },
    { name: 'Novels', icon: '📖' },
    { name: 'Commerce', icon: '💼' },
    { name: 'Arts', icon: '🎨' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [filters]);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category !== 'All') params.append('category', filters.category);
      if (filters.condition !== 'All') params.append('condition', filters.condition);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      params.append('sortBy', filters.sortBy);

      const response = await api.get(`/books?${params.toString()}`);
      setBooks(response.data.books || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      condition: 'All',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold mb-4">
              India&apos;s #1 Book Marketplace
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Buy & Sell Books at Amazing Prices • 100% Authentic • Fast Delivery
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-6 py-4 pr-14 rounded-full text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/50 shadow-xl"
                />
                <button className="absolute right-2 top-2 p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-lg transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                <span className="text-2xl">✓</span>
                <span className="font-semibold">10,000+ Books</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                <span className="text-2xl">✓</span>
                <span className="font-semibold">5,000+ Users</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                <span className="text-2xl">✓</span>
                <span className="font-semibold">Verified Sellers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories & Filters */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Categories */}
          <div className="flex items-center gap-3 py-4 overflow-x-auto scrollbar-hide border-b border-gray-100">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleFilterChange('category', category.name)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all ${
                  filters.category === category.name
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md border border-gray-200'
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Filter Controls */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-all font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filters</span>
                {showFilters && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full ml-1">Open</span>}
              </button>

              {filters.condition !== 'All' && (
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                  {filters.condition}
                  <button onClick={() => handleFilterChange('condition', 'All')} className="hover:text-blue-900">✕</button>
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                  ₹{filters.minPrice || '0'} - ₹{filters.maxPrice || '∞'}
                  <button onClick={() => { handleFilterChange('minPrice', ''); handleFilterChange('maxPrice', ''); }} className="hover:text-green-900">✕</button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="title">Title: A to Z</option>
              </select>

              {(filters.search || filters.category !== 'All' || filters.condition !== 'All' || filters.minPrice || filters.maxPrice) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-all"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="py-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Condition</label>
                  <div className="flex gap-2">
                    {['All', 'New', 'Old'].map(cond => (
                      <button
                        key={cond}
                        onClick={() => handleFilterChange('condition', cond)}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                          filters.condition === cond
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Price Range (₹)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-1/2 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-1/2 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Quick Price Filters</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => { handleFilterChange('minPrice', ''); handleFilterChange('maxPrice', '100'); }}
                      className="py-2 px-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200"
                    >
                      Under ₹100
                    </button>
                    <button
                      onClick={() => { handleFilterChange('minPrice', '100'); handleFilterChange('maxPrice', '500'); }}
                      className="py-2 px-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200"
                    >
                      ₹100-500
                    </button>
                    <button
                      onClick={() => { handleFilterChange('minPrice', '500'); handleFilterChange('maxPrice', ''); }}
                      className="py-2 px-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200"
                    >
                      ₹500+
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Books Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-32">
            <div className="inline-block p-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
              <svg className="w-24 h-24 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">No Books Found</h3>
            <p className="text-gray-600 text-lg mb-8">
              {filters.search || filters.category !== 'All' || filters.condition !== 'All' || filters.minPrice || filters.maxPrice
                ? 'Try adjusting your filters'
                : 'Be the first to list a book!'}
            </p>
            {(filters.search || filters.category !== 'All' || filters.condition !== 'All' || filters.minPrice || filters.maxPrice) ? (
              <button
                onClick={clearFilters}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => navigate('/sell')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                🚀 List Your First Book
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {filters.category === 'All' ? 'All Books' : filters.category}
                </h2>
                <p className="text-gray-600 mt-1">
                  {books.length} book{books.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <button
                onClick={fetchBooks}
                className="px-6 py-3 bg-white text-gray-700 rounded-full font-medium shadow-md hover:shadow-lg border border-gray-200 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard key={book._id} book={book} navigate={navigate} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Book Card Component with Wishlist
const BookCard = ({ book, navigate }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isCheckingWishlist, setIsCheckingWishlist] = useState(false);

  useEffect(() => {
    checkWishlistStatus();
  }, [book._id]);

  const checkWishlistStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      setIsCheckingWishlist(true);
      const response = await api.get(`/wishlist/check/${book._id}`);
      setIsInWishlist(response.data.isInWishlist);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // User not logged in or error
    } finally {
      setIsCheckingWishlist(false);
    }
  };

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/remove/${book._id}`);
        setIsInWishlist(false);
      } else {
        await api.post('/wishlist/add', { bookId: book._id });
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
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

  return (
    <div
      onClick={() => navigate(`/book/${book._id}`)}
      className="group relative bg-white rounded-2xl shadow-card hover:shadow-premium transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2"
    >
      <div className="relative h-72 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={getImageUrl(book.image)}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/400x600/3b82f6/ffffff?text=📚+Book';
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Wishlist Heart Button */}
        <button
          onClick={toggleWishlist}
          disabled={isCheckingWishlist}
          className="absolute top-4 left-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-all z-10"
        >
          {isInWishlist ? (
            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-600 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>

        {/* Condition Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
            book.condition === 'New' 
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
              : 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white'
          }`}>
            {book.condition}
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="px-6 py-3 bg-white text-gray-900 rounded-full font-bold shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
            View Details →
          </button>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {book.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-1">
          by {book.author}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ₹{book.price}
            </span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/book/${book._id}`);
            }}
            className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;