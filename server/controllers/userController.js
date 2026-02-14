const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get user profile
const getProfile = async (req, res) => {
  try {
    console.log('👤 GET PROFILE - User:', req.user._id);

    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    console.log('✏️ UPDATE PROFILE - User:', req.user._id);
    console.log('Body:', req.body);

    const { firstName, lastName, mobile, email } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json ({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Check if mobile is being changed and if it's already in use
    if (mobile && mobile !== user.mobile) {
      const mobileExists = await User.findOne({ mobile });
      if (mobileExists) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number already in use'
        });
      }
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (mobile) user.mobile = mobile;
    if (email) user.email = email;

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    console.log('✅ Profile updated successfully');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('❌ Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    console.log('🔒 CHANGE PASSWORD - User:', req.user._id);

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    console.log('✅ Password changed successfully');

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Change Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    console.log('📷 UPLOAD PROFILE PICTURE - User:', req.user._id);
    console.log('File:', req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get image URL
    let profilePicture;
    if (req.file.path && req.file.path.startsWith('http')) {
      // Cloudinary URL
      profilePicture = req.file.path;
    } else {
      // Local upload - store only filename
      profilePicture = req.file.filename;
    }

    user.profilePicture = profilePicture;
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    console.log('✅ Profile picture uploaded:', profilePicture);

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('❌ Upload Profile Picture Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture'
    });
  }
};

// Get user stats (purchase & sales history counts)
const getUserStats = async (req, res) => {
  try {
    console.log('📊 GET USER STATS - User:', req.user._id);

    const Order = require('../models/Order');
    const Book = require('../models/Book');

    // Get purchase count
    const purchaseCount = await Order.countDocuments({ buyer: req.user._id });

    // Get sales count (count orders that contain this user's books)
    const salesCount = await Order.countDocuments({ 'items.seller': req.user._id });

    // Get listed books count
    const listedBooksCount = await Book.countDocuments({ seller: req.user._id });

    // Get total revenue
    const salesOrders = await Order.find({ 'items.seller': req.user._id });
    let totalRevenue = 0;
    
    salesOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.seller.toString() === req.user._id.toString()) {
          totalRevenue += item.price * item.quantity;
        }
      });
    });

    res.status(200).json({
      success: true,
      stats: {
        purchaseCount,
        salesCount,
        listedBooksCount,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('❌ Get User Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture,
  getUserStats
};