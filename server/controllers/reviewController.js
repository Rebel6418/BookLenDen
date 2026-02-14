const Review = require('../models/Review');
const Book = require('../models/Book');
const Order = require('../models/Order');

// Create review
const createReview = async (req, res) => {
  try {
    const { bookId, orderId, rating, comment, images } = req.body;

    console.log('⭐ Create Review:', { user: req.user._id, bookId, rating });

    if (!bookId || !orderId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Book ID, Order ID, rating, and comment are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if order exists and is delivered
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own purchases'
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'You can only review delivered orders'
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      book: bookId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this book'
      });
    }

    // Create review
    const review = await Review.create({
      book: bookId,
      user: req.user._id,
      order: orderId,
      rating,
      comment,
      images: images || []
    });

    // Update book ratings
    await updateBookRatings(bookId);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name firstName lastName')
      .populate('book', 'title');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: populatedReview
    });
  } catch (error) {
    console.error('❌ Create Review Error:', error);
    res.status(500).json({
      success: false,
      message: error.code === 11000 ? 'You have already reviewed this book' : 'Failed to create review'
    });
  }
};

// Get book reviews
const getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { sort = '-createdAt', limit = 10, page = 1 } = req.query;

    const reviews = await Review.find({ book: bookId })
      .populate('user', 'name firstName lastName')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments({ book: bookId });

    res.json({
      success: true,
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get Reviews Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
};

// Update review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, images } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    await review.save();

    // Update book ratings
    await updateBookRatings(review.book);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name firstName lastName')
      .populate('book', 'title');

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: populatedReview
    });
  } catch (error) {
    console.error('❌ Update Review Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    const bookId = review.book;
    await Review.findByIdAndDelete(reviewId);

    // Update book ratings
    await updateBookRatings(bookId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete Review Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
};

// Mark review as helpful
const markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const alreadyMarked = review.helpful.includes(req.user._id);

    if (alreadyMarked) {
      // Remove from helpful
      review.helpful = review.helpful.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      // Add to helpful
      review.helpful.push(req.user._id);
    }

    await review.save();

    res.json({
      success: true,
      message: alreadyMarked ? 'Unmarked as helpful' : 'Marked as helpful',
      helpfulCount: review.helpful.length
    });
  } catch (error) {
    console.error('❌ Mark Helpful Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review'
    });
  }
};

// Helper: Update book ratings
const updateBookRatings = async (bookId) => {
  try {
    const reviews = await Review.find({ book: bookId });

    if (reviews.length === 0) {
      await Book.findByIdAndUpdate(bookId, {
        averageRating: 0,
        totalReviews: 0,
        ratings: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      ratingCounts[review.rating]++;
    });

    await Book.findByIdAndUpdate(bookId, {
      averageRating: parseFloat(averageRating),
      totalReviews: reviews.length,
      ratings: ratingCounts
    });
  } catch (error) {
    console.error('Error updating book ratings:', error);
  }
};

module.exports = {
  createReview,
  getBookReviews,
  updateReview,
  deleteReview,
  markHelpful
};