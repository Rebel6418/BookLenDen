const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const axios = require('axios');

// ============================================
// EMAIL CONFIGURATION
// ============================================
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

// ============================================
// SHIPROCKET CONFIGURATION
// ============================================
const SHIPROCKET_EMAIL    = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

let shiprocketToken = null;
let tokenExpiry = null;

// Get Shiprocket Auth Token (cached)
const getShiprocketToken = async () => {
  try {
    // Reuse token if still valid (valid for 24 hours)
    if (shiprocketToken && tokenExpiry && new Date() < tokenExpiry) {
      return shiprocketToken;
    }

    const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD
    });

    shiprocketToken = response.data.token;
    tokenExpiry = new Date(Date.now() + 23 * 60 * 60 * 1000); // 23 hours
    console.log('✅ Shiprocket token obtained');
    return shiprocketToken;

  } catch (error) {
    console.error('❌ Shiprocket login failed:', error.message);
    return null;
  }
};

// ============================================
// HELPER: SEND EMAIL
// ============================================
const sendEmail = async (to, subject, html) => {
  try {
    if (!to) return { success: false, reason: 'No email' };
    await transporter.sendMail({
      from: `"📚 BookLenDen" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`✅ Email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    return { success: false, error: error.message };
  }
};

// ============================================
// EMAIL: BUYER ORDER CONFIRMATION
// ============================================
const sendBuyerConfirmationEmail = (buyer, order) => {
  const html = `
    <!DOCTYPE html><html><head>
    <style>
      body{font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:0}
      .wrap{max-width:600px;margin:0 auto;background:white}
      .header{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;padding:30px;text-align:center}
      .body{padding:30px}
      .box{background:#f3f4f6;border-radius:8px;padding:20px;margin:15px 0}
      .item{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #e5e7eb}
      .total{background:#4f46e5;color:white;padding:15px;border-radius:8px;text-align:right;font-size:20px;font-weight:bold}
      .status{background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;border-radius:4px;margin:15px 0}
      .footer{background:#1f2937;color:#9ca3af;padding:20px;text-align:center;font-size:12px}
      .track-btn{display:inline-block;background:#4f46e5;color:white;padding:12px 30px;border-radius:25px;text-decoration:none;font-weight:bold;margin-top:20px}
    </style></head><body>
    <div class="wrap">
      <div class="header">
        <h1>📚 BookLenDen</h1>
        <h2>🎉 Order Confirmed!</h2>
        <p style="opacity:0.9">Your order has been placed successfully</p>
      </div>
      <div class="body">
        <p>Hi <strong>${buyer.firstName}</strong>,</p>
        <p>Thank you for your order! We've received it and notified the seller.</p>

        <div class="box">
          <p><strong>📋 Order ID:</strong> ${order.invoiceNumber}</p>
          <p><strong>📅 Date:</strong> ${new Date(order.orderDate).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}</p>
          <p><strong>💰 Total:</strong> ₹${order.totalAmount}</p>
          <p><strong>💳 Payment:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
          <p><strong>🚚 Est. Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</p>
        </div>

        <h3>📦 Items Ordered:</h3>
        ${order.items.map(item => `
          <div class="item">
            <div>
              <strong>${item.title}</strong><br>
              <small>by ${item.author}</small><br>
              <span>Qty: ${item.quantity} × ₹${item.price} = <strong>₹${item.price * item.quantity}</strong></span>
            </div>
          </div>
        `).join('')}

        <div class="total">Grand Total: ₹${order.totalAmount}</div>

        <div class="status">
          <strong>📍 What happens next?</strong><br>
          1. Seller will confirm your order (within 24 hours)<br>
          2. Shiprocket will pickup from seller<br>
          3. You'll receive tracking details via email<br>
          4. Book delivered to your doorstep! 📚
        </div>

        <p><strong>📍 Delivery Address:</strong><br>
        ${order.shippingAddress.fullName}, ${order.shippingAddress.addressLine1},
        ${order.shippingAddress.city} - ${order.shippingAddress.pincode}</p>
      </div>
      <div class="footer">
        <p>📚 BookLenDen | India's Trusted Book Marketplace</p>
        <p>booklenden78@gmail.com</p>
      </div>
    </div></body></html>
  `;
  return sendEmail(buyer.email, `✅ Order Confirmed - ${order.invoiceNumber} | BookLenDen`, html);
};

// ============================================
// EMAIL: SELLER NEW ORDER NOTIFICATION
// ============================================
const sendSellerOrderEmail = (seller, order, buyerAddress) => {
  const html = `
    <!DOCTYPE html><html><head>
    <style>
      body{font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:0}
      .wrap{max-width:600px;margin:0 auto;background:white}
      .header{background:linear-gradient(135deg,#059669,#047857);color:white;padding:30px;text-align:center}
      .body{padding:30px}
      .box{background:#f0fdf4;border:2px solid #86efac;border-radius:8px;padding:20px;margin:15px 0}
      .alert{background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;border-radius:4px;margin:15px 0}
      .urgent{background:#fee2e2;border-left:4px solid #ef4444;padding:15px;border-radius:4px;margin:15px 0}
      .item{padding:10px 0;border-bottom:1px solid #e5e7eb}
      .btn{display:inline-block;background:#059669;color:white;padding:14px 35px;border-radius:25px;text-decoration:none;font-weight:bold;font-size:16px;margin-top:20px}
      .footer{background:#1f2937;color:#9ca3af;padding:20px;text-align:center;font-size:12px}
      .steps{background:#eff6ff;border-radius:8px;padding:20px;margin:15px 0}
    </style></head><body>
    <div class="wrap">
      <div class="header">
        <h1>🔔 NEW ORDER RECEIVED!</h1>
        <h2>📚 BookLenDen Seller Alert</h2>
        <p style="font-size:18px;opacity:0.95">You have a new order waiting!</p>
      </div>
      <div class="body">
        <p>Hi <strong>${seller.firstName}</strong>,</p>
        <p>Great news! You have received a new order on BookLenDen.</p>

        <div class="urgent">
          ⏰ <strong>ACTION REQUIRED:</strong> Please confirm this order within 24 hours. 
          If not confirmed, it will be auto-cancelled.
        </div>

        <div class="box">
          <p><strong>📋 Order ID:</strong> ${order.invoiceNumber}</p>
          <p><strong>📅 Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}</p>
          <p><strong>💰 You will earn:</strong> ₹${order.totalAmount}</p>
          <p><strong>💳 Payment Mode:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment ✅'}</p>
        </div>

        <h3>📚 Books to Ship:</h3>
        ${order.items.map(item => `
          <div class="item">
            <strong>${item.title}</strong> by ${item.author}<br>
            <span>Qty: ${item.quantity} | Price: ₹${item.price}</span>
          </div>
        `).join('')}

        <div class="alert">
          <strong>📍 Delivery Address (Buyer's):</strong><br>
          ${buyerAddress.fullName}<br>
          ${buyerAddress.addressLine1}${buyerAddress.addressLine2 ? ', ' + buyerAddress.addressLine2 : ''}<br>
          ${buyerAddress.city}${buyerAddress.state ? ', ' + buyerAddress.state : ''} - ${buyerAddress.pincode}<br>
          📞 ${buyerAddress.mobile}
        </div>

        <div class="steps">
          <strong>📋 Steps to Complete This Order:</strong><br><br>
          1️⃣ Login to BookLenDen<br>
          2️⃣ Go to <strong>My Sales</strong> section<br>
          3️⃣ Find order <strong>${order.invoiceNumber}</strong><br>
          4️⃣ Click <strong>"Confirm Order"</strong><br>
          5️⃣ Shiprocket will automatically schedule pickup from your address<br>
          6️⃣ Keep the book ready for pickup! 📦
        </div>

        <p style="text-align:center">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-sales" class="btn">
            ✅ Confirm Order Now
          </a>
        </p>
      </div>
      <div class="footer">
        <p>📚 BookLenDen | India's Trusted Book Marketplace</p>
        <p>This is an automated notification. Do not reply.</p>
      </div>
    </div></body></html>
  `;
  return sendEmail(seller.email, `🔔 NEW ORDER: ${order.invoiceNumber} - Action Required! | BookLenDen`, html);
};

// ============================================
// EMAIL: BUYER SHIPPING UPDATE
// ============================================
const sendShippingEmail = (buyer, order) => {
  const html = `
    <!DOCTYPE html><html><head>
    <style>
      body{font-family:Arial,sans-serif;background:#f9fafb;margin:0}
      .wrap{max-width:600px;margin:0 auto;background:white}
      .header{background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;padding:30px;text-align:center}
      .body{padding:30px}
      .track-box{background:#eff6ff;border:2px solid #3b82f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0}
      .track-number{font-size:28px;font-weight:bold;color:#1d4ed8;letter-spacing:3px}
      .footer{background:#1f2937;color:#9ca3af;padding:20px;text-align:center;font-size:12px}
    </style></head><body>
    <div class="wrap">
      <div class="header">
        <h1>🚚 Your Order is Shipped!</h1>
        <p>Order #${order.invoiceNumber}</p>
      </div>
      <div class="body">
        <p>Hi <strong>${buyer.firstName}</strong>,</p>
        <p>Your books are on their way! 📦</p>

        ${order.trackingNumber ? `
          <div class="track-box">
            <p>📦 Tracking Number:</p>
            <div class="track-number">${order.trackingNumber}</div>
            <p style="color:#6b7280;font-size:14px">Use this to track your shipment on Shiprocket</p>
            <a href="https://www.shiprocket.in/shipment-tracking/" 
               style="display:inline-block;background:#3b82f6;color:white;padding:10px 25px;border-radius:20px;text-decoration:none;margin-top:10px">
              Track Your Shipment
            </a>
          </div>
        ` : '<p>Tracking details will be updated shortly.</p>'}

        <p><strong>Expected Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</p>
        <p><strong>Deliver To:</strong> ${order.shippingAddress.fullName}, ${order.shippingAddress.city}</p>
      </div>
      <div class="footer"><p>📚 BookLenDen | Happy Reading! 📖</p></div>
    </div></body></html>
  `;
  return sendEmail(buyer.email, `🚚 Shipped! Tracking: ${order.trackingNumber || 'Soon'} - ${order.invoiceNumber}`, html);
};

// ============================================
// SHIPROCKET: CREATE SHIPMENT (Auto Pickup)
// ============================================
const createShiprocketOrder = async (order, seller, buyer) => {
  try {
    const token = await getShiprocketToken();
    if (!token) {
      console.log('⚠️  Shiprocket token unavailable, skipping auto-shipment');
      return null;
    }

    // Check seller address
    if (!seller.sellerAddress || !seller.sellerAddress.pincode) {
      console.log('⚠️  Seller address incomplete, cannot create Shiprocket order');
      return null;
    }

    const totalWeight = order.items.length * 0.3; // 300g per book estimate

    const shiprocketPayload = {
      order_id: order.invoiceNumber,
      order_date: new Date(order.orderDate).toISOString().split('T')[0],
      pickup_location: 'Primary',

      // ✅ BILLING (Seller - Pickup Point)
      billing_customer_name: seller.sellerAddress.fullName || `${seller.firstName} ${seller.lastName}`,
      billing_last_name: '',
      billing_address: seller.sellerAddress.addressLine1,
      billing_address_2: seller.sellerAddress.addressLine2 || '',
      billing_city: seller.sellerAddress.city,
      billing_pincode: seller.sellerAddress.pincode,
      billing_state: seller.sellerAddress.state,
      billing_country: 'India',
      billing_email: seller.email,
      billing_phone: seller.sellerAddress.mobile || seller.mobile,

      // ✅ SHIPPING (Buyer - Delivery Point)
      shipping_is_billing: false,
      shipping_customer_name: order.shippingAddress.fullName,
      shipping_last_name: '',
      shipping_address: order.shippingAddress.addressLine1,
      shipping_address_2: order.shippingAddress.addressLine2 || '',
      shipping_city: order.shippingAddress.city,
      shipping_pincode: order.shippingAddress.pincode,
      shipping_state: order.shippingAddress.state || '',
      shipping_country: 'India',
      shipping_email: buyer.email,
      shipping_phone: order.shippingAddress.mobile,

      // ✅ ORDER ITEMS
      order_items: order.items.map(item => ({
        name: item.title,
        sku: `BOOK-${item.book}`,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: 4901 // Books HSN code
      })),

      // ✅ PAYMENT
      payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      sub_total: order.totalAmount,
      length: 21,   // cm (A4 size book)
      breadth: 15,
      height: order.items.length * 2,  // 2cm per book
      weight: totalWeight
    };

    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/orders/create/adhoc`,
      shiprocketPayload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Shiprocket order created:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ Shiprocket order creation failed:', error.response?.data || error.message);
    return null;
  }
};

// ============================================
// SHIPROCKET: REQUEST PICKUP
// ============================================
const requestShiprocketPickup = async (shipmentId) => {
  try {
    const token = await getShiprocketToken();
    if (!token || !shipmentId) return null;

    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/courier/generate/pickup`,
      { shipment_id: [shipmentId] },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Pickup requested:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ Pickup request failed:', error.response?.data || error.message);
    return null;
  }
};

// ============================================
// CREATE ORDER (BUYER PLACES ORDER)
// ============================================
const createOrder = async (req, res) => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 NEW ORDER PLACED');
    console.log('Buyer:', req.user.email);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const { shippingAddress, paymentMethod, notes } = req.body;

    // Validate shipping address
    if (!shippingAddress?.name || !shippingAddress?.mobile ||
        !shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required'
      });
    }

    // Get cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Filter valid items
    const validItems = cart.items.filter(item =>
      item.book && item.book._id && item.book.status === 'available'
    );

    if (validItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No available books in cart' });
    }

    // Calculate total
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

    // Clear cart
    cart.items = [];
    await cart.save();

    // ✅ NOTIFY ALL SELLERS (Non-blocking)
    const uniqueSellerIds = [...new Set(orderItems.map(i => i.seller.toString()))];

    for (const sellerId of uniqueSellerIds) {
      const seller = await User.findById(sellerId).select('firstName email sellerAddress mobile');
      if (seller?.email) {
        sendSellerOrderEmail(seller, order, order.shippingAddress)
          .then(() => console.log(`✅ Seller notified: ${seller.email}`))
          .catch(err => console.log('⚠️  Seller notification failed:', err.message));
      }
    }

    // ✅ NOTIFY BUYER (Non-blocking)
    sendBuyerConfirmationEmail(req.user, order)
      .then(() => console.log('✅ Buyer notified'))
      .catch(err => console.log('⚠️  Buyer notification failed:', err.message));

    // Get populated order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'firstName lastName email mobile')
      .populate('items.book')
      .populate('items.seller', 'firstName lastName mobile');

    console.log('✅ ORDER CREATED:', order.invoiceNumber);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Seller has been notified.',
      order: populatedOrder
    });

  } catch (error) {
    console.error('❌ Create Order Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to place order' });
  }
};

