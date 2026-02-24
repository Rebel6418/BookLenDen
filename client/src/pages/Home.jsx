import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import api from '../services/api';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const mainCategories = [
    { name: 'All', icon: '📚', subcategories: [] },
    { name: 'Competitive Exams', icon: '🎯', subcategories: ['UPSC', 'SSC', 'Banking', 'Railway'] },
    { name: 'Entrance Exams', icon: '📝', subcategories: ['JEE', 'NEET', 'GATE', 'CAT'] },
    { name: 'School Books', icon: '🎒', subcategories: ['Class 1-5', 'Class 6-8', 'Class 9-10', 'Class 11-12'] },
    { name: 'Engineering', icon: '⚙️', subcategories: ['Computer Science', 'Mechanical', 'Civil'] },
    { name: 'Medical', icon: '🩺', subcategories: ['MBBS', 'BDS', 'Nursing'] },
    { name: 'College', icon: '🎓', subcategories: ['B.Tech', 'B.Sc', 'B.Com'] },
    { name: 'Fiction', icon: '📖', subcategories: ['Novel', 'Romance', 'Thriller'] },
    { name: 'Non-Fiction', icon: '📚', subcategories: ['Self Help', 'Business'] },
    { name: 'Motivational', icon: '💡', subcategories: ['Personal Development'] }
  ];

  useEffect(() => {
    fetchBooks();
  }, [selectedCategory]);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const params = selectedCategory !== 'All' ? `?category=${selectedCategory}` : '';
      const response = await api.get(`/books${params}`);
      setBooks(response.data.books || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* ORIGINAL Hero Section - UNCHANGED */}
      <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full filter blur-3xl"></div>
        </div>
        
        <div 
          className="absolute inset-0 opacity-10" 
          style={{
            backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="text-center">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-blue-100 mb-6">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-700">India's Trusted Book Marketplace</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
              Buy & Sell Books
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                At Best Prices
              </span>
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-700 shadow-sm border border-gray-100">
                📚 10,000+ Books
              </span>
              <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-700 shadow-sm border border-gray-100">
                ✨ 5,000+ Users
              </span>
              <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-700 shadow-sm border border-gray-100">
                ✅ 100% Authentic
              </span>
            </div>
            
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-all duration-300"></div>
                
                <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-shadow">
                  <div className="pl-6 pr-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, author, or ISBN..."
                    className="flex-1 px-4 py-4 text-gray-900 placeholder-gray-500 focus:outline-none text-base bg-transparent"
                  />
                  <button 
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
                  >
                    <span className="hidden sm:inline">Search</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
            
            <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-700">Verified</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-700">Best Price</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-700">Fast Delivery</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-10 md:h-16 fill-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </div>

      {/* ORIGINAL Categories - UNCHANGED */}
      <div className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 py-4 overflow-x-auto scrollbar-hide">
            {mainCategories.map((category) => (
              <div
                key={category.name}
                className="relative"
                onMouseEnter={() => category.subcategories.length > 0 && setHoveredCategory(category.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <button
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setHoveredCategory(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.name
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm">{category.name}</span>
                  {category.subcategories.length > 0 && (
                    <svg 
                      className={`w-4 h-4 ml-1 transition-transform ${hoveredCategory === category.name ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {hoveredCategory === category.name && category.subcategories.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 min-w-[220px] z-[9999]" style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
                    <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-l border-t border-gray-100 transform rotate-45"></div>
                    
                    <button
                      onClick={() => {
                        setSelectedCategory(category.name);
                        setHoveredCategory(null);
                      }}
                      className="w-full text-left px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      All {category.name}
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    {category.subcategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => {
                          setSelectedCategory(sub);
                          setHoveredCategory(null);
                        }}
                        className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NEW AMAZON-STYLE BOOK CARDS SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Books Found</h3>
            <p className="text-gray-600">Try a different category</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === 'All' ? 'All Books' : selectedCategory}
              </h2>
              <p className="text-gray-600 mt-1">{books.length} books available</p>
            </div>

            {/* AMAZON-STYLE GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {books.map((book) => (
                <AmazonBookCard key={book._id} book={book} navigate={navigate} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// AMAZON-STYLE BOOK CARD - ONLY THIS IS NEW
const AmazonBookCard = ({ book, navigate }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-lg border border-gray-200 hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
    >
      <div onClick={() => navigate(`/book/${book._id}`)} className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        <img
          src={book.image || 'https://placehold.co/300x400/3b82f6/ffffff?text=📚'}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/300x400/3b82f6/ffffff?text=📚';
          }}
        />
        
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded text-xs font-bold ${
            book.condition === 'New' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            {book.condition}
          </span>
        </div>

        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent flex flex-col justify-end p-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                alert('Added to cart!');
              }}
              className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded shadow-lg"
            >
              Add to Cart
            </button>
          </div>
        )}
      </div>

      <div onClick={() => navigate(`/book/${book._id}`)} className="p-3">
        <div className="text-xs text-blue-600 font-semibold mb-1 truncate">
          {book.category}
        </div>
        
        <h3 className="font-semibold text-sm line-clamp-2 mb-1 min-h-[2.5rem]">
          {book.title}
        </h3>
        
        <p className="text-xs text-gray-600 truncate mb-2">
          by {book.author}
        </p>

        <div className="flex text-yellow-400 text-sm mb-2">
          {'★'.repeat(4)}{'☆'}
        </div>

        <div className="text-xl font-bold text-gray-900 mb-1">
          ₹{book.price}
        </div>

        <div className="text-xs text-green-700 font-semibold">
          🚚 Free Delivery
        </div>
      </div>
    </div>
  );
};

export default Home;