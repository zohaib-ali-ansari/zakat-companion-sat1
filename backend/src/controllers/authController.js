const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOtp, sendOtpEmail } = require('../services/emailService');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET || 'zakat-secret-key',
    { expiresIn: '7d' }
  );
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      otp,
      otpExpiresAt,
      isEmailVerified: false,
    });

    const emailResult = await sendOtpEmail({
      email: user.email,
      name: user.name,
      otp,
      purpose: 'register',
    });

    if (!emailResult.success) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: emailResult.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'OTP sent to your email. Please verify your account.',
      userId: user._id,
      email: user.email,
      otpSent: true,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register user',
    });
  }
};

const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    if (!user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Verify registration OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const resetToken = require('../services/emailService').generateResetToken();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.passwordResetOtp = resetToken;
    user.passwordResetOtpExpiresAt = otpExpiresAt;
    await user.save();

    const resetLink = `${process.env.APP_RESET_URL || 'http://localhost:8082'}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(user.email)}`;

    const emailResult = await sendOtpEmail({
      email: user.email,
      name: user.name,
      otp: resetToken,
      purpose: 'reset',
      resetLink,
    });

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: emailResult.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email.',
      email: user.email,
      resetLink,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send password reset link',
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, token, newPassword, confirmPassword } = req.body;
    const resetValue = token || otp;

    if (!email || !resetValue || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, reset token, new password, and confirm password are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.passwordResetOtp || user.passwordResetOtp !== resetValue) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset link or OTP',
      });
    }

    if (!user.passwordResetOtpExpiresAt || new Date(user.passwordResetOtpExpiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset link has expired',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetOtp = null;
    user.passwordResetOtpExpiresAt = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password',
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email or password is wrong',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email or password is wrong',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to login user',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyRegistrationOtp,
  resetPassword,
};
