import { useNavigate } from 'react-router-dom';

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/book/${book._id}`)}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
    >
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        <img
          src={`http://localhost:5000/uploads/${book.image}`}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x400?text=Book+Cover';
          }}
        />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
            book.condition === 'New' 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            {book.condition}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg mb-1 truncate" title={book.title}>
          {book.title}
        </h3>
        <p className="text-gray-500 text-sm mb-3 truncate" title={book.author}>
          by {book.author}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              ₹{book.price}
            </span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/book/${book._id}`);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;