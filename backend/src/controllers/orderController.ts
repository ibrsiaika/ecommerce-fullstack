import { Request, Response } from 'express';
import { validationResult, body } from 'express-validator';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import emailService from '../services/emailService';
import Stripe from 'stripe';

// Initialize Stripe (will be null if not configured properly)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey && stripeSecretKey.startsWith('sk_')
  ? new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' })
  : null;

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
          user.getFullName(),
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

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
      return;
    }

    // Check if user is authorized to cancel this order
    const user = (req as any).user;
    if (order.user.toString() !== user.id && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this order'
      });
      return;
    }

    // Check if order can be cancelled (only pending or processing orders)
    const cancellableStatuses = ['pending', 'processing'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      res.status(400).json({
        success: false,
        error: `Cannot cancel order with status: ${order.orderStatus}. Only pending or processing orders can be cancelled.`
      });
      return;
    }

    // Update order status to cancelled
    order.orderStatus = 'cancelled';

    // Restore product stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { countInStock: item.quantity } }
      );
    }

    const cancelledOrder = await order.save();

    res.json({
      success: true,
      data: cancelledOrder
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

// @desc    Create Stripe checkout session for order
// @route   POST /api/orders/:id/create-checkout-session
// @access  Private
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      res.status(400).json({
        success: false,
        error: 'Payment processing not configured. Please set STRIPE_SECRET_KEY in environment.'
      });
      return;
    }

    const order = await Order.findById(req.params.id).populate('orderItems.product', 'name images');
    
    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
      return;
    }

    // Check if order belongs to user
    if (order.user.toString() !== (req as any).user.id) {
      res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
      return;
    }

    // Check if already paid
    if (order.isPaid) {
      res.status(400).json({
        success: false,
        error: 'Order is already paid'
      });
      return;
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Create line items for Stripe
    const lineItems = order.orderItems.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if applicable
    if (order.shippingPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            images: [],
          },
          unit_amount: Math.round(order.shippingPrice * 100),
        },
        quantity: 1,
      });
    }

    // Add tax as a line item if applicable
    if (order.taxPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax',
            images: [],
          },
          unit_amount: Math.round(order.taxPrice * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${clientUrl}/order/${(order._id as any).toString()}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/order/${(order._id as any).toString()}?payment=cancelled`,
      metadata: {
        orderId: (order._id as any).toString(),
        userId: (req as any).user.id,
      },
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Handle Stripe webhook for payment confirmation
// @route   POST /api/orders/webhook
// @access  Public (Stripe)
export const stripeWebhook = async (req: Request, res: Response) => {
  if (!stripe) {
    res.status(400).json({ error: 'Stripe not configured' });
    return;
  }

  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // For testing without webhook secret
      event = req.body;
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      try {
        const order = await Order.findById(orderId);
        if (order && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.paymentResult = {
            id: session.payment_intent,
            status: session.payment_status,
            update_time: new Date().toISOString(),
            email_address: session.customer_details?.email || ''
          };
          await order.save();
          console.log(`✅ Order ${orderId} marked as paid via Stripe webhook`);
        }
      } catch (error) {
        console.error('Error updating order:', error);
      }
    }
  }

  res.json({ received: true });
};

// @desc    Verify payment and mark order as paid (client-side verification)
// @route   POST /api/orders/:id/verify-payment
// @access  Private
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      res.status(400).json({
        success: false,
        error: 'Payment processing not configured'
      });
      return;
    }

    const { sessionId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
      return;
    }

    // Check if order belongs to user
    if (order.user.toString() !== (req as any).user.id) {
      res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
      return;
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' && session.metadata?.orderId === req.params.id) {
      if (!order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          id: session.payment_intent as string,
          status: session.payment_status,
          update_time: new Date().toISOString(),
          email_address: session.customer_details?.email || ''
        };
        await order.save();
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified',
        data: order
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment not completed'
      });
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};