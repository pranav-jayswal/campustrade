const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  sendVerificationCode,
  verifyCodeAndRegister,
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  deactivateAccount,
  deleteAccount,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' },
});

router.post('/send-verification-code', authLimiter, sendVerificationCode);
router.post('/verify-code', authLimiter, verifyCodeAndRegister);
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/deactivate', protect, deactivateAccount);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
