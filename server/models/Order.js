const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: String,
    author: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    fullName: String,
    mobile: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  orderDate: {
    type: Date,
    default: Date.now
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  cancellationReason: String,
  cancelledAt: Date,
  notes: {
    type: String,
    default: ''
  },
  trackingNumber: String,
  invoiceNumber: String
}, {
  timestamps: true
});

// Generate invoice number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.invoiceNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${String(count + 1).padStart(5, '0')}`;
    
    // Set estimated delivery (5-7 days from order)
    if (!this.estimatedDelivery) {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 6);
      this.estimatedDelivery = deliveryDate;
    }
  }
  next();
});

// Add initial status to history
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: 'pending',
      timestamp: new Date(),
      note: 'Order placed successfully'
    });
  }
  next();
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);