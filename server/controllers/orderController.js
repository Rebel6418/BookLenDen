const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const nodemailer = require('nodemailer');

// ============================================
// EMAIL CONFIGURATION
// ============================================

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS (port 587)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates (development)
  }
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error.message);
    console.log('⚠️  Orders will be created but emails will not be sent');
  } else {
    console.log('✅ Email service ready');
  }
});

// ============================================
// HELPER: SEND ORDER EMAIL
// ============================================

const sendOrderEmail = async (user, order, type) => {
  try {
    // Check if user has email
    if (!user.email) {
      console.log('⚠️  User has no email address, skipping notification');
      return { success: false, reason: 'No email address' };
    }

    let subject, html;
    
    // Email templates based on order status
    switch(type) {
      case 'placed':
        subject = `✅ Order Confirmation - ${order.invoiceNumber}`;
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
              .content { background: #f9fafb; padding: 20px; margin: 20px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
              .button { background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; 
                       display: inline-block; border-radius: 5px; margin: 10px 0; }
              .details { background: white; padding: 15px; border-left: 4px solid #4f46e5; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📚 BookLenDen</h1>
                <h2>Thank You for Your Order!</h2>
              </div>
              
              <div class="content">
                <p>Hi <strong>${user.firstName || user.name}</strong>,</p>
                <p>Your order has been placed successfully! 🎉</p>
                
                <div class="details">
                  <p><strong>📋 Order ID:</strong> ${order.invoiceNumber}</p>
                  <p><strong>💰 Total Amount:</strong> ₹${order.totalAmount}</p>
                  <p><strong>📅 Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString('en-IN')}</p>
                  <p><strong>🚚 Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</p>
                  <p><strong>💳 Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                </div>
                
                <p>We'll send you another email when your order is shipped.</p>
                
                <p style="text-align: center;">
                  <a href="#" class="button">Track Your Order</a>
                </p>
              </div>
              
              <div class="footer">
                <p>Thank you for shopping with BookLenDen!</p>
                <p>If you have any questions, please contact us.</p>
                <p style="font-size: 10px; color: #999;">
                  This is an automated email. Please do not reply.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;
      
      case 'confirmed':
        subject = `🎯 Order Confirmed - ${order.invoiceNumber}`;
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #10b981; color: white; padding: 20px; text-align: center; }
              .content { background: #f9fafb; padding: 20px; margin: 20px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Order Confirmed!</h1>
              </div>
              
              <div class="content">
                <p>Hi <strong>${user.firstName || user.name}</strong>,</p>
                <p>Great news! Your order has been confirmed and will be shipped soon. 📦</p>
                
                <p><strong>Order ID:</strong> ${order.invoiceNumber}</p>
                <p>The seller is preparing your books for shipment.</p>
              </div>
              
              <div class="footer">
                <p>Thank you for your patience!</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;
      
      case 'shipped':
        subject = `🚚 Order Shipped - ${order.invoiceNumber}`;
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
              .content { background: #f9fafb; padding: 20px; margin: 20px 0; }
              .tracking { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 10px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚚 Your Order is On the Way!</h1>
              </div>
              
              <div class="content">
                <p>Hi <strong>${user.firstName || user.name}</strong>,</p>
                <p>Exciting news! Your order has been shipped and will reach you soon. 📬</p>
                
                <p><strong>Order ID:</strong> ${order.invoiceNumber}</p>
                
                ${order.trackingNumber ? `
                  <div class="tracking">
                    <p><strong>📦 Tracking Number:</strong></p>
                    <p style="font-size: 18px; font-weight: bold; color: #f59e0b;">${order.trackingNumber}</p>
                    <p style="font-size: 12px;">Use this to track your shipment</p>
                  </div>
                ` : '<p>Tracking details will be updated soon.</p>'}
                
                <p><strong>Expected Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</p>
              </div>
              
              <div class="footer">
                <p>Almost there! 🎉</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;
      
      case 'delivered':
        subject = `✅ Order Delivered - ${order.invoiceNumber}`;
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #10b981; color: white; padding: 20px; text-align: center; }
              .content { background: #f9fafb; padding: 20px; margin: 20px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Order Delivered Successfully!</h1>
              </div>
              
              <div class="content">
                <p>Hi <strong>${user.firstName || user.name}</strong>,</p>
                <p>Your order has been successfully delivered! 📚✨</p>
                
                <p><strong>Order ID:</strong> ${order.invoiceNumber}</p>
                <p><strong>Delivered On:</strong> ${new Date(order.actualDelivery || Date.now()).toLocaleDateString('en-IN')}</p>
                
                <p>We hope you enjoy your books! Happy reading! 📖</p>
                
                <p style="margin-top: 20px;">
                  <strong>Leave a Review:</strong><br>
                  Help other readers by sharing your thoughts about the books.
                </p>
              </div>
              
              <div class="footer">
                <p>Thank you for choosing BookLenDen! 🙏</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;
      
      case 'cancelled':
        subject = `❌ Order Cancelled - ${order.invoiceNumber}`;
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
              .content { background: #f9fafb; padding: 20px; margin: 20px 0; }
              .reason { background: #fee2e2; padding: 15px; border-left: 4px solid #ef4444; margin: 10px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Order Cancelled</h1>
              </div>
              
              <div class="content">
                <p>Hi <strong>${user.firstName || user.name}</strong>,</p>
                <p>Your order has been cancelled as requested.</p>
                
                <p><strong>Order ID:</strong> ${order.invoiceNumber}</p>
                <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
                
                ${order.cancellationReason ? `
                  <div class="reason">
                    <p><strong>Cancellation Reason:</strong></p>
                    <p>${order.cancellationReason}</p>
                  </div>
                ` : ''}
                
                <p>If you paid online, your refund will be processed within 5-7 business days.</p>
                
                <p style="margin-top: 20px;">
                  We hope to serve you again soon! 🙏
                </p>
              </div>
              
              <div class="footer">
                <p>Thank you for using BookLenDen</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;
      
      default:
        console.log('⚠️  Unknown email type:', type);
        return { success: false, reason: 'Unknown email type' };
    }
    
    // Send email
    const info = await transporter.sendMail({
      from: `"📚 BookLenDen" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: subject,
      html: html
    });
    
    console.log(`✅ Email sent successfully to ${user.email}`);
    console.log(`📧 Type: ${type} | Message ID: ${info.messageId}`);
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    
    // Detailed error logging
    if (error.code === 'EAUTH') {
      console.error('🔴 Email Authentication Error!');
      console.error('   Check: EMAIL_USER and EMAIL_PASS in .env');
      console.error('   Tip: Remove spaces from EMAIL_PASS');
    } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      console.error('🔴 Network Error! Check internet connection');
    } else if (error.code === 'EENVELOPE') {
      console.error('🔴 Invalid email address');
    }
    
    // Don't throw error - let order creation continue
    return { success: false, error: error.message };
  }
};

// ============================================
// CREATE ORDER
// ============================================

const createOrder = async (req, res) => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 CREATE ORDER REQUEST');
    console.log('User ID:', req.user._id);
    console.log('User Email:', req.user.email);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const { shippingAddress, paymentMethod, notes } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.mobile || 
        !shippingAddress.address || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ 
        success: false,
        message: 'Complete shipping address is required' 
      });
    }

    // Get cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.book');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Cart is empty' 
      });
    }

    // Filter valid items
    const validItems = cart.items.filter(item => 
      item.book && item.book._id && item.book.status === 'available'
    );

    if (validItems.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No available books in cart' 
      });
    }

    // Calculate total and prepare order items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of validItems) {
      totalAmount += item.book.price * item.quantity;

      orderItems.push({
        book: item.book._id,
        seller: item.book.seller,
        title: item.book.title,
        author: item.book.author,
        price: item.book.price,
        quantity: item.quantity
      });
    }

    // Create order
    const order = await Order.create({
      buyer: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress: {
        fullName: shippingAddress.name,
        mobile: shippingAddress.mobile,
        addressLine1: shippingAddress.address,
        addressLine2: shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state || '',
        pincode: shippingAddress.pincode
      },
      paymentMethod: paymentMethod === 'cash' ? 'cod' : 'online',
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
      notes: notes || ''
    });

    console.log('✅ Order created in database:', order._id);

    // Clear cart
    cart.items = [];
    await cart.save();
    console.log('✅ Cart cleared');

    // Get populated order
    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name mobile email firstName lastName')
      .populate('items.book')
      .populate('items.seller', 'name mobile firstName lastName');

    // Send confirmation email (non-blocking)
    console.log('📧 Sending order confirmation email...');
    sendOrderEmail(req.user, order, 'placed')
      .then(result => {
        if (result.success) {
          console.log('✅ Order email sent successfully');
        } else {
          console.log('⚠️  Order email failed:', result.reason || result.error);
        }
      })
      .catch(err => {
        console.log('⚠️  Order email error (non-critical):', err.message);
      });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ORDER CREATION SUCCESSFUL');
    console.log('Order ID:', order.invoiceNumber);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: populatedOrder
    });

  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ CREATE ORDER ERROR');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to place order' 
    });
  }
};

// ============================================
// GET MY ORDERS (BUYER)
// ============================================

const getMyOrders = async (req, res) => {
  try {
    console.log('📋 GET MY ORDERS - User:', req.user._id);
    
    const { status, search, startDate, endDate, sort = '-createdAt' } = req.query;

    let query = { buyer: req.user._id };

    // Filter by status
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    // Search
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'items.title': { $regex: search, $options: 'i' } }
      ];
    }

    // Date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('items.book')
      .populate('items.seller', 'name mobile firstName lastName')
      .sort(sort);

    console.log(`✅ Found ${orders.length} orders`);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error('❌ Get Orders Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch orders' 
    });
  }
};

// ============================================
// GET ORDER BY ID
// ============================================

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('buyer', 'name mobile email firstName lastName')
      .populate('items.book')
      .populate('items.seller', 'name mobile firstName lastName')
      .populate('statusHistory.updatedBy', 'firstName lastName');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check authorization
    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    const isSeller = order.items.some(item => 
      item.seller._id.toString() === req.user._id.toString()
    );

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized access' 
      });
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error('❌ Get Order Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch order' 
    });
  }
};

// ============================================
// CANCEL ORDER
// ============================================

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ CANCEL ORDER REQUEST');
    console.log('Order ID:', orderId);
    console.log('User ID:', req.user._id);
    console.log('Reason:', reason);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const order = await Order.findById(orderId)
      .populate('buyer', 'email firstName lastName');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check if user is the buyer
    if (order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized to cancel this order' 
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot cancel order. Current status: ${order.orderStatus}` 
      });
    }

    // Update order status
    order.orderStatus = 'cancelled';
    order.cancellationReason = reason || 'Cancelled by customer';
    order.cancelledAt = new Date();
    
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: reason || 'Cancelled by customer',
      updatedBy: req.user._id
    });

    await order.save();

    console.log('✅ Order cancelled in database');

    // Send cancellation email (non-blocking)
    console.log('📧 Sending cancellation email...');
    sendOrderEmail(order.buyer, order, 'cancelled')
      .then(result => {
        if (result.success) {
          console.log('✅ Cancellation email sent');
        } else {
          console.log('⚠️  Cancellation email failed');
        }
      });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ORDER CANCELLATION SUCCESSFUL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });

  } catch (error) {
    console.error('❌ Cancel Order Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to cancel order' 
    });
  }
};

// ============================================
// UPDATE ORDER STATUS (SELLER)
// ============================================

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note, trackingNumber } = req.body;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 UPDATE ORDER STATUS');
    console.log('Order ID:', orderId);
    console.log('New Status:', status);
    console.log('Seller ID:', req.user._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const order = await Order.findById(orderId)
      .populate('buyer', 'email firstName lastName');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check if user is seller
    const isSeller = order.items.some(item => 
      item.seller.toString() === req.user._id.toString()
    );

    if (!isSeller) {
      return res.status(403).json({ 
        success: false,
        message: 'Only seller can update order status' 
      });
    }

    // Validate status
    if (!['confirmed', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status. Allowed: confirmed, shipped, delivered' 
      });
    }

    // Update order
    order.orderStatus = status;
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (status === 'delivered') {
      order.actualDelivery = new Date();
      order.paymentStatus = 'paid'; // Mark as paid on delivery (for COD)
    }

    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order ${status} by seller`,
      updatedBy: req.user._id
    });

    await order.save();

    console.log('✅ Order status updated in database');

    // Send status update email (non-blocking)
    console.log('📧 Sending status update email...');
    sendOrderEmail(order.buyer, order, status)
      .then(result => {
        if (result.success) {
          console.log('✅ Status update email sent');
        } else {
          console.log('⚠️  Status update email failed');
        }
      });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ORDER STATUS UPDATE SUCCESSFUL');
    console.log('New Status:', status);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    res.status(200).json({
      success: true,
      message: `Order ${status} successfully`,
      order
    });

  } catch (error) {
    console.error('❌ Update Order Status Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update order status' 
    });
  }
};

// ============================================
// GET MY SALES (SELLER)
// ============================================

const getMySales = async (req, res) => {
  try {
    console.log('💰 GET MY SALES - Seller:', req.user._id);

    const orders = await Order.find({ 'items.seller': req.user._id })
      .populate('buyer', 'name mobile firstName lastName')
      .populate('items.book')
      .sort({ createdAt: -1 });

    // Filter to show only items sold by this seller
    const myItems = orders.map(order => ({
      ...order.toObject(),
      items: order.items.filter(item => 
        item.seller.toString() === req.user._id.toString()
      )
    }));

    console.log(`✅ Found ${myItems.length} sales`);

    res.status(200).json({
      success: true,
      count: myItems.length,
      orders: myItems
    });

  } catch (error) {
    console.error('❌ Get Sales Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch sales' 
    });
  }
};

// ============================================
// DOWNLOAD INVOICE
// ============================================

const downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('buyer', 'firstName lastName email mobile')
      .populate('items.book');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check authorization
    if (order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    // Generate invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice - ${order.invoiceNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto; 
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 20px;
          }
          .header h1 { 
            color: #4f46e5; 
            margin: 0; 
          }
          .invoice-details { 
            margin: 20px 0; 
            background: #f9fafb; 
            padding: 20px; 
            border-radius: 8px; 
          }
          .invoice-details p { margin: 8px 0; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 30px 0; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background-color: #4f46e5; 
            color: white; 
            font-weight: bold;
          }
          .total-row { 
            background: #f3f4f6; 
            font-weight: bold; 
          }
          .total { 
            text-align: right; 
            font-size: 24px; 
            font-weight: bold; 
            margin-top: 20px; 
            color: #4f46e5;
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 2px solid #e5e7eb; 
            color: #666; 
          }
          .address-box {
            background: white;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📚 BookLenDen</h1>
          <h2>TAX INVOICE</h2>
          <p style="font-size: 18px; color: #666;">Invoice No: <strong>${order.invoiceNumber}</strong></p>
        </div>
        
        <div class="invoice-details">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <p><strong>📅 Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString('en-IN', { 
                year: 'numeric', month: 'long', day: 'numeric' 
              })}</p>
              <p><strong>💳 Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
              <p><strong>📊 Order Status:</strong> ${order.orderStatus.toUpperCase()}</p>
            </div>
            <div>
              ${order.estimatedDelivery ? `
                <p><strong>🚚 Est. Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</p>
              ` : ''}
              ${order.trackingNumber ? `
                <p><strong>📦 Tracking:</strong> ${order.trackingNumber}</p>
              ` : ''}
            </div>
          </div>
        </div>

        <h3>📋 Customer Details</h3>
        <div class="address-box">
          <p><strong>Name:</strong> ${order.buyer.firstName} ${order.buyer.lastName}</p>
          <p><strong>Email:</strong> ${order.buyer.email}</p>
          <p><strong>Mobile:</strong> ${order.buyer.mobile}</p>
        </div>

        <h3>📍 Shipping Address</h3>
        <div class="address-box">
          <p>${order.shippingAddress.fullName}</p>
          <p>${order.shippingAddress.addressLine1}</p>
          ${order.shippingAddress.addressLine2 ? `<p>${order.shippingAddress.addressLine2}</p>` : ''}
          <p>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
          <p>📞 ${order.shippingAddress.mobile}</p>
        </div>
        
        <h3>📚 Order Items</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 50%">Book Title</th>
              <th>Author</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.title}</td>
                <td>${item.author}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                <td style="text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4" style="text-align: right;">TOTAL AMOUNT:</td>
              <td style="text-align: right; font-size: 18px;">₹${order.totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="total">
          Grand Total: ₹${order.totalAmount.toFixed(2)}
        </div>
        
        <div class="footer">
          <p><strong>Thank you for shopping with BookLenDen!</strong></p>
          <p>📧 Contact: booklenden78@gmail.com | 📱 Support: Available 24/7</p>
          <p style="font-size: 11px; color: #999; margin-top: 20px;">
            This is a computer-generated invoice. No signature required.
          </p>
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice-${order.invoiceNumber}.html"`);
    res.send(invoiceHTML);

    console.log('✅ Invoice downloaded:', order.invoiceNumber);

  } catch (error) {
    console.error('❌ Download Invoice Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to download invoice' 
    });
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  getMySales,
  cancelOrder,
  updateOrderStatus,
  downloadInvoice
};