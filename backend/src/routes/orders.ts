import express from 'express';
import {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
  updateOrderStatus,
  orderValidation
} from '../controllers/orderController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, orderValidation, createOrder);

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
// @access  Private
router.get('/myorders', protect, getMyOrders);

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), getOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, getOrderById);

// @route   PUT /api/orders/:id/pay
// @desc    Update order to paid
// @access  Private
router.put('/:id/pay', protect, updateOrderToPaid);

// @route   PUT /api/orders/:id/deliver
// @desc    Update order to delivered (Admin only)
// @access  Private/Admin
router.put('/:id/deliver', protect, authorize('admin'), updateOrderToDelivered);

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

export default router;