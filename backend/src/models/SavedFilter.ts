import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomView {
  name: string;
  type: 'orders' | 'products' | 'users' | 'sellers';
  filters: Record<string, any>;
  columns?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ISavedFilter extends Document {
  admin: mongoose.Types.ObjectId;
  name: string;
  type: 'orders' | 'products' | 'users' | 'sellers';
  filterConfig: Record<string, any>;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const customViewSchema = new Schema<ICustomView>({
  name: {
    type: String,
    required: true,
    maxlength: [100, 'View name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: true,
    enum: ['orders', 'products', 'users', 'sellers']
  },
  filters: {
    type: Schema.Types.Mixed,
    required: true
  },
  columns: [String],
  sortBy: String,
  sortOrder: {
    type: String,
    enum: ['asc', 'desc'],
    default: 'desc'
  }
});

const savedFilterSchema = new Schema<ISavedFilter>({
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: [100, 'Filter name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: true,
    enum: ['orders', 'products', 'users', 'sellers']
  },
  filterConfig: {
    type: Schema.Types.Mixed,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure unique filter names per admin
savedFilterSchema.index({ admin: 1, name: 1, type: 1 }, { unique: true });
savedFilterSchema.index({ admin: 1, type: 1 });

export default mongoose.model<ISavedFilter>('SavedFilter', savedFilterSchema);
