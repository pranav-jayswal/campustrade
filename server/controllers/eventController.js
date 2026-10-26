const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const { sampleEvents } = require('../utils/mockEvents');

// @desc    Get all campus events & campaigns
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const { category, search, type, status } = req.query;

  if (mongoose.connection.readyState === 1) {
    try {
      const filter = {};
      if (category && category !== 'All') {
        filter.category = category;
      }
      if (type && type !== 'all') {
        filter.registrationType = type;
      }
      if (status) {
        filter.status = status;
      }
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'organizer.department': { $regex: search, $options: 'i' } },
          { venue: { $regex: search, $options: 'i' } },
        ];
      }

      const events = await Event.find(filter).sort({ eventDate: 1 });
      return res.json(events);
    } catch (e) {
      console.error('Error querying MongoDB events:', e.message);
    }
  }

  // In-memory fallback
  let list = [...sampleEvents];
  if (category && category !== 'All') {
    list = list.filter((e) => e.category.toLowerCase() === category.toLowerCase());
  }
  if (type && type !== 'all') {
    list = list.filter((e) => e.registrationType === type);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        (e.organizer?.department || '').toLowerCase().includes(q)
    );
  }

  res.json(list);
});

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const event = await Event.findById(req.params.id);
      if (event) return res.json(event);
    } catch (e) {}
  }

  const ev = sampleEvents.find((e) => String(e._id) === String(req.params.id));
  if (ev) return res.json(ev);

  res.status(404);
  throw new Error('Event or campaign not found');
});

// @desc    Create a new event or campaign (Admin / Staff / Department Head)
// @route   POST /api/events
// @access  Private (Admin or Staff)
const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    organizerName,
    department,
    contactEmail,
    phone,
    bannerUrl,
    venue,
    eventDate,
    eventTime,
    registrationDeadline,
    registrationType,
    price,
    totalCapacity,
    externalRegistrationUrl,
    isUrgentNotice,
  } = req.body;

  if (!title || !description || !venue || !eventDate) {
    res.status(400);
    throw new Error('Please fill in all required event details (title, description, venue, date)');
  }

  const eventPayload = {
    title: title.trim(),
    description: description.trim(),
    category: category || 'Workshop & Seminar',
    organizer: {
      name: organizerName || req.user?.name || 'Department Head / Faculty Coordinator',
      department: department || req.user?.department || 'Institute of Advanced Research',
      contactEmail: contactEmail || req.user?.email || 'events@iar.ac.in',
      phone: phone || req.user?.phone || '+91 98765 43210',
      createdBy: req.user?._id,
    },
    bannerUrl:
      bannerUrl ||
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    venue: venue.trim(),
    eventDate: new Date(eventDate),
    eventTime: eventTime || '10:00 AM - 04:00 PM',
    registrationDeadline: registrationDeadline
      ? new Date(registrationDeadline)
      : new Date(new Date(eventDate).getTime() - 24 * 60 * 60 * 1000),
    registrationType: registrationType || 'free_rsvp',
    price: registrationType === 'paid_ticket' ? Number(price) || 0 : 0,
    totalCapacity: Number(totalCapacity) || 100,
    registeredCount: 0,
    externalRegistrationUrl: externalRegistrationUrl ? externalRegistrationUrl.trim() : '',
    attendees: [],
    status: 'upcoming',
    isUrgentNotice: Boolean(isUrgentNotice),
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const created = await Event.create(eventPayload);
      return res.status(201).json(created);
    } catch (e) {
      console.error('Error creating event in MongoDB:', e.message);
    }
  }

  const inMem = {
    _id: `evt-${Date.now()}`,
    ...eventPayload,
    createdAt: new Date().toISOString(),
  };
  sampleEvents.unshift(inMem);
  res.status(201).json(inMem);
});

