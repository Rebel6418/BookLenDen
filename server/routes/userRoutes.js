const express = require('express');
const router = express.Router();
const { updateSellerAddress, updateBankDetails } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture,
  getUserStats
} = require('../controllers/userController');

// User profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);
router.post('/upload-picture', protect, upload.single('profilePicture'), uploadProfilePicture);
router.get('/stats', protect, getUserStats);
router.put('/seller-address', protect, updateSellerAddress);
router.put('/bank-details', protect, updateBankDetails);
module.exports = router;