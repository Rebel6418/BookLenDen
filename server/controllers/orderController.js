const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const nodemailer = require('nodemailer');

// Email transporter setup (configure with your email)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Helper: Send order email
const sendOrderEmail = async (user, order, type) => {
  try {
    let subject, html;
    
    switch(type) {
      case 'placed':
        subject = `Order Confirmation - ${order.invoiceNumber}`;
        html = `
          <h2>Thank you for your order!</h2>
          <p>Hi ${user.firstName},</p>
          <p>Your order has been placed successfully.</p>
          <p><strong>Order ID:</strong> ${order.invoiceNumber}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
          <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>
        `;
        break;
      
      case 'confirmed':
        subject = `Order Confirmed - ${order.invoiceNumber}`;
        html = `
          <h2>Your order has been confirmed!</h2>
          <p>Hi ${user.firstName},</p>
          <p>Great news! Your order has been confirmed and will be shipped soon.</p>
          <p><strong>Order ID:</strong> ${order.invoiceNumber}</p>
        `;
        break;
      
      case 'shipped':
        subject = `Order Shipped - ${order.invoiceNumber}`;
        html = `
          <h2>Your order is on the way!</h2>
          <p>Hi ${user.firstName},</p>
          <p>Your order has been shipped and will reach you soon.</p>
          <p><strong>Order ID:</strong> ${order.invoiceNumber}</p>
          ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
        `;
        break;
      
      case 'delivered':
        subject = `Order Delivered - ${order.invoiceNumber}`;
        html = `
          <h2>Your order has been delivered!</h2>
          <p>Hi ${user.firstName},</p>
          <p>Your order has been successfully delivered. We hope you enjoy your books!</p>
          <p><strong>Order ID:</strong> ${order.invoiceNumber}</p>
        `;
        break;
      
      case 'cancelled':
        subject = `Order Cancelled - ${order.invoiceNumber}`;
        html = `
          <h2>Your order has been cancelled</h2>
          <p>Hi ${user.firstName},</p>
          <p>Your order has been cancelled as requested.</p>
          <p><strong>Order ID:</strong> ${order.invoiceNumber}</p>
          <p><strong>Reason:</strong> ${order.cancellationReason || 'Not specified'}</p>
        `;
        break;
    }
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'BookLenDen <noreply@booklenden.com>',
      to: user.email,
      subject,
      html
    });
    
    console.log(`✅ Email sent to ${user.email} - ${type}`);
  } catch (error) {
    console.error('❌ Email Error:', error.message);
  }
};

// Create order
const createOrder = async (req, res) => {
  try {
    console.log('📦 CREATE ORDER REQUEST');
    console.log('User:', req.user._id);
    console.log('Body:', req.body);

    const { shippingAddress, paymentMethod, notes } = req.body;

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.book');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Cart is empty' 
      });
    }

    const validItems = cart.items.filter(item => item.book && item.book._id && item.book.isAvailable);

    if (validItems.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No available books in cart' 
      });
    }

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

    const order = await Order.create({
      buyer: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress: {
        fullName: shippingAddress.name,
        mobile: shippingAddress.mobile,
        addressLine1: shippingAddress.address,
        addressLine2: '',
        city: shippingAddress.city,
        state: shippingAddress.state || '',
        pincode: shippingAddress.pincode
      },
      paymentMethod: paymentMethod === 'cash' ? 'cod' : 'online',
      notes: notes || ''
    });

    cart.items = [];
    await cart.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name mobile email firstName lastName')
      .populate('items.book')
      .populate('items.seller', 'name mobile firstName lastName');

    // Send confirmation email
    sendOrderEmail(req.user, order, 'placed');

    console.log('✅ Order created:', order._id);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('❌ Create Order Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to place order' 
    });
  }
};

// Get my orders (buyer)
const getMyOrders = async (req, res) => {
  try {
    console.log('📋 GET MY ORDERS - User:', req.user._id);
    
    const { status, search, startDate, endDate, sort = '-createdAt' } = req.query;

    let query = { buyer: req.user._id };

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'items.title': { $regex: search, $options: 'i' } }
      ];
    }

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

// Get order by ID
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

    if (order.buyer._id.toString() !== req.user._id.toString()) {
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

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    console.log('❌ CANCEL ORDER:', { orderId, userId: req.user._id, reason });

    const order = await Order.findById(orderId)
      .populate('buyer', 'email firstName lastName');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    if (order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized to cancel this order' 
      });
    }

    if (order.orderStatus !== 'pending' && order.orderStatus !== 'confirmed') {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot cancel order. It has already been shipped or delivered.' 
      });
    }

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

    // Send cancellation email
    sendOrderEmail(order.buyer, order, 'cancelled');

    console.log('✅ Order cancelled:', orderId);

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

// Update order status (for sellers)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note, trackingNumber } = req.body;

    console.log('🔄 UPDATE ORDER STATUS:', { orderId, status, sellerId: req.user._id });

    const order = await Order.findById(orderId)
      .populate('buyer', 'email firstName lastName');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check if user is seller of any item in this order
    const isSeller = order.items.some(item => 
      item.seller.toString() === req.user._id.toString()
    );

    if (!isSeller) {
      return res.status(403).json({ 
        success: false,
        message: 'Only seller can update order status' 
      });
    }

    if (!['confirmed', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status' 
      });
    }

    order.orderStatus = status;
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (status === 'delivered') {
      order.actualDelivery = new Date();
    }

    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order ${status}`,
      updatedBy: req.user._id
    });

    await order.save();

    // Send status update email
    sendOrderEmail(order.buyer, order, status);

    console.log('✅ Order status updated:', orderId, status);

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

// Get my sales (seller)
const getMySales = async (req, res) => {
  try {
    console.log('💰 GET MY SALES - Seller:', req.user._id);

    const orders = await Order.find({ 'items.seller': req.user._id })
      .populate('buyer', 'name mobile firstName lastName')
      .populate('items.book')
      .sort({ createdAt: -1 });

    const myItems = orders.map(order => ({
      ...order.toObject(),
      items: order.items.filter(item => item.seller.toString() === req.user._id.toString())
    }));

    res.status(200).json({
      success: true,
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

// Download invoice
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

    if (order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    // Generate simple invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #4f46e5; color: white; }
          .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BookLenDen</h1>
          <h2>INVOICE</h2>
          <p>Invoice No: ${order.invoiceNumber}</p>
        </div>
        
        <div class="invoice-details">
          <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
          <p><strong>Customer:</strong> ${order.buyer.firstName} ${order.buyer.lastName}</p>
          <p><strong>Email:</strong> ${order.buyer.email}</p>
          <p><strong>Mobile:</strong> ${order.buyer.mobile}</p>
          <p><strong>Shipping Address:</strong><br>
            ${order.shippingAddress.addressLine1}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
          </p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Book Title</th>
              <th>Author</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.title}</td>
                <td>${item.author}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price}</td>
                <td>₹${item.price * item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          Total Amount: ₹${order.totalAmount}
        </div>
        
        <p style="margin-top: 40px; text-align: center; color: #666;">
          Thank you for your business!
        </p>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.invoiceNumber}.html`);
    res.send(invoiceHTML);

  } catch (error) {
    console.error('❌ Download Invoice Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to download invoice' 
    });
  }
};

module.exports = { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  getMySales,
  cancelOrder,
  updateOrderStatus,
  downloadInvoice
};