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
  invoiceNumber: String,
  
  // ✅ NEW: Shiprocket Integration Fields
  shiprocket: {
    order_id: {
      type: String,
      default: ''
    },
    shipment_id: {
      type: String,
      default: ''
    },
    awb_code: {
      type: String,
      default: ''
    },
    courier_company_id: {
      type: Number,
      default: 0
    },
    courier_name: {
      type: String,
      default: ''
    },
    tracking_url: {
      type: String,
      default: ''
    },
    label_url: {
      type: String,
      default: ''
    },
    manifest_url: {
      type: String,
      default: ''
    },
    pickup_scheduled_date: {
      type: Date
    },
    pickup_token_number: {
      type: String,
      default: ''
    },
    estimated_delivery_date: {
      type: Date
    },
    current_status: {
      type: String,
      default: ''
    },
    current_status_code: {
      type: Number,
      default: 0
    },
    delivered_date: {
      type: Date
    },
    rto_initiated_date: {
      type: Date
    },
    weight: {
      type: Number,
      default: 0.5  // Default 500gm for books
    },
    rate: {
      type: Number,
      default: 0
    }
  }
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

// Add index for Shiprocket fields
orderSchema.index({ 'shiprocket.order_id': 1 });
orderSchema.index({ 'shiprocket.awb_code': 1 });
orderSchema.index({ 'shiprocket.shipment_id': 1 });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);