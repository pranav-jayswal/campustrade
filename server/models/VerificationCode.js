const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    registrationData: {
      type: Object,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // Document automatically expires in 10 minutes
    },
  }
);

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);
