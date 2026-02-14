const express = require('express');
const router = express.Router();

const {
  getAllBooks,
  getBookById,
  createBook,
  getMyBooks,
  updateBook,
  deleteBook
} = require('../controllers/bookController');

const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// ✅ SPECIFIC PROTECTED ROUTE FIRST (before dynamic :id)
router.get('/my', protect, getMyBooks);  // ✅ Changed from /my/books to /my

// Public routes
router.get('/', getAllBooks);

// Protected routes
router.post('/', protect, upload.single('image'), createBook);

// ✅ Dynamic routes LAST
router.get('/:id', getBookById);
router.put('/:id', protect, updateBook);
router.delete('/:id', protect, deleteBook);

module.exports = router;
