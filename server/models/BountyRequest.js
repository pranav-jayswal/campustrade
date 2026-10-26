const mongoose = require('mongoose');

const bountyRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userPhone: {
      type: String,
      default: '',
      trim: true,
    },
    campus: {
      type: String,
      default: 'Institute of Advanced Research, Gandhinagar',
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide what item or service you are requesting'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide details of your request'],
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: null,
    },
    courseCode: {
      type: String,
      default: '',
      uppercase: true,
      trim: true,
    },
    budget: {
      type: Number,
      default: 0,
      min: 0,
    },
    requestType: {
      type: String,
      enum: ['buy', 'borrow', 'any'],
      default: 'buy',
    },
    neededBy: {
      type: String,
      default: 'Urgent / This Week',
      trim: true,
    },
    urgency: {
      type: String,
      enum: ['normal', 'urgent', 'flexible'],
      default: 'normal',
    },
    status: {
      type: String,
      enum: ['open', 'fulfilled', 'closed'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

bountyRequestSchema.index({ status: 1, createdAt: -1 });
bountyRequestSchema.index({ category: 1 });
bountyRequestSchema.index({ department: 1 });

module.exports = mongoose.model('BountyRequest', bountyRequestSchema);
