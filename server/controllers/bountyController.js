const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const BountyRequest = require('../models/BountyRequest');
const { sampleBounties, sampleSeller } = require('../utils/mockData');

// @desc    Get all campus requests/bounties
// @route   GET /api/bounties
// @access  Public
const getBounties = asyncHandler(async (req, res) => {
  const { status, category, department, urgency, search } = req.query;

  if (mongoose.connection.readyState === 1) {
    try {
      const filter = {};
      if (status) filter.status = status;
      if (category) filter.category = category;
      if (urgency) filter.urgency = urgency;
      if (department) filter.department = new RegExp(department, 'i');
      if (search) {
        const sRegex = { $regex: search, $options: 'i' };
        filter.$or = [
          { title: sRegex },
          { description: sRegex },
          { courseCode: sRegex },
          { department: sRegex },
        ];
      }

      const bounties = await BountyRequest.find(filter)
        .populate('user', 'name email phone campus isVerifiedStudent')
        .sort({ createdAt: -1 });

      if (bounties.length > 0) {
        return res.json(bounties);
      }
    } catch (e) {
      console.log('Falling back to local bounties...');
    }
  }

  // Fallback
  let filtered = [...sampleBounties];
  if (status) filtered = filtered.filter((b) => b.status === status);
  if (category) filtered = filtered.filter((b) => b.category.toLowerCase() === category.toLowerCase());
  if (urgency) filtered = filtered.filter((b) => b.urgency === urgency);
  if (department) filtered = filtered.filter((b) => (b.department || '').toLowerCase().includes(department.toLowerCase()));
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((b) =>
      b.title.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      (b.courseCode && b.courseCode.toLowerCase().includes(q))
    );
  }

  res.json(filtered);
});

// @desc    Create a campus request / bounty
// @route   POST /api/bounties
// @access  Private
const createBounty = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    department,
    semester,
    courseCode,
    budget,
    requestType,
    neededBy,
    urgency,
  } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error('Title and description are required for request');
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const bounty = await BountyRequest.create({
        user: req.user._id,
        userName: req.user.name || 'Campus Student',
        userPhone: req.user.phone || '+91 98765 43210',
        campus: req.user.campus || 'Institute of Advanced Research, Gandhinagar',
        title,
        description,
        category: category || 'General',
        department: department || '',
        semester: semester ? Number(semester) : null,
        courseCode: (courseCode || '').toUpperCase().trim(),
        budget: Number(budget) || 0,
        requestType: requestType || 'buy',
        neededBy: neededBy || 'This Week',
        urgency: urgency || 'normal',
        status: 'open',
      });
      return res.status(201).json(bounty);
    } catch (e) {}
  }

  const fallbackBounty = {
    _id: 'iar_bounty_' + Date.now(),
    user: req.user._id,
    userName: req.user.name || 'Campus Student',
    userPhone: req.user.phone || '+91 98765 43210',
    campus: req.user.campus || 'Institute of Advanced Research, Gandhinagar',
    title,
    description,
    category: category || 'General',
    department: department || '',
    semester: semester ? Number(semester) : null,
    courseCode: (courseCode || '').toUpperCase().trim(),
    budget: Number(budget) || 0,
    requestType: requestType || 'buy',
    neededBy: neededBy || 'This Week',
    urgency: urgency || 'normal',
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  sampleBounties.unshift(fallbackBounty);
  res.status(201).json(fallbackBounty);
});

// @desc    Update bounty status (e.g. mark fulfilled)
// @route   PUT /api/bounties/:id/status
// @access  Private
const updateBountyStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (mongoose.connection.readyState === 1) {
    try {
      const bounty = await BountyRequest.findById(req.params.id);
      if (bounty) {
        if (req.user.role !== 'admin' && !bounty.user.equals(req.user._id)) {
          res.status(403);
          throw new Error('Not authorized to update this request');
        }
        bounty.status = status || bounty.status;
        const updated = await bounty.save();
        return res.json(updated);
      }
    } catch (e) {
      if (e.message && e.message.includes('Not authorized')) throw e;
    }
  }

  const idx = sampleBounties.findIndex((b) => String(b._id) === String(req.params.id));
  if (idx !== -1) {
    sampleBounties[idx].status = status || sampleBounties[idx].status;
    return res.json(sampleBounties[idx]);
  }

  res.status(404);
  throw new Error('Bounty request not found');
});

// @desc    Delete a bounty request
// @route   DELETE /api/bounties/:id
// @access  Private
const deleteBounty = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const bounty = await BountyRequest.findById(req.params.id);
      if (bounty) {
        if (req.user.role !== 'admin' && !bounty.user.equals(req.user._id)) {
          res.status(403);
          throw new Error('Not authorized to delete this request');
        }
        await bounty.deleteOne();
        return res.json({ message: 'Request removed' });
      }
    } catch (e) {
      if (e.message && e.message.includes('Not authorized')) throw e;
    }
  }

  const idx = sampleBounties.findIndex((b) => String(b._id) === String(req.params.id));
  if (idx !== -1) {
    sampleBounties.splice(idx, 1);
    return res.json({ message: 'Request removed' });
  }

  res.status(404);
  throw new Error('Bounty request not found');
});

module.exports = {
  getBounties,
  createBounty,
  updateBountyStatus,
  deleteBounty,
};