// @desc    Register for event / Claim Pass / Buy Ticket
// @route   POST /api/events/:id/register
// @access  Public / Authenticated
const registerForEvent = asyncHandler(async (req, res) => {
  const { studentName, email, enrollmentNo, department, ticketType } = req.body;

  const regName = (studentName || req.user?.name || '').trim();
  const regEmail = (email || req.user?.email || '').trim().toLowerCase();
  const regEnroll = (enrollmentNo || req.user?.enrollmentNo || req.user?.studentId || 'IAR-CAMPUS').trim();
  const regDept = (department || req.user?.department || 'Institute of Advanced Research').trim();

  if (!regName || !regEmail) {
    res.status(400);
    throw new Error('Student name and campus email are required to register for this event');
  }

  const prefix = 'IAR';
  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const ticketCode = `${prefix}-PASS-${randomCode}`;

  const attendeeRecord = {
    studentName: regName,
    email: regEmail,
    enrollmentNo: regEnroll,
    department: regDept,
    ticketCode,
    ticketType: ticketType || 'Standard Entry Pass',
    registeredAt: new Date(),
  };
  if (req.user?._id) {
    attendeeRecord.student = req.user._id;
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        res.status(404);
        throw new Error('Event not found');
      }

      // Check capacity
      if (event.totalCapacity && event.registeredCount >= event.totalCapacity) {
        res.status(400);
        throw new Error('All registration spots for this event have been filled.');
      }

      // Check if already registered
      const already = event.attendees.find(
        (a) => a.email.toLowerCase() === regEmail || (req.user?._id && a.student?.equals(req.user._id))
      );
      if (already) {
        return res.status(200).json({
          message: 'You have already registered for this event! Here is your confirmed entry pass.',
          pass: already,
          event,
        });
      }

      event.attendees.push(attendeeRecord);
      event.registeredCount = event.attendees.length;
      await event.save();

      return res.status(201).json({
        message: 'Registration confirmed! Digital pass issued.',
        pass: attendeeRecord,
        event,
      });
    } catch (e) {
      if (e.message && e.message.includes('filled')) throw e;
      console.error('Error during event registration:', e.message);
    }
  }

  // In-memory fallback
  const event = sampleEvents.find((e) => String(e._id) === String(req.params.id));
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (event.registeredCount >= event.totalCapacity) {
    res.status(400);
    throw new Error('All registration spots for this event have been filled.');
  }

  const existing = (event.attendees || []).find((a) => a.email.toLowerCase() === regEmail);
  if (existing) {
    return res.status(200).json({
      message: 'You have already registered for this event! Here is your entry pass.',
      pass: existing,
      event,
    });
  }

  if (!event.attendees) event.attendees = [];
  event.attendees.push(attendeeRecord);
  event.registeredCount = event.attendees.length;

  res.status(201).json({
    message: 'Registration confirmed! Digital pass issued.',
    pass: attendeeRecord,
    event,
  });
});

// @desc    Get all event passes for the logged-in student
// @route   GET /api/events/my/passes
// @access  Private
const getMyPasses = asyncHandler(async (req, res) => {
  const userEmail = (req.user?.email || '').toLowerCase();
  const userId = req.user?._id;

  const passes = [];

  if (mongoose.connection.readyState === 1) {
    try {
      const events = await Event.find({
        $or: [{ 'attendees.student': userId }, { 'attendees.email': userEmail }],
      });

      events.forEach((ev) => {
        const attendee = ev.attendees.find(
          (a) => (userId && a.student?.equals(userId)) || a.email.toLowerCase() === userEmail
        );
        if (attendee) {
          passes.push({
            passId: attendee.ticketCode,
            ticketCode: attendee.ticketCode,
            ticketType: attendee.ticketType,
            registeredAt: attendee.registeredAt,
            event: {
              _id: ev._id,
              title: ev.title,
              category: ev.category,
              venue: ev.venue,
              eventDate: ev.eventDate,
              eventTime: ev.eventTime,
              bannerUrl: ev.bannerUrl,
              organizer: ev.organizer,
              price: ev.price,
              registrationType: ev.registrationType,
            },
          });
        }
      });

      return res.json(passes);
    } catch (e) {}
  }

  sampleEvents.forEach((ev) => {
    const attendee = (ev.attendees || []).find(
      (a) => a.email.toLowerCase() === userEmail || a.studentName === req.user?.name
    );
    if (attendee) {
      passes.push({
        passId: attendee.ticketCode,
        ticketCode: attendee.ticketCode,
        ticketType: attendee.ticketType,
        registeredAt: attendee.registeredAt,
        event: ev,
      });
    }
  });

  res.json(passes);
});

// @desc    Delete event (Admin or Creator)
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const event = await Event.findById(req.params.id);
      if (event) {
        await event.deleteOne();
        return res.json({ message: 'Event removed' });
      }
    } catch (e) {}
  }

  const idx = sampleEvents.findIndex((e) => String(e._id) === String(req.params.id));
  if (idx !== -1) {
    sampleEvents.splice(idx, 1);
    return res.json({ message: 'Event removed' });
  }

  res.status(404);
  throw new Error('Event not found');
});

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  registerForEvent,
  getMyPasses,
  deleteEvent,
};
