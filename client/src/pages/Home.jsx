import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const categories = [
    { name: 'All', icon: '📚' },
    { name: 'Engineering', icon: '⚙️' },
    { name: 'Medical', icon: '⚕️' },
    { name: 'School', icon: '🎒' },
    { name: 'Novels', icon: '📖' },
    { name: 'Old Books', icon: '📕' },
    { name: 'New Books', icon: '✨' },
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/books');
      setBooks(response.data.books || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBooks = selectedCategory === 'All' 
    ? books 
    : books.filter(book => {
        if (selectedCategory === 'Old Books') return book.condition === 'Old';
        if (selectedCategory === 'New Books') return book.condition === 'New';
        return book.category === selectedCategory;
      });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold mb-6">
              India&apos;s #1 Book Marketplace
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Buy & Sell Books at Amazing Prices • 100% Authentic • Fast Delivery
            </p>
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

      {/* Categories */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === category.name
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md border border-gray-200'
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-600 font-medium">Loading books...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-32">
            <div className="inline-block p-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
              <svg className="w-24 h-24 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-3">No Books Found</h3>
            <p className="text-gray-600 text-lg mb-8">
              {selectedCategory === 'All' 
                ? 'Be the first to list a book!' 
                : `No books in ${selectedCategory} yet.`}
            </p>
            <button
              onClick={() => navigate('/sell')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              🚀 List Your First Book
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === 'All' ? 'All Books' : selectedCategory}
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} available
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
              {filteredBooks.map((book) => (
                <BookCard key={book._id} book={book} navigate={navigate} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ✅ Book Card Component with Image Helper
const BookCard = ({ book, navigate }) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/400x600/3b82f6/ffffff?text=📚+Book';
    if (imagePath.startsWith('http')) return imagePath;
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