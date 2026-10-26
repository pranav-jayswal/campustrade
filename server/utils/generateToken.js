const jwt = require('jsonwebtoken');

// Signs a JWT containing just the user's id. authMiddleware verifies this
// token and looks the user back up on every protected request.
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

module.exports = generateToken;
