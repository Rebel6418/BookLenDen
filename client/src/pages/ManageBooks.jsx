import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI } from '../services/api';
import { FiEdit2, FiTrash2, FiPlus, FiEye } from 'react-icons/fi';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    try {
      setIsLoading(true);
      const response = await booksAPI.getMyBooks();
      setBooks(response.data.books);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch books');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      await booksAPI.deleteBook(id);
      setBooks(books.filter(book => book._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete book');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      available: 'bg-green-100 text-green-700',
      sold: 'bg-gray-100 text-gray-700',
      reserved: 'bg-yellow-100 text-yellow-700'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Books</h1>
            <p className="text-gray-600 mt-2">Manage your book listings</p>
          </div>
          
          <Link
            to="/add-book"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
          >
            <FiPlus /> Add New Book
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {books.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FiPlus size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No books yet</h3>
            <p className="text-gray-600 mb-6">Start selling by adding your first book!</p>
            <Link
              to="/add-book"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <FiPlus /> Add Your First Book
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {books.map((book) => (
              <div key={book._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex gap-6">
                  <img
                    src={book.images[0] || 'https://via.placeholder.com/150x200?text=No+Image'}
                    alt={book.title}
                    className="w-32 h-44 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{book.title}</h3>
                        <p className="text-gray-600">by {book.author}</p>
                      </div>
                      {getStatusBadge(book.status)}
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{book.description}</p>
                    
                    <div className="flex items-center gap-6 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">Price</span>
                        <p className="text-2xl font-bold text-blue-600">₹{book.price}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500">Condition</span>
                        <p className="font-semibold text-gray-700">{book.condition}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500">Category</span>
                        <p className="font-semibold text-gray-700">{book.category}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-500">Views</span>
                        <p className="font-semibold text-gray-700 flex items-center gap-1">
                          <FiEye className="text-gray-400" /> {book.views}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Link
                        to={`/edit-book/${book._id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                      >
                        <FiEdit2 /> Edit
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(book._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                      >
                        <FiTrash2 /> Delete
                      </button>
                      
                      <Link
                        to={`/book/${book._id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                      >
                        <FiEye /> View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBooks;