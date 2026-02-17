const express = require('express');
const router = express.Router();
const {
  createOrder,
  confirmOrder,
  updateOrderStatus,
  getMyOrders,
  getMySales,
  getOrderById,
  cancelOrder,
  getTracking,
  downloadInvoice
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// ✅ BUYER ROUTES
router.post('/', protect, createOrder);                          // Place order
router.get('/my-orders', protect, getMyOrders);                  // Get my orders
router.get('/:orderId', protect, getOrderById);                  // Get single order
router.post('/:orderId/cancel', protect, cancelOrder);           // Cancel order
router.get('/:orderId/invoice', protect, downloadInvoice);       // Download invoice
router.get('/:orderId/track', protect, getTracking);             // Track order

// ✅ SELLER ROUTES
router.get('/seller/my-sales', protect, getMySales);             // Get my sales
router.post('/:orderId/confirm', protect, confirmOrder);         // Confirm order (→ Shiprocket)
router.put('/:orderId/status', protect, updateOrderStatus);      // Update status

module.exports = router;