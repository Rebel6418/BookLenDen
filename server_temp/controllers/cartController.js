const Cart = require('../models/Cart');
const Book = require('../models/Book');

// Get cart
const getCart = async (req, res) => {
  try {
    console.log('🛒 Get Cart - User:', req.user._id);

    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.book',
        select: 'title author price image condition category isAvailable seller'
      });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // ✅ Update stored prices with current book prices
    let needsUpdate = false;
    cart.items = cart.items.map(item => {
      if (item.book && item.book.price !== item.price) {
        item.price = item.book.price;
        needsUpdate = true;
      }
      return item;
    });

    if (needsUpdate) {
      await cart.save();
    }

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('❌ Get Cart Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
};

// Add to cart
const addToCart = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;

    console.log('➕ Add to Cart:', { user: req.user._id, bookId, quantity });

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (!book.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Book is not available'
      });
    }

    // Can't buy your own book
    if (book.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot buy your own book'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: []
      });
    }

    // Check if book already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.book.toString() === bookId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        book: bookId,
        quantity,
        price: book.price
      });
    }

    await cart.save();

    // Populate and return
    cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.book',
        select: 'title author price image condition category isAvailable'
      });

    res.json({
      success: true,
      message: 'Book added to cart',
      cart
    });
  } catch (error) {
    console.error('❌ Add to Cart Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add book to cart'
    });
  }
};

// Update cart item
const updateCartItem = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;

    console.log('✏️ Update Cart Item:', { user: req.user._id, bookId, quantity });

    if (!bookId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Book ID and quantity are required'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.book.toString() === bookId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.book',
        select: 'title author price image condition category isAvailable'
      });

    res.json({
      success: true,
      message: 'Cart updated',
      cart
    });
  } catch (error) {
    console.error('❌ Update Cart Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart'
    });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;

    console.log('🗑️ Remove from Cart:', { user: req.user._id, bookId });

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => item.book.toString() !== bookId
    );

    await cart.save();

    cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.book',
        select: 'title author price image condition category isAvailable'
      });

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart
    });
  } catch (error) {
    console.error('❌ Remove from Cart Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    console.log('🧹 Clear Cart - User:', req.user._id);

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared',
      cart
    });
  } catch (error) {
    console.error('❌ Clear Cart Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};