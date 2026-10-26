const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // never return the password hash in normal queries
    },
    role: {
      type: String,
      enum: ['admin', 'customer', 'student', 'staff'],
      default: 'student',
    },
    campus: {
      type: String,
      trim: true,
      default: 'Institute of Advanced Research, Gandhinagar',
    },
    studentId: {
      type: String,
      trim: true,
      default: '',
    },
    enrollmentNo: {
      type: String,
      trim: true,
      default: '',
    },
    staffCode: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    designation: {
      type: String,
      trim: true,
      default: '',
    },
    admissionYear: {
      type: Number,
    },
    gradYear: {
      type: Number,
    },
    isVerifiedStudent: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    isDeactivated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt automatically
  }
);

// Hash the password before saving, but only if it was changed/created.
// This prevents re-hashing an already-hashed password on unrelated updates.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method used during login to compare a plaintext password
// against the stored hash.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
