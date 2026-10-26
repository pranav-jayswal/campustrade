const express = require('express');
const {
  getBounties,
  createBounty,
  updateBountyStatus,
  deleteBounty,
} = require('../controllers/bountyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(getBounties).post(protect, createBounty);
router.route('/:id/status').put(protect, updateBountyStatus);
router.route('/:id').delete(protect, deleteBounty);

module.exports = router;
