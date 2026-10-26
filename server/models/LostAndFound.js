const mongoose = require('mongoose');

const lostAndFoundSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reporterName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Please provide a contact phone number for item recovery'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide item title or description'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please describe where, when, and key identifying traits of the item'],
    },
    category: {
      type: String,
      enum: [
        'Electronics',
        'ID Cards & Wallets',
        'Keys',
        'Books & Stationery',
        'Bottles & Lunchboxes',
        'Clothing & Lab Coats',
        'Bags & Backpacks',
        'Other',
      ],
      default: 'Other',
    },
    location: {
      type: String,
      required: [true, 'Please specify campus location (e.g., Library, Canteen, Lab 204)'],
      trim: true,
    },
    dateOccurred: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['open', 'claimed', 'resolved'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

lostAndFoundSchema.index({ type: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('LostAndFound', lostAndFoundSchema);