// ============================================
// CONFIRM ORDER (SELLER ACTION → SHIPROCKET)
// ============================================
const confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SELLER CONFIRMING ORDER:', orderId);

    const order = await Order.findById(orderId)
      .populate('buyer', 'firstName lastName email mobile')
      .populate('items.seller', 'firstName lastName email mobile sellerAddress');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user is a seller in this order
    const sellerItem = order.items.find(item =>
      item.seller._id.toString() === req.user._id.toString()
    );

    if (!sellerItem) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (order.orderStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm. Order is already: ${order.orderStatus}`
      });
    }

    // Get seller details with address
    const seller = await User.findById(req.user._id);

    // Check seller address
    if (!seller.sellerAddress?.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your seller address in profile before confirming orders!',
        redirectTo: '/profile/seller-address'
      });
    }

    // Update order status
    order.orderStatus = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      timestamp: new Date(),
      note: 'Order confirmed by seller. Pickup scheduled.',
      updatedBy: req.user._id
    });
    await order.save();

    console.log('✅ Order confirmed in DB');

    // ✅ AUTO CREATE SHIPROCKET ORDER + REQUEST PICKUP
    console.log('🚀 Creating Shiprocket shipment...');

    const shiprocketResult = await createShiprocketOrder(order, seller, order.buyer);

    if (shiprocketResult?.order_id) {
      // Store Shiprocket order ID
      order.shiprocketOrderId = shiprocketResult.order_id;
      order.shiprocketShipmentId = shiprocketResult.shipment_id;

      if (shiprocketResult.awb_code) {
        order.trackingNumber = shiprocketResult.awb_code;
      }

      await order.save();

      // Request pickup
      if (shiprocketResult.shipment_id) {
        await requestShiprocketPickup(shiprocketResult.shipment_id);
        console.log('✅ Pickup requested from Shiprocket');
      }
    } else {
      console.log('⚠️  Shiprocket failed - manual shipping required');
    }

    // ✅ NOTIFY BUYER - Order Confirmed
    const confirmHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#059669,#047857);color:white;padding:30px;text-align:center">
          <h1>✅ Order Confirmed by Seller!</h1>
          <p>Order #${order.invoiceNumber}</p>
        </div>
        <div style="padding:30px">
          <p>Hi <strong>${order.buyer.firstName}</strong>,</p>
          <p>Your order has been confirmed by the seller! 🎉</p>
          <p>The seller is preparing your books for pickup. You'll receive tracking details soon.</p>
          <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:8px;padding:20px;margin:15px 0">
            <p><strong>📋 Order:</strong> ${order.invoiceNumber}</p>
            <p><strong>📅 Confirmed:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            ${order.trackingNumber ? `<p><strong>📦 Tracking:</strong> ${order.trackingNumber}</p>` : ''}
          </div>
          <p>Estimated delivery: <strong>${new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</strong></p>
        </div>
        <div style="background:#1f2937;color:#9ca3af;padding:20px;text-align:center;font-size:12px">
          📚 BookLenDen | booklenden78@gmail.com
        </div>
      </div>
    `;

    sendEmail(
      order.buyer.email,
      `✅ Seller Confirmed Your Order - ${order.invoiceNumber} | BookLenDen`,
      confirmHtml
    ).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Order confirmed! Shiprocket pickup has been scheduled.',
      order,
      shiprocket: shiprocketResult ? {
        orderId: shiprocketResult.order_id,
        awb: shiprocketResult.awb_code,
        pickupScheduled: true
      } : {
        pickupScheduled: false,
        message: 'Manual shipping required - check seller address'
      }
    });

  } catch (error) {
    console.error('❌ Confirm Order Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to confirm order' });
  }
};

