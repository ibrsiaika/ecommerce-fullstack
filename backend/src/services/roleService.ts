import Role, { IRole, IPermission } from '../models/Role';
import User, { IUser } from '../models/User';
import { AppError } from '../middleware/appError';

export class RoleManagementService {
  // Get all roles
  async getAllRoles(): Promise<IRole[]> {
    return await Role.find().populate('createdBy', 'name email').sort({ createdAt: -1 });
  }

  // Get role by ID
  async getRoleById(roleId: string): Promise<IRole> {
    const role = await Role.findById(roleId).populate('createdBy', 'name email');
    
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    return role;
  }

  // Create new role
  async createRole(roleData: any, createdBy: string): Promise<IRole> {
    const { name, description, permissions } = roleData;

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      throw new AppError('Role with this name already exists', 409);
    }

    const role = await Role.create({
      name,
      description,
      permissions: permissions || [],
      isSystem: false,
      createdBy
    });

    return role.populate('createdBy', 'name email');
  }

  // Update role
  async updateRole(roleId: string, updateData: any): Promise<IRole> {
    const role = await Role.findById(roleId);
    
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    // Prevent modification of system roles
    if (role.isSystem) {
      throw new AppError('Cannot modify system roles', 403);
    }

    Object.assign(role, updateData);
    await role.save();

    return role.populate('createdBy', 'name email');
  }

  // Delete role
  async deleteRole(roleId: string): Promise<void> {
    const role = await Role.findById(roleId);
    
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    // Prevent deletion of system roles
    if (role.isSystem) {
      throw new AppError('Cannot delete system roles', 403);
    }

    // Check if role is assigned to any users
    const usersWithRole = await User.countDocuments({ role: role.name });
    if (usersWithRole > 0) {
      throw new AppError(`Cannot delete role. It is assigned to ${usersWithRole} user(s)`, 409);
    }

    await Role.findByIdAndDelete(roleId);
  }

  // Add permission to role
  async addPermissionToRole(roleId: string, permission: IPermission): Promise<IRole> {
    const role = await Role.findById(roleId);
    
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    // Check if permission already exists
    const exists = role.permissions.some(
      p => p.resource === permission.resource && 
           JSON.stringify(p.actions.sort()) === JSON.stringify(permission.actions.sort())
    );

    if (exists) {
      throw new AppError('This permission already exists for this role', 409);
    }

    role.permissions.push(permission);
    await role.save();

    return role;
  }

  // Remove permission from role
  async removePermissionFromRole(roleId: string, resource: string): Promise<IRole> {
    const role = await Role.findById(roleId);
    
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    role.permissions = role.permissions.filter(p => p.resource !== resource);
    await role.save();

    return role;
  }

  // Assign role to user
  async assignRoleToUser(userId: string, roleId: string): Promise<IUser> {
    const [user, role] = await Promise.all([
      User.findById(userId),
      Role.findById(roleId)
    ]);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!role) {
      throw new AppError('Role not found', 404);
    }

    // Store role reference in user
    (user as any).roleRef = roleId;
    await user.save();

    return user;
  }

  // Get user permissions
  async getUserPermissions(userId: string): Promise<IPermission[]> {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Find role by role name
    const role = await Role.findOne({ name: user.role });
    
    if (!role) {
      return [];
    }

    return role.permissions;
  }

  // Check if user has permission
  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const user = await User.findById(userId);
    
    if (!user) {
      return false;
    }

    const role = await Role.findOne({ name: user.role });
    
    if (!role) {
      return false;
    }

    return role.permissions.some(
      p => p.resource === resource && p.actions.includes(action)
    );
  }

  // Initialize system roles
  async initializeSystemRoles(): Promise<void> {
    const roles = await Role.countDocuments();
    
    if (roles > 0) {
      return; // Already initialized
    }

    // Create system roles
    const adminRole = await Role.create({
      name: 'admin',
      description: 'Full platform access',
      permissions: [
        { resource: 'orders', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
        { resource: 'products', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
        { resource: 'users', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
        { resource: 'sellers', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
        { resource: 'payments', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
        { resource: 'reports', actions: ['view', 'create', 'edit', 'delete'] },
        { resource: 'settings', actions: ['view', 'edit', 'manage'] },
        { resource: 'dashboard', actions: ['view', 'manage'] }
      ],
      isSystem: true,
      isDefault: true,
      createdBy: new (require('mongoose')).Types.ObjectId()
    });

    const sellerRole = await Role.create({
      name: 'seller',
      description: 'Seller store management',
      permissions: [
        { resource: 'orders', actions: ['view', 'edit'] },
        { resource: 'products', actions: ['view', 'create', 'edit', 'delete'] },
        { resource: 'reports', actions: ['view'] },
        { resource: 'dashboard', actions: ['view'] }
      ],
      isSystem: true,
      createdBy: new (require('mongoose')).Types.ObjectId()
    });

    const userRole = await Role.create({
      name: 'user',
      description: 'Regular customer',
      permissions: [
        { resource: 'orders', actions: ['view'] },
        { resource: 'products', actions: ['view'] }
      ],
      isSystem: true,
      createdBy: new (require('mongoose')).Types.ObjectId()
    });
  }

  // Get available permissions for a resource
  getAvailablePermissions(resource: string): string[] {
    const resourceActions: Record<string, string[]> = {
      'orders': ['view', 'create', 'edit', 'delete', 'manage'],
      'products': ['view', 'create', 'edit', 'delete', 'manage'],
      'users': ['view', 'create', 'edit', 'delete', 'manage'],
      'sellers': ['view', 'create', 'edit', 'delete', 'manage'],
      'payments': ['view', 'create', 'edit', 'delete', 'manage'],
      'reports': ['view', 'create', 'edit', 'delete'],
      'settings': ['view', 'edit', 'manage'],
      'dashboard': ['view', 'manage']
    };

    return resourceActions[resource] || [];
  }

  // Get all available resources
  getAllResources(): string[] {
    return ['orders', 'products', 'users', 'sellers', 'payments', 'reports', 'settings', 'dashboard'];
  }
}

export default new RoleManagementService();
