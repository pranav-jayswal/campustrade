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
  const hasBrevo = Boolean(process.env.BREVO_API_KEY && process.env.BREVO_API_KEY.trim());
  const hasResend = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());
  const hasUser = Boolean(process.env.EMAIL_USER && process.env.EMAIL_USER.trim());
  const hasPass = Boolean(process.env.EMAIL_PASS && process.env.EMAIL_PASS.trim());
  const senderEmail = hasUser ? process.env.EMAIL_USER.trim() : null;
  const maskedEmail = senderEmail
    ? `${senderEmail.split('@')[0].slice(0, 3)}***@${senderEmail.split('@')[1] || 'gmail.com'}`
    : 'Not configured';

  const provider = hasBrevo
    ? 'Brevo HTTPS API (Port 443 - Recommended for Render free tier)'
    : hasResend
    ? 'Resend HTTPS API (Port 443)'
    : hasUser && hasPass
    ? 'Gmail SMTP'
    : 'None';

  res.json({
    emailServiceConfigured: hasBrevo || hasResend || (hasUser && hasPass),
    activeProvider: provider,
    brevoConfigured: hasBrevo,
    resendConfigured: hasResend,
    gmailSmtpConfigured: hasUser && hasPass,
    maskedSenderEmail: maskedEmail,
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
