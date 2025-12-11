import mongoose, { Document, Schema } from 'mongoose';

interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface IShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface IPaymentResult {
  id?: string;
  status?: string;
  update_time?: string;
  email_address?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  paymentResult: IPaymentResult;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  }
});

const shippingAddressSchema = new Schema<IShippingAddress>({
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  }
});

const paymentResultSchema = new Schema<IPaymentResult>({
  id: String,
  status: String,
  update_time: String,
  email_address: String
});

const orderSchema = new Schema<IOrder>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['PayPal', 'Stripe', 'Credit Card', 'Cash on Delivery']
  },
  paymentResult: paymentResultSchema,
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0,
    min: 0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ isPaid: 1 });
orderSchema.index({ isDelivered: 1 });

// Virtual for order number (formatted ID)
orderSchema.virtual('orderNumber').get(function() {
  return `ORD-${(this._id as mongoose.Types.ObjectId).toString().slice(-8).toUpperCase()}`;
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', {
  virtuals: true
});

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;