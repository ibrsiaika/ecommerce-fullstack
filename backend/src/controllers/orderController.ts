import { Request, Response } from 'express';
import { validationResult, body } from 'express-validator';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import emailService from '../services/emailService';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No order items'
      });
      return;
    }

    // Verify product details and stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404).json({
          success: false,
          error: `Product not found: ${item.product}`
        });
        return;
      }

      if (product.countInStock < item.quantity) {
        res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.countInStock}, Requested: ${item.quantity}`
        });
        return;
      }
    }

    const order = new Order({
      user: (req as any).user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    const createdOrder = await order.save();

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { countInStock: -item.quantity } }
      );
    }

    // Send order confirmation email
    try {
      const user = await User.findById((req as any).user.id);
      if (user?.email) {
        await emailService.sendOrderConfirmation(
          user.email,
          user.name,
          (createdOrder as any).orderNumber,
          createdOrder.totalPrice
        );
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      data: createdOrder
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name');

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
      return;
    }

    // Check if user is authorized to view this order (own order or admin)
    const user = (req as any).user;
    if (order.user._id.toString() !== user.id && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Not authorized to view this order'
      });
      return;
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
      return;
    }

    // Check if user is authorized to update this order
    const user = (req as any).user;
    if (order.user.toString() !== user.id && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Not authorized to update this order'
      });
      return;
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer?.email_address
    };
    order.orderStatus = 'processing';

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: (req as any).user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments({ user: (req as any).user.id });

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments({});

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update order to delivered (Admin only)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
      return;
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.orderStatus = 'delivered';

    if (req.body.trackingNumber) {
      order.trackingNumber = req.body.trackingNumber;
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status, trackingNumber, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
      return;
    }

    if (status) order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.notes = notes;

    // Auto-update delivery status based on order status
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();

    // Send status update email notification
    try {
      const populatedOrder = await Order.findById(updatedOrder._id).populate('user', 'name email');
      if (populatedOrder && (populatedOrder.user as any).email && status) {
        await emailService.sendOrderStatusUpdate(
          (populatedOrder.user as any).email,
          (populatedOrder.user as any).name,
          (populatedOrder as any).orderNumber,
          status,
          trackingNumber
        );
      }
    } catch (emailError) {
      console.error('Failed to send order status update email:', emailError);
      // Don't fail the order update if email fails
    }

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Validation rules for order creation
export const orderValidation = [
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('Order items are required'),
  
  body('orderItems.*.product')
    .notEmpty()
    .withMessage('Product ID is required'),
  
  body('orderItems.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('orderItems.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('shippingAddress.address')
    .notEmpty()
    .withMessage('Address is required'),
  
  body('shippingAddress.city')
    .notEmpty()
    .withMessage('City is required'),
  
  body('shippingAddress.postalCode')
    .notEmpty()
    .withMessage('Postal code is required'),
  
  body('shippingAddress.country')
    .notEmpty()
    .withMessage('Country is required'),
  
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required'),
  
  body('totalPrice')
    .isFloat({ min: 0 })
    .withMessage('Total price must be a positive number')
];