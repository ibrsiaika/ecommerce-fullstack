import Order, { IOrder } from '../models/Order';
import Product from '../models/Product';
import { AppError } from '../middleware/appError';
import emailService from './emailService';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

export class OrderService {
  async create(userId: string, data: Partial<IOrder>) {
    // Validate order items
    let totalPrice = 0;

    for (const item of data.orderItems || []) {
      const product = await Product.findById(item.product);

      if (!product) {
        throw new AppError(`Product ${item.product} not found`, 404);
      }

      if (product.countInStock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name}`,
          400
        );
      }

      totalPrice += item.price * item.quantity;

      // Update product stock
      product.countInStock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: userId,
      ...data,
      totalPrice
    });

    // Populate user info
    await order.populate('user', 'name email');

    return order;
  }

  async getById(orderId: string, userId?: string) {
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price image');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check if user owns order
    if (userId && order.user._id.toString() !== userId) {
      throw new AppError('Not authorized to access this order', 403);
    }

    return order;
  }

  async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .populate('orderItems.product', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ user: userId })
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getAllOrders(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find()
        .populate('user', 'name email')
        .populate('orderItems.product', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments()
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateStatus(
    orderId: string,
    status: IOrder['orderStatus']
  ) {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true, runValidators: true }
    );

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  async processPayment(orderId: string, stripeToken: string) {
    const order = await Order.findById(orderId).populate('user');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    try {
      const charge = await stripe.charges.create({
        amount: Math.round(order.totalPrice * 100),
        currency: 'usd',
        source: stripeToken,
        description: `Order ${orderId}`
      });

      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: charge.id,
        status: charge.status,
        update_time: new Date().toISOString(),
        email_address: (order.user as any).email
      };

      await order.save();

      // Send payment confirmation email
      try {
        await emailService.sendOrderConfirmation((order.user as any).email, order);
      } catch (error) {
        console.error('Failed to send confirmation email:', error);
      }

      return order;
    } catch (error: any) {
      throw new AppError(`Payment failed: ${error.message}`, 400);
    }
  }

  async getOrderStats() {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const ordersPerMonth = await Order.aggregate([
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersPerMonth
    };
  }

  async cancelOrder(orderId: string) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.isPaid) {
      throw new AppError('Cannot cancel a paid order', 400);
    }

    // Restore product stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock += item.quantity;
        await product.save();
      }
    }

    order.orderStatus = 'cancelled';
    await order.save();

    return order;
  }
}

export default new OrderService();