// ============================================
// UPDATE ORDER STATUS (SELLER: shipped/delivered)
// ============================================
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note, trackingNumber } = req.body;

    const order = await Order.findById(orderId)
      .populate('buyer', 'email firstName lastName');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check seller
    const isSeller = order.items.some(item =>
      item.seller.toString() === req.user._id.toString()
    );
    if (!isSeller) {
      return res.status(403).json({ success: false, message: 'Only seller can update status' });
    }

    if (!['confirmed', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === 'delivered') {
      order.actualDelivery = new Date();
      order.paymentStatus = 'paid';
    }

    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order ${status}`,
      updatedBy: req.user._id
    });

    await order.save();

    // ✅ NOTIFY BUYER based on status
    if (status === 'shipped') {
      sendShippingEmail(order.buyer, order).catch(() => {});
    } else if (status === 'delivered') {
      const deliveredHtml = `
        <div style="font-family:Arial;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#059669,#047857);color:white;padding:30px;text-align:center">
            <h1>🎉 Order Delivered!</h1>
          </div>
          <div style="padding:30px">
            <p>Hi <strong>${order.buyer.firstName}</strong>,</p>
            <p>Your order has been delivered successfully! Enjoy your books! 📚</p>
            <p><strong>Order:</strong> ${order.invoiceNumber}</p>
            <p><strong>Delivered on:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>
      `;
      sendEmail(order.buyer.email, `🎉 Delivered! - ${order.invoiceNumber}`, deliveredHtml).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: `Order ${status} successfully`,
      order
    });

  } catch (error) {
    console.error('❌ Update Status Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

// ============================================
// GET MY ORDERS (BUYER)
// ============================================
const getMyOrders = async (req, res) => {
  try {
    const { status, search, sort = '-createdAt' } = req.query;
    let query = { buyer: req.user._id };

    if (status && status !== 'all') query.orderStatus = status;
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'items.title': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('items.book')
      .populate('items.seller', 'firstName lastName')
      .sort(sort);

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// ============================================
// GET MY SALES (SELLER)
// ============================================
const getMySales = async (req, res) => {
  try {
    const orders = await Order.find({ 'items.seller': req.user._id })
      .populate('buyer', 'firstName lastName mobile')
      .populate('items.book')
      .sort({ createdAt: -1 });

    const myOrders = orders.map(order => ({
      ...order.toObject(),
      items: order.items.filter(item =>
        item.seller.toString() === req.user._id.toString()
      )
    }));

    res.status(200).json({ success: true, count: myOrders.length, orders: myOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sales' });
  }
};

// ============================================
// GET ORDER BY ID
// ============================================
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('buyer', 'firstName lastName email mobile')
      .populate('items.book')
      .populate('items.seller', 'firstName lastName mobile')
      .populate('statusHistory.updatedBy', 'firstName lastName');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    const isSeller = order.items.some(item =>
      item.seller._id.toString() === req.user._id.toString()
    );

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

// ============================================
// CANCEL ORDER (BUYER)
// ============================================
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId)
      .populate('buyer', 'email firstName');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel. Status: ${order.orderStatus}`
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

    // Cancel on Shiprocket if shipment exists
    if (order.shiprocketShipmentId) {
      try {
        const token = await getShiprocketToken();
        if (token) {
          await axios.post(
            `${SHIPROCKET_BASE_URL}/orders/cancel`,
            { ids: [order.shiprocketOrderId] },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          console.log('✅ Shiprocket order cancelled');
        }
      } catch (e) {
        console.log('⚠️  Shiprocket cancellation failed:', e.message);
      }
    }

    // Notify buyer
    const cancelHtml = `
      <div style="font-family:Arial;max-width:600px;margin:0 auto">
        <div style="background:#ef4444;color:white;padding:30px;text-align:center">
          <h1>Order Cancelled</h1>
        </div>
        <div style="padding:30px">
          <p>Hi <strong>${order.buyer.firstName}</strong>,</p>
          <p>Your order <strong>${order.invoiceNumber}</strong> has been cancelled.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>If you paid online, refund will be processed in 5-7 business days.</p>
        </div>
      </div>
    `;
    sendEmail(order.buyer.email, `Order Cancelled - ${order.invoiceNumber}`, cancelHtml).catch(() => {});

    res.status(200).json({ success: true, message: 'Order cancelled', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
};

// ============================================
// GET SHIPROCKET TRACKING
// ============================================
const getTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (!order.trackingNumber) {
      return res.status(200).json({
        success: true,
        message: 'Tracking not available yet',
        status: order.orderStatus
      });
    }

    const token = await getShiprocketToken();
    if (!token) {
      return res.status(200).json({
        success: true,
        trackingNumber: order.trackingNumber,
        trackingUrl: `https://www.shiprocket.in/shipment-tracking/?id=${order.trackingNumber}`
      });
    }

    const response = await axios.get(
      `${SHIPROCKET_BASE_URL}/courier/track/awb/${order.trackingNumber}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    res.status(200).json({
      success: true,
      tracking: response.data,
      trackingNumber: order.trackingNumber
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get tracking' });
  }
};

// ============================================
// DOWNLOAD INVOICE
// ============================================
const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('buyer', 'firstName lastName email mobile');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const invoiceHTML = `
      <!DOCTYPE html><html><head>
      <style>
        body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}
        .header{text-align:center;border-bottom:3px solid #4f46e5;padding-bottom:20px;margin-bottom:30px}
        h1{color:#4f46e5}
        table{width:100%;border-collapse:collapse;margin:20px 0}
        th,td{border:1px solid #ddd;padding:12px;text-align:left}
        th{background:#4f46e5;color:white}
        .total{text-align:right;font-size:24px;font-weight:bold;color:#4f46e5;margin-top:20px}
        .footer{text-align:center;margin-top:40px;padding-top:20px;border-top:2px solid #e5e7eb;color:#666}
        .box{background:#f9fafb;padding:15px;border-radius:8px;margin:10px 0}
      </style></head><body>
      <div class="header">
        <h1>📚 BookLenDen</h1>
        <h2>TAX INVOICE</h2>
        <p style="font-size:18px">Invoice: <strong>${order.invoiceNumber}</strong></p>
      </div>
      <div class="box">
        <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleDateString('en-IN')}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</p>
        <p><strong>Status:</strong> ${order.orderStatus.toUpperCase()}</p>
        ${order.trackingNumber ? `<p><strong>Tracking:</strong> ${order.trackingNumber}</p>` : ''}
      </div>
      <div class="box">
        <p><strong>Customer:</strong> ${order.buyer.firstName} ${order.buyer.lastName}</p>
        <p><strong>Mobile:</strong> ${order.buyer.mobile}</p>
        <p><strong>Delivery:</strong> ${order.shippingAddress.fullName}, ${order.shippingAddress.addressLine1}, 
           ${order.shippingAddress.city} - ${order.shippingAddress.pincode}</p>
      </div>
      <table>
        <thead><tr><th>Book</th><th>Author</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
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
          <tr style="background:#f3f4f6;font-weight:bold">
            <td colspan="4" style="text-align:right">TOTAL:</td>
            <td>₹${order.totalAmount}</td>
          </tr>
        </tbody>
      </table>
      <div class="total">Grand Total: ₹${order.totalAmount}</div>
      <div class="footer">
        <p><strong>BookLenDen</strong> | booklenden78@gmail.com</p>
        <p style="font-size:11px;color:#999">Computer generated invoice. No signature required.</p>
      </div></body></html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice-${order.invoiceNumber}.html"`);
    res.send(invoiceHTML);

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate invoice' });
  }
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  createOrder,
  confirmOrder,
  updateOrderStatus,
  getMyOrders,
  getMySales,
  getOrderById,
  cancelOrder,
  getTracking,
  downloadInvoice
};