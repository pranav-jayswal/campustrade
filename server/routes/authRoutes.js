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

router.get('/email-status', (req, res) => {
  const hasUser = Boolean(process.env.EMAIL_USER && process.env.EMAIL_USER.trim());
  const hasPass = Boolean(process.env.EMAIL_PASS && process.env.EMAIL_PASS.trim());
  const senderEmail = hasUser ? process.env.EMAIL_USER.trim() : null;
  const maskedEmail = senderEmail
    ? `${senderEmail.split('@')[0].slice(0, 3)}***@${senderEmail.split('@')[1] || 'gmail.com'}`
    : 'Not configured';

  res.json({
    emailServiceConfigured: hasUser && hasPass,
    senderEmailConfigured: hasUser,
    passwordConfigured: hasPass,
    maskedSenderEmail: maskedEmail,
    instruction: hasUser && hasPass
      ? 'Gmail SMTP credentials are ready. Real emails will be delivered.'
      : 'EMAIL_USER and/or EMAIL_PASS are missing in environment variables. Add them in Render dashboard to send real emails.',
  });
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
