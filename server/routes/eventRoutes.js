const express = require('express');
const {
  getEvents,
  getEventById,
  createEvent,
  registerForEvent,
  getMyPasses,
  deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(getEvents).post(protect, createEvent);
router.get('/my/passes', protect, getMyPasses);
router.route('/:id').get(getEventById).delete(protect, deleteEvent);
router.post('/:id/register', registerForEvent);

module.exports = router;
