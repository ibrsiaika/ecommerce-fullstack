import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission {
  resource: string; // e.g., 'orders', 'products', 'users', 'sellers'
  actions: string[]; // e.g., ['view', 'create', 'edit', 'delete']
}

export interface IRole extends Document {
  name: string;
  description: string;
  permissions: IPermission[];
  isDefault: boolean;
  isSystem: boolean; // System roles like 'admin', 'seller' cannot be deleted
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>({
  resource: {
    type: String,
    required: true,
    enum: ['orders', 'products', 'users', 'sellers', 'payments', 'reports', 'settings', 'dashboard']
  },
  actions: {
    type: [String],
    enum: ['view', 'create', 'edit', 'delete', 'manage'],
    required: true
  }
});

const roleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Role name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  permissions: {
    type: [permissionSchema],
    required: true,
    default: []
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isSystem: {
    type: Boolean,
    default: false // Prevents deletion of system roles
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
roleSchema.index({ name: 1 });
roleSchema.index({ createdAt: -1 });

export default mongoose.model<IRole>('Role', roleSchema);
