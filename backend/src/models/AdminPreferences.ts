import mongoose, { Document, Schema } from 'mongoose';

export interface IWidgetConfig {
  id: string;
  name: string;
  enabled: boolean;
  position: number;
  size?: 'small' | 'medium' | 'large';
}

export interface IReportConfig {
  id: string;
  name: string;
  metrics: string[];
  dateRange: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate?: Date;
  endDate?: Date;
  filters: Record<string, any>;
}

export interface INotificationPreference {
  eventType: string; // e.g., 'newOrder', 'paymentFailed', 'lowStock'
  emailEnabled: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
}

export interface IAdminPreferences extends Document {
  admin: mongoose.Types.ObjectId;
  dashboardWidgets: IWidgetConfig[];
  savedReports: IReportConfig[];
  notificationPreferences: INotificationPreference[];
  autoRefreshInterval: number; // in milliseconds
  defaultView: 'overview' | 'products' | 'orders' | 'users' | 'sellers';
  theme: 'light' | 'dark';
  itemsPerPage: number;
  orderFilters: Record<string, any>;
  productFilters: Record<string, any>;
  sellerVerificationWorkflow: string[];
  createdAt: Date;
  updatedAt: Date;
}

const widgetConfigSchema = new Schema<IWidgetConfig>({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  position: {
    type: Number,
    required: true
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  }
});

const reportConfigSchema = new Schema<IReportConfig>({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: [100, 'Report name cannot exceed 100 characters']
  },
  metrics: {
    type: [String],
    required: true,
    default: []
  },
  dateRange: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    default: 'monthly'
  },
  startDate: Date,
  endDate: Date,
  filters: {
    type: Schema.Types.Mixed,
    default: {}
  }
});

const notificationPreferenceSchema = new Schema<INotificationPreference>({
  eventType: {
    type: String,
    required: true,
    enum: ['newOrder', 'paymentFailed', 'lowStock', 'sellerVerification', 'review', 'orderShipped', 'refundProcessed']
  },
  emailEnabled: {
    type: Boolean,
    default: true
  },
  inAppEnabled: {
    type: Boolean,
    default: true
  },
  pushEnabled: {
    type: Boolean,
    default: false
  }
});

const adminPreferencesSchema = new Schema<IAdminPreferences>({
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dashboardWidgets: {
    type: [widgetConfigSchema],
    default: []
  },
  savedReports: {
    type: [reportConfigSchema],
    default: []
  },
  notificationPreferences: {
    type: [notificationPreferenceSchema],
    default: []
  },
  autoRefreshInterval: {
    type: Number,
    default: 30000 // 30 seconds
  },
  defaultView: {
    type: String,
    enum: ['overview', 'products', 'orders', 'users', 'sellers'],
    default: 'overview'
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  itemsPerPage: {
    type: Number,
    default: 10,
    min: 5,
    max: 100
  },
  orderFilters: {
    type: Schema.Types.Mixed,
    default: {}
  },
  productFilters: {
    type: Schema.Types.Mixed,
    default: {}
  },
  sellerVerificationWorkflow: {
    type: [String],
    default: ['documents', 'identity', 'store_info', 'approval']
  }
}, {
  timestamps: true
});

// Index for faster queries
adminPreferencesSchema.index({ admin: 1 });
adminPreferencesSchema.index({ updatedAt: -1 });

export default mongoose.model<IAdminPreferences>('AdminPreferences', adminPreferencesSchema);
