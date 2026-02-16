import { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiEye, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import { bookManagementAPI } from '../../services/adminApi';

const BooksManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBooks();
  }, [currentPage, filterCategory, filterStatus, searchTerm]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookManagementAPI.getAllBooks({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined
      });
      setBooks(response.data.books);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      await bookManagementAPI.deleteBook(bookId);
      alert('Book deleted successfully');
      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete book');
    }
  };

  const handleToggleStatus = async (bookId) => {
    try {
      await bookManagementAPI.toggleBookStatus(bookId);
      alert('Book status updated');
      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const categories = ['All', 'Engineering', 'Medical', 'School', 'Novels', 'Commerce', 'Arts'];
  const statuses = ['All', 'Available', 'Sold', 'Reserved'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Book Management</h1>
            <p className="text-gray-600 mt-1">Manage all books in the marketplace</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              {statuses.map(status => (
                <option key={status} value={status.toLowerCase()}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Books Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No books found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Book</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Author</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Condition</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Seller</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {books.map((book) => (
                      <tr key={book._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={book.image}
                              alt={book.title}
                              className="w-12 h-16 object-cover rounded"
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/200x300/gray/fff?text=Book';
                              }}
                            />
                            <div className="max-w-xs">
                              <p className="font-semibold text-gray-900 line-clamp-1">{book.title}</p>
                              <p className="text-sm text-gray-500">ISBN: {book.isbn || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{book.author}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            {book.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">₹{book.price}</p>
                          {book.originalPrice && (
                            <p className="text-xs text-gray-500 line-through">₹{book.originalPrice}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            book.condition === 'new' ? 'bg-green-100 text-green-700' :
                            book.condition === 'like-new' ? 'bg-blue-100 text-blue-700' :
                            book.condition === 'good' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {book.condition}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            book.status === 'available' ? 'bg-green-100 text-green-700' :
                            book.status === 'sold' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {book.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 text-sm">
                          <p className="font-medium">{book.seller?.firstName} {book.seller?.lastName}</p>
                          <p className="text-xs text-gray-500">{book.seller?.mobile}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => window.open(`/book/${book._id}`, '_blank')}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Book"
                            >
                              <FiEye className="text-blue-600" size={18} />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(book._id)}
                              className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Toggle Status"
                            >
                              {book.status === 'available' ? (
                                <FiToggleRight className="text-green-600" size={18} />
                              ) : (
                                <FiToggleLeft className="text-gray-600" size={18} />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book._id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Book"
                            >
                              <FiTrash2 className="text-red-600" size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Total Books</p>
            <p className="text-3xl font-bold">{books.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Available</p>
            <p className="text-3xl font-bold">
              {books.filter(b => b.status === 'available').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Sold</p>
            <p className="text-3xl font-bold">
              {books.filter(b => b.status === 'sold').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Reserved</p>
            <p className="text-3xl font-bold">
              {books.filter(b => b.status === 'reserved').length}
            </p>
          </div> 
        </div>
      </div>
    </AdminLayout>
  );
};

export default BooksManagement;