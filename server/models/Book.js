const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    default: 'General'
  },
  condition: {
    type: String,
    required: true,
    enum: ['Old', 'New']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: 'https://placehold.co/400x600/3b82f6/ffffff?text=📚+Book'
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  language: {
    type: String,
    default: 'English'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  ratings: {
    type: Map,
    of: Number,
    default: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Book || mongoose.model('Book', bookSchema);