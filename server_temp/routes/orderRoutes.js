const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  getMySales 
} = require('../controllers/orderController');

// Order routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/my-sales', protect, getMySales);
router.get('/:orderId', protect, getOrderById);

module.exports = router;