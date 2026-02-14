import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MyBooks = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/books/my');
      if (response.data.success) {
        setBooks(response.data.books);
      }
    } catch (err) {
      console.error('Failed to fetch books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    setDeletingId(bookId);
    try {
      const response = await api.delete(`/books/${bookId}`);
      if (response.data.success) {
        setBooks(books.filter(book => book._id !== bookId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete book');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleAvailability = async (bookId, currentStatus) => {
    try {
      const response = await api.put(`/books/${bookId}`, {
        isAvailable: !currentStatus
      });

      if (response.data.success) {
        setBooks(books.map(book => 
          book._id === bookId ? { ...book, isAvailable: !currentStatus } : book
        ));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update book');
    }
  };

  // ✅ Image URL helper function
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

  if (books.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-24 w-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No books listed yet</h2>
          <p className="text-gray-600 mb-6">Start selling by listing your first book!</p>
          <button
            onClick={() => navigate('/sell')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sell Your First Book
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Books</h1>
          <button
            onClick={() => navigate('/sell')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Add New Book
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all">
              <div className="relative">
               <img
               src={book.image}
               alt={book.title}
               className="w-32 h-44 object-cover rounded-lg"
               onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/400x600/gray/ffffff?text=📚+Book';
                }}
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    book.condition === 'New' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-500 text-white'
                  }`}>
                    {book.condition}
                  </span>
                </div>
                {!book.isAvailable && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold">
                      Unavailable
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">{book.title}</h3>
                <p className="text-gray-500 text-sm mb-3 truncate">by {book.author}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">₹{book.price}</span>
                  <span className="text-sm text-gray-500">
                    {book.category}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleAvailability(book._id, book.isAvailable)}
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      book.isAvailable 
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {book.isAvailable ? 'Mark as Sold' : 'Mark as Available'}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/book/${book._id}`)}
                      className="flex-1 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(book._id)}
                      disabled={deletingId === book._id}
                      className="flex-1 py-2 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      {deletingId === book._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyBooks;