const express = require('express');
const {
  getProducts,
  getCategories,
  getMyListings,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  likeProductReview,
  getEcoStats,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/categories', getCategories);
router.get('/eco-stats', getEcoStats);
router.get('/my', protect, getMyListings);
router.route('/').get(getProducts).post(protect, createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

// Reviews & feedback
router.post('/:id/reviews', createProductReview);
router.post('/:id/reviews/:reviewId/helpful', likeProductReview);

module.exports = router;
