import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getFeaturedProducts,
  addProductReview,
  productValidation,
  reviewValidation
} from '../controllers/productController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);

// Protected routes
router.post('/:id/reviews', protect, reviewValidation, addProductReview);

// Admin only routes
router.post('/', protect, authorize('admin'), productValidation, createProduct);
router.put('/:id', protect, authorize('admin'), productValidation, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;