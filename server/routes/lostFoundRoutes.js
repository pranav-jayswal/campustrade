const express = require('express');
const {
  getLostFoundItems,
  createLostFoundItem,
  updateLostFoundStatus,
  deleteLostFoundItem,
} = require('../controllers/lostFoundController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(getLostFoundItems).post(protect, createLostFoundItem);
router.route('/:id/status').put(protect, updateLostFoundStatus);
router.route('/:id').delete(protect, deleteLostFoundItem);

module.exports = router;
