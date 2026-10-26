const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please provide reviewer name'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'staff'],
      default: 'student',
    },
    department: {
      type: String,
      default: 'Institute of Advanced Research',
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      trim: true,
    },
    comment: {
      type: String,
      required: [true, 'Please write a review comment'],
      trim: true,
    },
    verifiedPurchase: {
      type: Boolean,
      default: true,
    },
    meetupSpot: {
      type: String,
      default: 'IAR Campus',
      trim: true,
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dateStr: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a product title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    imageUrl: {
      type: String,
      required: [true, 'Please provide a product image URL'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    condition: {
      type: String,
      enum: ['Brand New', 'Like New', 'Good', 'Fair'],
      default: 'Good',
    },
    campus: {
      type: String,
      trim: true,
      default: 'Institute of Advanced Research, Gandhinagar',
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold'],
      default: 'available',
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    // Category A - Rental & Borrowing Deposit System
    listingType: {
      type: String,
      enum: ['buy', 'rent', 'giveaway'],
      default: 'buy',
    },
    rentPricePerDay: {
      type: Number,
      default: 0,
      min: [0, 'Rent price per day cannot be negative'],
    },
    rentDeposit: {
      type: Number,
      default: 0,
      min: [0, 'Rent deposit cannot be negative'],
    },
    rentDurationDays: {
      type: Number,
      default: 1,
      min: [1, 'Minimum rent duration is 1 day'],
    },
    // Category D - Senior Giveaway & Freecycle Hub
    isFreeGiveaway: {
      type: Boolean,
      default: false,
    },
    // Category B & D - Academic Tagging, Solved PYQs, Notes & Manuals
    department: {
      type: String,
      trim: true,
      default: '',
    },
    semester: {
      type: Number,
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8'],
      default: null,
    },
    courseCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    academicType: {
      type: String,
      enum: ['general', 'textbook', 'pyq', 'notes', 'manual', 'lab_gear'],
      default: 'general',
    },
    fileAttachmentUrl: {
      type: String,
      default: '',
    },
    // Category E - AI Pricing & Eco-Impact Savings
    originalMrp: {
      type: Number,
      default: 0,
      min: [0, 'MRP cannot be negative'],
    },
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  }
);

const { calculateProductRating } = require('../utils/productRating');

// Automatically compute authoritative rating and reviews based on image, description, condition, and soldCount
productSchema.pre('save', function (next) {
  const calc = calculateProductRating(this);
  if (
    !this.rating ||
    this.rating === 0 ||
    this.isModified('condition') ||
    this.isModified('imageUrl') ||
    this.isModified('description') ||
    this.isModified('soldCount')
  ) {
    this.rating = calc.rating;
  }
  if (this.reviews && this.reviews.length > 0) {
    this.numReviews = this.reviews.length;
    // calculate average rating if actual reviews exist
    const sum = this.reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const avg = Math.round((sum / this.reviews.length) * 10) / 10;
    // blend with algorithm
    this.rating = Math.round(((avg * 0.6) + (calc.rating * 0.4)) * 10) / 10;
  } else {
    this.numReviews = calc.reviewCount;
  }
  next();
});

// Text index powers a basic search box (title + description + campus).
productSchema.index({ title: 'text', description: 'text', campus: 'text' });
// Standard indexes for common marketplace filters
productSchema.index({ category: 1 });
productSchema.index({ campus: 1 });
productSchema.index({ seller: 1 });

module.exports = mongoose.model('Product', productSchema);
