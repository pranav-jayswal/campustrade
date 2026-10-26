const mongoose = require('mongoose');

// Snapshot of a purchased product at the time of order (name/price are
// copied in, not just referenced, so the order stays accurate even if the
// product is later edited or deleted).
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
    listingType: {
      type: String,
      enum: ['buy', 'rent', 'giveaway'],
      default: 'buy',
    },
    rentDeposit: {
      type: Number,
      default: 0,
    },
    depositStatus: {
      type: String,
      enum: ['held', 'refunded', 'forfeited', 'na'],
      default: 'na',
    },
    rentDurationDays: {
      type: Number,
      default: 1,
    },
    rentDueDate: {
      type: Date,
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    city: { type: String, default: 'At IAR Campus' },
    postalCode: { type: String, default: '' },
    meetupTime: { type: String, default: '' },
    country: { type: String, default: 'India' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: 'An order must contain at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalDeposit: {
      type: Number,
      default: 0,
    },
    depositStatus: {
      type: String,
      enum: ['held', 'refunded', 'forfeited', 'na'],
      default: 'na',
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    handoverOtp: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Speeds up "my orders" lookups and admin dashboards sorted by recency.
orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
