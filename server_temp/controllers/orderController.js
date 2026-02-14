const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');

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

    // ✅ Filter out null books
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

    // ✅ Map frontend fields to Order model fields
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

    // ✅ Clear cart
    cart.items = [];
    await cart.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name mobile email firstName lastName')
      .populate('items.book')
      .populate('items.seller', 'name mobile firstName lastName');

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

const getMyOrders = async (req, res) => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 GET MY ORDERS REQUEST');
    console.log('User ID:', req.user._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.book')
      .populate('items.seller', 'name mobile firstName lastName')
      .sort({ createdAt: -1 });

    console.log('📦 Found orders:', orders.length);
    console.log('Orders:', JSON.stringify(orders, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('buyer', 'name mobile email firstName lastName')
      .populate('items.book')
      .populate('items.seller', 'name mobile firstName lastName');

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

const getMySales = async (req, res) => {
  try {
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

module.exports = { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  getMySales 
};