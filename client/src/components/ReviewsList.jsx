import { useState, useEffect } from 'react';
import { FiStar, FiThumbsUp } from 'react-icons/fi';
import { reviewsAPI } from '../services/api';

const ReviewsList = ({ bookId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getBookReviews(bookId);
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      await reviewsAPI.markHelpful(reviewId);
      fetchReviews();
    } catch (error) {
      console.error('Failed to mark helpful:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <FiStar size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Reviews Yet</h3>
        <p className="text-gray-600">Be the first to review this book!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800">
                  {review.user?.firstName} {review.user?.lastName}
                </span>
                <span className="text-gray-400 text-sm">•</span>
                <span className="text-gray-500 text-sm">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    size={16}
                    className={`${
                      star <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

          <button
            onClick={() => handleHelpful(review._id)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FiThumbsUp size={16} />
            <span>Helpful ({review.helpful?.length || 0})</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ReviewsList;