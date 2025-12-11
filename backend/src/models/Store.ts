import mongoose, { Document, Schema } from 'mongoose';

export interface IStore extends Document {
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner: string;
  owner: mongoose.Types.ObjectId;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  rating: number;
  totalReviews: number;
  followers: mongoose.Types.ObjectId[];
  isVerified: boolean;
  isActive: boolean;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
  commissionRate: number; // percentage
  totalEarnings: number;
  totalOrders: number;
  totalProducts: number;
  metadata: {
    views: number;
    lastUpdated: Date;
    joinedDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const storeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      maxlength: [100, 'Store name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    logo: String,
    banner: String,
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: {
      type: String,
      required: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      routingNumber: String,
      bankName: String
    },
    commissionRate: {
      type: Number,
      default: 10 // 10% commission
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    totalProducts: {
      type: Number,
      default: 0
    },
    metadata: {
      views: { type: Number, default: 0 },
      lastUpdated: Date,
      joinedDate: { type: Date, default: Date.now }
    }
  },
  { timestamps: true }
);

// Indexes for better performance
storeSchema.index({ owner: 1 });
storeSchema.index({ slug: 1 });
storeSchema.index({ isVerified: 1, isActive: 1 });
storeSchema.index({ rating: -1 });
storeSchema.index({ createdAt: -1 });

export default mongoose.model<IStore>('Store', storeSchema);
