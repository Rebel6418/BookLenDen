const crypto = require('crypto');
const NodeCache = require('node-cache');
const axios = require('axios');

// OTP cache - 5 minutes expiry
const otpCache = new NodeCache({ stdTTL: 300 });

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendOTPviaMSG91 = async (mobile, otp) => {
  try {
    if (!process.env.MSG91_AUTH_KEY) {
      console.log('⚠️  MSG91 not configured');
      return false;
    }

    const response = await axios.post(
      'https://control.msg91.com/api/v5/otp',
      {
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: `91${mobile}`,
        authkey: process.env.MSG91_AUTH_KEY,
        otp: otp
      }
    );

    console.log('✅ MSG91 OTP sent:', response.data);
    return true;
  } catch (error) {
    console.error('❌ MSG91 Error:', error.response?.data || error.message);
    return false;
  }
};

const sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ 
        success: false,
        message: 'Valid 10-digit mobile number required' 
      });
    }

    const otp = generateOTP();
    otpCache.set(mobile, otp);

    console.log(`📱 OTP for ${mobile}: ${otp}`);

    // Send via MSG91 in production
    if (process.env.NODE_ENV === 'production' && process.env.MSG91_AUTH_KEY) {
      await sendOTPviaMSG91(mobile, otp);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your mobile number',
      // Only in development
      ...(process.env.NODE_ENV !== 'production' && { otp })
    });

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send OTP. Please try again.' 
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Mobile and OTP are required' 
      });
    }

    const cachedOTP = otpCache.get(mobile);

    if (!cachedOTP) {
      return res.status(400).json({ 
        success: false,
        message: 'OTP expired. Please request a new OTP.' 
      });
    }

    if (cachedOTP !== otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid OTP. Please try again.' 
      });
    }

    otpCache.del(mobile);
    console.log(`✅ OTP verified for ${mobile}`);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'OTP verification failed.' 
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ 
        success: false,
        message: 'Valid 10-digit mobile number required' 
      });
    }

    otpCache.del(mobile);
    const otp = generateOTP();
    otpCache.set(mobile, otp);

    console.log(`📱 Resent OTP for ${mobile}: ${otp}`);

    if (process.env.NODE_ENV === 'production' && process.env.MSG91_AUTH_KEY) {
      await sendOTPviaMSG91(mobile, otp);
    }

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      ...(process.env.NODE_ENV !== 'production' && { otp })
    });

  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to resend OTP.' 
    });
  }
};

module.exports = { sendOTP, verifyOTP, resendOTP };