const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  getMySales,
  cancelOrder,
  updateOrderStatus,
  downloadInvoice
} = require('../controllers/orderController');

// Order routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/my-sales', protect, getMySales);
router.get('/:orderId', protect, getOrderById);
router.post('/:orderId/cancel', protect, cancelOrder);
router.put('/:orderId/status', protect, updateOrderStatus);
router.get('/:orderId/invoice', protect, downloadInvoice);

module.exports = router;