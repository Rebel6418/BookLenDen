const Book = require('../models/Book');

const getAllBooks = async (req, res) => {
  try {
    const { search, category, condition } = req.query;
    
    let query = { isAvailable: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (condition) {
      query.condition = condition;
    }

    const books = await Book.find(query)
      .populate('seller', 'name mobile firstName lastName')
      .sort({ createdAt: -1 });
    
    console.log(`📚 Found ${books.length} books`);
    
    res.status(200).json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    console.error('❌ Get Books Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch books' 
    });
  }
};

const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id)
      .populate('seller', 'name mobile email firstName lastName');

    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }

    res.status(200).json({
      success: true,
      book
    });
  } catch (error) {
    console.error('❌ Get Book Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch book' 
    });
  }
};

const createBook = async (req, res) => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 CREATE BOOK REQUEST');
    console.log('User:', req.user?._id);
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const { title, author, price, condition, category, description } = req.body;
    
    // ✅ FIXED: Store only filename, NOT full URL
    let image;
    if (req.file) {
      // If using Cloudinary (req.file.path will be URL)
      if (req.file.path && req.file.path.startsWith('http')) {
        image = req.file.path;
      } else {
        // ✅ Store ONLY filename
        image = req.file.filename;
      }
    } else {
      image = 'https://placehold.co/400x600/3b82f6/ffffff?text=📚+Book';
    }

    console.log('📷 Final Image to save:', image);

    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    if (!title || !author || !price || !condition) {
      return res.status(400).json({ 
        success: false,
        message: 'Title, author, price, and condition are required' 
      });
    }

    const book = await Book.create({
      title,
      author,
      price: Number(price),
      condition,
      category: category || 'General',
      description: description || '',
      image,
      seller: req.user._id
    });

    const populatedBook = await Book.findById(book._id)
      .populate('seller', 'name mobile firstName lastName');

    console.log('✅ Book created successfully:', populatedBook._id);
    console.log('✅ Image saved as:', image);

    res.status(201).json({
      success: true,
      message: 'Book listed successfully',
      book: populatedBook
    });

  } catch (error) {
    console.error('❌ Create Book Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to list book' 
    });
  }
};

const getMyBooks = async (req, res) => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📚 GET MY BOOKS REQUEST');
    console.log('User:', req.user?._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    const books = await Book.find({ seller: req.user._id })
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${books.length} books for user ${req.user._id}`);
    
    res.status(200).json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    console.error('❌ Get My Books Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to fetch your books' 
    });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, price, condition, category, description, isAvailable } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }

    if (book.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    const updates = {};
    if (title) updates.title = title;
    if (author) updates.author = author;
    if (price) updates.price = price;
    if (condition) updates.condition = condition;
    if (category) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate('seller', 'name mobile firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      book: updatedBook
    });
  } catch (error) {
    console.error('❌ Update Book Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update book' 
    });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ 
        success: false,
        message: 'Book not found' 
      });
    }

    if (book.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }

    await Book.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete Book Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete book' 
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  getMyBooks,
  updateBook,
  deleteBook
};