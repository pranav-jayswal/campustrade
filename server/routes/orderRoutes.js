const express = require('express');
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  completeOrder,
  cancelOrder,
  refundRentalDeposit,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/', protect, admin, getAllOrders);
router.put('/:id/complete', protect, completeOrder);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/refund-deposit', protect, refundRentalDeposit);
router
  .route('/:id')
  .get(protect, getOrderById)
  .put(protect, admin, updateOrderStatus);

module.exports = router;
