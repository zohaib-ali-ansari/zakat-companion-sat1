const express = require('express');
const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyRegistrationOtp,
  verifyResetOtp,
  resetPassword,
  resendOtp,
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-registration-otp', verifyRegistrationOtp);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOtp);

module.exports = router;
