const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    console.log('🔐 Auth Check:', {
      hasHeader: !!authHeader,
      headerValue: authHeader?.substring(0, 20) + '...'
    });
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', decoded);
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    req.user = user;
    req.userId = user._id;
    
    console.log('✅ User authenticated:', user._id);
    
    next();
  } catch (error) {
    console.error('❌ Auth Error:', error.message);
    res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};

// ✅ DUAL EXPORT - Both old and new code will work
module.exports = authMiddleware;
module.exports.protect = authMiddleware;