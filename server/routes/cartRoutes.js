const express = require('express');
const router = express.Router();
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');  // ✅ FIXED: Named import

// All routes protected
router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.put('/update', protect, updateCartItem);
router.delete('/remove/:bookId', protect, removeFromCart);
router.delete('/clear', protect, clearCart);

module.exports = router;