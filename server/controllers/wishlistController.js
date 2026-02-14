const Wishlist = require('../models/Wishlist');
const Book = require('../models/Book');

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'books',
        populate: { path: 'seller', select: 'name mobile' }
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, books: [] });
    }

    res.status(200).json({
      success: true,
      count: wishlist.books.length,
      wishlist: wishlist.books
    });
  } catch (error) {
    console.error('Get Wishlist Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist'
    });
  }
};

// Add book to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, books: [bookId] });
    } else {
      // Check if already in wishlist
      if (wishlist.books.includes(bookId)) {
        return res.status(400).json({
          success: false,
          message: 'Book already in wishlist'
        });
      }
      wishlist.books.push(bookId);
      await wishlist.save();
    }

    await wishlist.populate({
      path: 'books',
      populate: { path: 'seller', select: 'name mobile' }
    });

    console.log(`✅ Added book ${bookId} to wishlist for user ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: 'Book added to wishlist',
      wishlist: wishlist.books
    });
  } catch (error) {
    console.error('Add to Wishlist Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist'
    });
  }
};

// Remove book from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.books = wishlist.books.filter(id => id.toString() !== bookId);
    await wishlist.save();

    await wishlist.populate({
      path: 'books',
      populate: { path: 'seller', select: 'name mobile' }
    });

    console.log(`✅ Removed book ${bookId} from wishlist for user ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: 'Book removed from wishlist',
      wishlist: wishlist.books
    });
  } catch (error) {
    console.error('Remove from Wishlist Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist'
    });
  }
};

// Check if book is in wishlist
const checkWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    const isInWishlist = wishlist ? wishlist.books.includes(bookId) : false;

    res.status(200).json({
      success: true,
      isInWishlist
    });
  } catch (error) {
    console.error('Check Wishlist Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist'
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist
};