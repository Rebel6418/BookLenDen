import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const CategoryPage = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const navigate = useNavigate();

  // Subcategories mapping
  const categorySubcategories = {
    'Competitive Exams': ['All', 'UPSC', 'SSC', 'Banking', 'Railway', 'State PCS', 'NDA', 'Defence'],
    'Entrance Exams': ['All', 'JEE', 'NEET', 'GATE', 'CAT', 'CUET', 'CLAT'],
    'School Books': ['All', 'Class 1-5', 'Class 6-8', 'Class 9-10', 'Class 11-12'],
    'Engineering': ['All', 'Computer Science', 'Mechanical', 'Civil', 'Electrical', 'Electronics'],
    'Medical': ['All', 'MBBS', 'BDS', 'Nursing', 'Pharmacy'],
    'College': ['All', 'B.Tech', 'B.Sc', 'B.Com', 'BBA', 'MBA'],
    'Fiction': ['All', 'Novel', 'Romance', 'Thriller', 'Mystery'],
    'Non-Fiction': ['All', 'Self Help', 'Business', 'Biography'],
    'Motivational': ['All', 'Personal Development', 'Success']
  };

  const subcategories = categorySubcategories[category] || ['All'];

  useEffect(() => {
    const sub = searchParams.get('sub');
    if (sub) {
      setSelectedSubcategory(sub);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchBooks();
  }, [category, selectedSubcategory]);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      let query = `?category=${category}`;
      if (selectedSubcategory !== 'All') {
        query += `&subcategory=${selectedSubcategory}`;
      }
      const response = await api.get(`/books${query}`);
      setBooks(response.data.books || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubcategoryChange = (sub) => {
    setSelectedSubcategory(sub);
    if (sub === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ sub });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <button onClick={() => navigate('/')} className="hover:text-blue-600">
              Home
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{category}</span>
            {selectedSubcategory !== 'All' && (
              <>
                <span>/</span>
                <span className="text-gray-900 font-medium">{selectedSubcategory}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{category}</h1>

          {/* Subcategories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => handleSubcategoryChange(sub)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedSubcategory === sub
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Books Found</h3>
            <p className="text-gray-600">
              No books available in {selectedSubcategory === 'All' ? category : selectedSubcategory}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">{books.length} books found</p>
            </div>

            {/* Same Compact Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
              {books.map((book) => (
                <CompactBookCard key={book._id} book={book} navigate={navigate} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Same Compact Book Card
const CompactBookCard = ({ book, navigate }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await api.get(`/wishlist/check/${book._id}`);
        setIsInWishlist(response.data.isInWishlist);
      } catch (error) {
        // Silent fail
      }
    };
    checkWishlistStatus();
  }, [book._id]);

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
    if (!imagePath) return 'https://placehold.co/300x400/3b82f6/ffffff?text=📚';
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
      className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden"
    >
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        <img
          src={getImageUrl(book.image)}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/300x400/3b82f6/ffffff?text=📚';
          }}
        />
        
        <button
          onClick={toggleWishlist}
          className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-full shadow-md hover:scale-110 transition-all"
        >
          {isInWishlist ? (
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>

        <div className="absolute top-2 right-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            book.condition === 'New' 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            {book.condition}
          </span>
        </div>
      </div>

      <div className="p-2">
        <h3 className="font-semibold text-gray-900 text-xs md:text-sm line-clamp-2 mb-1 leading-tight">
          {book.title}
        </h3>
        <p className="text-gray-600 text-xs line-clamp-1 mb-2">
          {book.author}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg md:text-xl font-bold text-blue-600">
            ₹{book.price}
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/book/${book._id}`);
            }}
            className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;