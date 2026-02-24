const Order = require('../models/Order');
const User = require('../models/User');
const shiprocketService = require('../services/shiprocketService');

// Create Shiprocket Order (Called when seller confirms order)
exports.confirmOrderAndCreateShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log('🔄 Confirming order and creating shipment:', orderId);

    // Get order with all necessary details
    const order = await Order.findById(orderId)
      .populate('buyer', 'firstName lastName email mobile')
      .populate('items.book', 'title author')
      .populate('items.seller', 'firstName lastName email mobile sellerAddress');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is already confirmed
    if (order.orderStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Order is already ${order.orderStatus}`
      });
    }

    // Get first seller (assuming single seller per order)
    const seller = order.items[0].seller;

    // Validate seller address
    if (!seller.sellerAddress || !seller.sellerAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Seller address is incomplete. Please complete your seller profile before confirming orders.',
        missingFields: !seller.sellerAddress ? 'Complete address' : 'Missing fields in address'
      });
    }

    // Check if seller address is complete
    const requiredFields = ['fullName', 'mobile', 'addressLine1', 'city', 'state', 'pincode'];
    const missingFields = requiredFields.filter(field => !seller.sellerAddress[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seller address is incomplete. Missing: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Validate buyer shipping address
    if (!order.shippingAddress || !order.shippingAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Buyer shipping address is incomplete'
      });
    }

    console.log('📦 Creating Shiprocket order...');
    console.log('📍 Pickup:', seller.sellerAddress.city, seller.sellerAddress.pincode);
    console.log('📍 Delivery:', order.shippingAddress.city, order.shippingAddress.pincode);

    // ✅ AUTOMATIC ADDRESS PICKUP - Create order in Shiprocket
    const shiprocketResponse = await shiprocketService.createOrderWithAutoAddress(order, seller);

    // Update order with Shiprocket details
    order.shiprocket = {
      order_id: shiprocketResponse.order_id || '',
      shipment_id: shiprocketResponse.shipment_id || '',
      awb_code: shiprocketResponse.awb_code || '',
      courier_company_id: shiprocketResponse.courier_company_id || 0,
      courier_name: shiprocketResponse.courier_name || '',
      current_status: shiprocketResponse.status || 'NEW',
      current_status_code: shiprocketResponse.status_code || 0
    };

    // Update order status
    order.orderStatus = 'confirmed';
    
    // Add to status history
    order.statusHistory.push({
      status: 'confirmed',
      timestamp: new Date(),
      note: 'Order confirmed and shipment created in Shiprocket',
      updatedBy: req.user._id
    });

    await order.save();

    console.log('✅ Order confirmed and shipment created successfully');

    res.status(200).json({
      success: true,
      message: 'Order confirmed and shipment created successfully',
      data: {
        order: {
          _id: order._id,
          orderStatus: order.orderStatus,
          invoiceNumber: order.invoiceNumber
        },
        shipment: {
          order_id: shiprocketResponse.order_id,
          shipment_id: shiprocketResponse.shipment_id,
          status: shiprocketResponse.status,
          status_code: shiprocketResponse.status_code
        }
      }
    });

  } catch (error) {
    console.error('❌ Confirm order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to confirm order and create shipment',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

// Assign Courier and Generate AWB
exports.assignCourier = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { courierId } = req.body;

    if (!courierId) {
      return res.status(400).json({
        success: false,
        message: 'Courier ID is required'
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.shiprocket || !order.shiprocket.shipment_id) {
      return res.status(400).json({
        success: false,
        message: 'Shiprocket shipment not found. Please create shipment first.'
      });
    }

    console.log('📋 Assigning courier and generating AWB...');

    // Assign courier and generate AWB
    const awbResponse = await shiprocketService.assignCourierAndGenerateAWB(
      order.shiprocket.shipment_id,
      courierId
    );

    // Update order with courier and AWB details
    order.shiprocket.awb_code = awbResponse.response?.data?.awb_code || '';
    order.shiprocket.courier_company_id = awbResponse.response?.data?.courier_company_id || courierId;
    order.shiprocket.courier_name = awbResponse.response?.data?.courier_name || '';
    order.trackingNumber = awbResponse.response?.data?.awb_code || '';

    await order.save();

    console.log('✅ Courier assigned and AWB generated');

    res.status(200).json({
      success: true,
      message: 'Courier assigned and AWB generated successfully',
      data: {
        awb_code: order.shiprocket.awb_code,
        courier_name: order.shiprocket.courier_name,
        tracking_number: order.trackingNumber
      }
    });

  } catch (error) {
    console.error('❌ Assign courier error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to assign courier'
    });
  }
};

// Schedule Pickup
exports.schedulePickup = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { pickupDate } = req.body;

    if (!pickupDate) {
      return res.status(400).json({
        success: false,
        message: 'Pickup date is required (format: YYYY-MM-DD)'
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.shiprocket || !order.shiprocket.shipment_id) {
      return res.status(400).json({
        success: false,
        message: 'Shiprocket shipment not found'
      });
    }

    console.log('🚚 Scheduling pickup for:', order.shiprocket.shipment_id);

    // Schedule pickup
    const pickupResponse = await shiprocketService.schedulePickup(
      order.shiprocket.shipment_id,
      pickupDate
    );

    // Update order with pickup details
    order.shiprocket.pickup_scheduled_date = new Date(pickupDate);
    order.shiprocket.pickup_token_number = pickupResponse.response?.pickup_token_number || '';
    
    await order.save();

    console.log('✅ Pickup scheduled successfully');

    res.status(200).json({
      success: true,
      message: 'Pickup scheduled successfully',
      data: {
        pickup_date: pickupDate,
        pickup_token: order.shiprocket.pickup_token_number
      }
    });

  } catch (error) {
    console.error('❌ Schedule pickup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to schedule pickup'
    });
  }
};

// Track Shipment
exports.trackShipment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.shiprocket || !order.shiprocket.shipment_id) {
      return res.status(404).json({
        success: false,
        message: 'Shiprocket shipment not found for this order'
      });
    }

    // Track shipment
    const tracking = await shiprocketService.trackShipment(order.shiprocket.shipment_id);

    res.status(200).json({
      success: true,
      data: tracking
    });

  } catch (error) {
    console.error('❌ Track shipment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to track shipment'
    });
  }
};

// Get Available Couriers for an Order
exports.getAvailableCouriers = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('items.seller', 'sellerAddress');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const seller = order.items[0].seller;
    
    if (!seller.sellerAddress || !seller.sellerAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Seller address is incomplete'
      });
    }

    // Calculate total weight
    const totalWeight = order.items.reduce((sum, item) => {
      return sum + (0.5 * item.quantity);  // 0.5kg per book
    }, 0);

    // Get available couriers
    const couriers = await shiprocketService.getAvailableCouriers(
      seller.sellerAddress.pincode,
      order.shippingAddress.pincode,
      totalWeight,
      order.paymentMethod === 'cod',
      order.totalAmount
    );

    res.status(200).json({
      success: true,
      data: couriers,
      count: couriers.length
    });

  } catch (error) {
    console.error('❌ Get couriers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch available couriers'
    });
  }
};

// Generate Shipping Label
exports.generateShippingLabel = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.shiprocket || !order.shiprocket.shipment_id) {
      return res.status(400).json({
        success: false,
        message: 'Shiprocket shipment not found'
      });
    }

    // Generate label
    const labelUrl = await shiprocketService.generateShippingLabel(order.shiprocket.shipment_id);

    // Update order
    order.shiprocket.label_url = labelUrl;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Shipping label generated successfully',
      data: {
        label_url: labelUrl
      }
    });

  } catch (error) {
    console.error('❌ Generate label error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate shipping label'
    });
  }
};

// Shiprocket Webhook Handler
exports.handleWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    
    console.log('📥 Shiprocket Webhook received:', webhookData);

    // Find order by AWB or Order ID
    const order = await Order.findOne({
      $or: [
        { 'shiprocket.awb_code': webhookData.awb },
        { 'shiprocket.order_id': webhookData.order_id }
      ]
    });

    if (!order) {
      console.log('⚠️ Order not found for webhook');
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status based on webhook
    order.shiprocket.current_status = webhookData.current_status || '';
    order.shiprocket.current_status_code = webhookData.current_status_code || 0;

    // Map Shiprocket status to our order status
    if (webhookData.current_status_code === 6) {
      order.orderStatus = 'shipped';
      order.statusHistory.push({
        status: 'shipped',
        timestamp: new Date(),
        note: `Shipped via ${webhookData.courier_name || 'courier'}`
      });
    } else if (webhookData.current_status_code === 7) {
      order.orderStatus = 'delivered';
      order.actualDelivery = new Date();
      order.shiprocket.delivered_date = new Date();
      order.statusHistory.push({
        status: 'delivered',
        timestamp: new Date(),
        note: 'Order delivered successfully'
      });
    }

    await order.save();

    console.log('✅ Webhook processed successfully');

    res.status(200).json({ 
      success: true,
      message: 'Webhook processed successfully' 
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Webhook processing failed' 
    });
  }
};

module.exports = {
  confirmOrderAndCreateShipment: exports.confirmOrderAndCreateShipment,
  assignCourier: exports.assignCourier,
  schedulePickup: exports.schedulePickup,
  trackShipment: exports.trackShipment,
  getAvailableCouriers: exports.getAvailableCouriers,
  generateShippingLabel: exports.generateShippingLabel,
  handleWebhook: exports.handleWebhook
};