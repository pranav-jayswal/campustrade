const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create a new order (checkout)
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress } = req.body;

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  if (!shippingAddress || !shippingAddress.address) {
    res.status(400);
    throw new Error('Please provide a campus meeting/trading address');
  }

  const completeShipping = {
    address: shippingAddress.address.trim(),
    city: shippingAddress.city || 'At IAR Campus',
    meetupTime: shippingAddress.meetupTime || shippingAddress.postalCode || '',
    postalCode: shippingAddress.postalCode || shippingAddress.meetupTime || 'IAR-CAMPUS',
    country: shippingAddress.country || 'India',
  };

  // 1. Fetch and verify each product from database, check stock, compute authoritative total
  const verifiedItems = [];
  let calculatedTotal = 0;

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.name || item.product}`);
    }

    const qty = parseInt(item.quantity, 10);
    if (isNaN(qty) || qty < 1) {
      res.status(400);
      throw new Error(`Invalid quantity for ${product.title}`);
    }

    if (product.stock < qty) {
      res.status(400);
      throw new Error(
        `Insufficient stock for "${product.title}". Only ${product.stock} available.`
      );
    }

    const isRental = product.listingType === 'rent';
    const isGiveaway = product.isFreeGiveaway || product.listingType === 'giveaway' || product.price === 0;
    const itemDeposit = isRental ? (product.rentDeposit || 0) : 0;
    const durationDays = Number(item.rentDurationDays || product.rentDurationDays) || 1;

    calculatedTotal += (isGiveaway ? 0 : product.price) * qty;

    verifiedItems.push({
      product: product._id,
      name: product.title,
      quantity: qty,
      price: isGiveaway ? 0 : product.price, // Server-verified price from DB, immune to client tampering
      image: product.imageUrl,
      listingType: isRental ? 'rent' : (isGiveaway ? 'giveaway' : 'buy'),
      rentDeposit: itemDeposit,
      depositStatus: isRental ? 'held' : 'na',
      rentDurationDays: durationDays,
      rentDueDate: isRental ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) : null,
    });
  }

  // Calculate total refundable deposit across all rental items
  const totalDeposit = verifiedItems.reduce(
    (sum, it) => sum + (it.listingType === 'rent' ? (it.rentDeposit * it.quantity) : 0),
    0
  );

  // 2. Decrement stock atomically with concurrency safety
  for (const item of verifiedItems) {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );

    if (!updatedProduct) {
      res.status(400);
      throw new Error(
        `Item "${item.name}" went out of stock during checkout. Please adjust your cart.`
      );
    }
  }

  const finalTotal = Math.round(calculatedTotal * 100) / 100;

  const handoverOtp = Math.floor(1000 + Math.random() * 9000).toString();

  const order = await Order.create({
    user: req.user._id,
    orderItems: verifiedItems,
    totalAmount: finalTotal,
    totalDeposit,
    depositStatus: totalDeposit > 0 ? 'held' : 'na',
    shippingAddress: completeShipping,
    handoverOtp,
  });

  res.status(201).json(order);
});

// @desc    Mark a campus trade order as completed / successful (item received & paid)
// @route   PUT /api/orders/:id/complete
// @access  Private (Buyer or Admin)
const completeOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Allow buyer or admin
  const isBuyer = order.user.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to complete this order');
  }

  if (order.orderStatus === 'delivered') {
    return res.json(order);
  }

  if (order.orderStatus === 'cancelled') {
    res.status(400);
    throw new Error('Cannot complete a cancelled order');
  }

  // If OTP is submitted in body, verify it
  if (req.body.otp && req.body.otp.toString().trim() !== order.handoverOtp) {
    res.status(400);
    throw new Error('Invalid Handover OTP code');
  }

  order.orderStatus = 'delivered';
  order.paymentStatus = 'paid';
  order.completedAt = new Date();

  const updated = await order.save();
  res.json(updated);
});

// @desc    Mark a campus trade order as unsuccessful / cancelled
// @route   PUT /api/orders/:id/cancel
// @access  Private (Buyer or Admin)
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isBuyer = order.user.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  if (order.orderStatus === 'delivered') {
    res.status(400);
    throw new Error('Cannot cancel a completed trade order');
  }

  if (order.orderStatus === 'cancelled') {
    return res.json(order);
  }

  order.orderStatus = 'cancelled';
  order.paymentStatus = 'failed';
  order.cancellationReason = req.body.reason || 'Trade could not be completed on campus';
  order.cancelledAt = new Date();

  // Restore product stock back to active inventory
  for (const item of order.orderItems) {
    if (item.product) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
  }

  const updated = await order.save();
  res.json(updated);
});

// @desc    Get the logged-in user's own orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
      return res.json(orders);
    } catch (e) {}
  }
  res.json([]);
});

// @desc    Get every order in the store
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Allow access if admin or if the order belongs to the requesting user
  if (req.user.role !== 'admin' && !order.user._id.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json(order);
});

// @desc    Update an order's status and/or payment status
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const { orderStatus, paymentStatus } = req.body;

  if (orderStatus !== undefined) order.orderStatus = orderStatus;
  if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;

  const updated = await order.save();
  res.json(updated);
});

// @desc    Refund security deposit for a returned rental item
// @route   PUT /api/orders/:id/refund-deposit
// @access  Private
const refundRentalDeposit = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Allow buyer or admin
  const isBuyer = order.user.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to update deposit status');
  }

  order.depositStatus = 'refunded';
  order.orderItems.forEach((item) => {
    if (item.listingType === 'rent') {
      item.depositStatus = 'refunded';
    }
  });

  const updated = await order.save();
  res.json(updated);
});

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  completeOrder,
  cancelOrder,
  refundRentalDeposit,
};
