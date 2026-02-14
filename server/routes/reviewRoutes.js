const express = require('express');
const router = express.Router();
const {
  createReview,
  getBookReviews,
  updateReview,
  deleteReview,
  markHelpful
} = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route
router.get('/book/:bookId', getBookReviews);

// Protected routes
router.post('/', authMiddleware, createReview);
router.put('/:reviewId', authMiddleware, updateReview);
router.delete('/:reviewId', authMiddleware, deleteReview);
router.post('/:reviewId/helpful', authMiddleware, markHelpful);

module.exports = router;