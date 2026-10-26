const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const LostAndFound = require('../models/LostAndFound');
const { sampleLostFound } = require('../utils/mockData');

// @desc    Get all lost and found items
// @route   GET /api/lost-found
// @access  Public
const getLostFoundItems = asyncHandler(async (req, res) => {
  const { type, status, category, search } = req.query;

  if (mongoose.connection.readyState === 1) {
    try {
      const filter = {};
      if (type) filter.type = type;
      if (status) filter.status = status;
      if (category) filter.category = category;
      if (search) {
        const sRegex = { $regex: search, $options: 'i' };
        filter.$or = [
          { title: sRegex },
          { description: sRegex },
          { location: sRegex },
        ];
      }

      const items = await LostAndFound.find(filter)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 });

      if (items.length > 0) {
        return res.json(items);
      }
    } catch (e) {
      console.log('Falling back to local lost & found dataset...');
    }
  }

  // Fallback
  let filtered = [...sampleLostFound];
  if (type) filtered = filtered.filter((item) => item.type === type);
  if (status) filtered = filtered.filter((item) => item.status === status);
  if (category) filtered = filtered.filter((item) => (item.category || '').toLowerCase() === category.toLowerCase());
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q)
    );
  }

  res.json(filtered);
});

// @desc    Report a lost or found item
// @route   POST /api/lost-found
// @access  Private
const createLostFoundItem = asyncHandler(async (req, res) => {
  const {
    type,
    title,
    description,
    category,
    location,
    dateOccurred,
    imageUrl,
    contactPhone,
  } = req.body;

  if (!type || !title || !description || !location) {
    res.status(400);
    throw new Error('Type, title, description, and location are required');
  }

  const phone = contactPhone || req.user.phone || '+91 98765 43210';

  if (mongoose.connection.readyState === 1) {
    try {
      const item = await LostAndFound.create({
        user: req.user._id,
        reporterName: req.user.name || 'Campus Student',
        contactPhone: phone,
        type,
        title,
        description,
        category: category || 'Other',
        location,
        dateOccurred: dateOccurred || new Date().toISOString().split('T')[0],
        imageUrl: imageUrl || '',
        status: 'open',
      });
      return res.status(201).json(item);
    } catch (e) {}
  }

  const fallbackItem = {
    _id: 'iar_lf_' + Date.now(),
    user: req.user._id,
    reporterName: req.user.name || 'Campus Student',
    contactPhone: phone,
    type,
    title,
    description,
    category: category || 'Other',
    location,
    dateOccurred: dateOccurred || new Date().toISOString().split('T')[0],
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  sampleLostFound.unshift(fallbackItem);
  res.status(201).json(fallbackItem);
});

// @desc    Update lost & found item status (e.g., claimed, resolved)
// @route   PUT /api/lost-found/:id/status
// @access  Private
const updateLostFoundStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (mongoose.connection.readyState === 1) {
    try {
      const item = await LostAndFound.findById(req.params.id);
      if (item) {
        if (req.user.role !== 'admin' && !item.user.equals(req.user._id)) {
          res.status(403);
          throw new Error('Not authorized to update this report');
        }
        item.status = status || item.status;
        const updated = await item.save();
        return res.json(updated);
      }
    } catch (e) {
      if (e.message && e.message.includes('Not authorized')) throw e;
    }
  }

  const idx = sampleLostFound.findIndex((item) => String(item._id) === String(req.params.id));
  if (idx !== -1) {
    sampleLostFound[idx].status = status || sampleLostFound[idx].status;
    return res.json(sampleLostFound[idx]);
  }

  res.status(404);
  throw new Error('Lost & Found item not found');
});

// @desc    Delete a lost & found item
// @route   DELETE /api/lost-found/:id
// @access  Private
const deleteLostFoundItem = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const item = await LostAndFound.findById(req.params.id);
      if (item) {
        if (req.user.role !== 'admin' && !item.user.equals(req.user._id)) {
          res.status(403);
          throw new Error('Not authorized to delete this report');
        }
        await item.deleteOne();
        return res.json({ message: 'Report removed' });
      }
    } catch (e) {
      if (e.message && e.message.includes('Not authorized')) throw e;
    }
  }

  const idx = sampleLostFound.findIndex((item) => String(item._id) === String(req.params.id));
  if (idx !== -1) {
    sampleLostFound.splice(idx, 1);
    return res.json({ message: 'Report removed' });
  }

  res.status(404);
  throw new Error('Lost & Found item not found');
});

module.exports = {
  getLostFoundItems,
  createLostFoundItem,
  updateLostFoundStatus,
  deleteLostFoundItem,
};
