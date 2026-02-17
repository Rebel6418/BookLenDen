const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profilePicture: {
    type: String,
    default: 'https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff&size=200'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // ✅ SELLER ADDRESS - For Shiprocket Pickup (PRIVATE - never shown to buyers)
  sellerAddress: {
    fullName:     { type: String, default: '' },
    mobile:       { type: String, default: '' },
    addressLine1: { type: String, default: '' },
    addressLine2: { type: String, default: '' },
    city:         { type: String, default: '' },
    state:        { type: String, default: '' },
    pincode:      { type: String, default: '' },
    landmark:     { type: String, default: '' }
  },
  // ✅ SELLER BANK DETAILS - For payment settlement
  bankDetails: {
    accountHolderName: { type: String, default: '' },
    accountNumber:     { type: String, default: '' },
    ifscCode:          { type: String, default: '' },
    bankName:          { type: String, default: '' },
    upiId:             { type: String, default: '' }
  },
  // ✅ SELLER STATS
  totalSales:    { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  rating:        { type: Number, default: 0 },
  totalRatings:  { type: Number, default: 0 }
}, {
  timestamps: true
});

// Virtual for full name
userSchema.virtual('name').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Check if seller address is complete
userSchema.virtual('isSellerAddressComplete').get(function() {
  const addr = this.sellerAddress;
  return !!(addr && addr.fullName && addr.mobile && addr.addressLine1 && addr.city && addr.pincode);
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);