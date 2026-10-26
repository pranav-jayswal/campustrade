const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    enrollmentNo: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    ticketCode: {
      type: String,
      required: true,
      trim: true,
    },
    ticketType: {
      type: String,
      default: 'Standard Pass',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event or campaign title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide an event description'],
    },
    category: {
      type: String,
      enum: [
        'Tech Fest & Hackathon',
        'Workshop & Seminar',
        'Cultural & Sports',
        'Campus Campaign',
        'Guest Lecture',
      ],
      default: 'Workshop & Seminar',
    },
    organizer: {
      name: {
        type: String,
        required: true,
        default: 'Department Head / College Admin',
      },
      department: {
        type: String,
        required: true,
        default: 'Institute of Advanced Research',
      },
      contactEmail: {
        type: String,
        default: 'events@iar.ac.in',
      },
      phone: {
        type: String,
        default: '+91 98765 43210',
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    bannerUrl: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    },
    venue: {
      type: String,
      required: true,
      default: 'IAR Main Auditorium, Block A, Gandhinagar',
    },
    eventDate: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    eventTime: {
      type: String,
      default: '10:00 AM - 04:00 PM',
    },
    registrationDeadline: {
      type: Date,
      default: () => new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
    registrationType: {
      type: String,
      enum: ['free_rsvp', 'paid_ticket', 'external_link'],
      default: 'free_rsvp',
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCapacity: {
      type: Number,
      default: 150,
      min: 1,
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    externalRegistrationUrl: {
      type: String,
      trim: true,
      default: '',
    },
    attendees: [attendeeSchema],
    status: {
      type: String,
      enum: ['upcoming', 'live', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    isUrgentNotice: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ eventDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ 'organizer.department': 1 });

module.exports = mongoose.model('Event', eventSchema);
