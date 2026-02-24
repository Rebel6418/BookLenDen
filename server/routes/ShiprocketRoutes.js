const express = require('express');
const router = express.Router();
const shiprocketController = require('../controllers/Shiprocketcontroller');
const { protect, admin } = require('../middleware/authMiddleware');

// ✅ Confirm Order & Create Shipment (AUTOMATIC ADDRESS PICKUP)
// Called when seller confirms an order
router.post('/confirm-order/:orderId', protect, shiprocketController.confirmOrderAndCreateShipment);

// Get Available Couriers for an Order
router.get('/couriers/:orderId', protect, shiprocketController.getAvailableCouriers);

// Assign Courier & Generate AWB
router.post('/assign-courier/:orderId', protect, shiprocketController.assignCourier);

// Schedule Pickup
router.post('/schedule-pickup/:orderId', protect, shiprocketController.schedulePickup);

// Track Shipment
router.get('/track/:orderId', protect, shiprocketController.trackShipment);

// Generate Shipping Label
router.get('/label/:orderId', protect, shiprocketController.generateShippingLabel);

// Shiprocket Webhook (No authentication - Shiprocket calls this)
router.post('/webhook', shiprocketController.handleWebhook);

module.exports = router;