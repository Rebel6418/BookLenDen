const axios = require('axios');

const sendOTPSMS = async (mobile, otp) => {
  try {
    const apiKey = process.env.FAST2SMS_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Fast2SMS API key not found in .env');
      // For development, return true to continue without SMS
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Development mode: Skipping SMS, OTP will be shown in console');
        return true;
      }
      return false;
    }

    const message = `Your BookLenDen OTP is: ${otp}. Valid for 5 minutes. Do not share with anyone.`;

    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: apiKey,
        sender_id: 'TXTIND',
        message: message,
        route: 'v3',
        numbers: mobile
      }
    });

    if (response.data.return === true) {
      console.log(`✅ OTP sent successfully to ${mobile}`);
      return true;
    } else {
      console.error('❌ Failed to send OTP:', response.data);
      return false;
    }

  } catch (error) {
    console.error('❌ SMS Service Error:', error.message);
    // For development, return true to continue
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ SMS failed but continuing in development mode');
      return true;
    }
    return false;
  }
};

module.exports = { sendOTPSMS };