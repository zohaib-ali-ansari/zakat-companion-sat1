const express = require('express');
const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyRegistrationOtp,
  resetPassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-registration-otp', verifyRegistrationOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
