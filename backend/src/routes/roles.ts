import express from 'express';
import { protect, authorize } from '../middleware/auth';
import roleService from '../services/roleService';
import { asyncHandler } from '../middleware/appError';
import { sendSuccess, sendError } from '../utils/response';

const router = express.Router();

// All role routes require admin authentication
router.use(protect, authorize('admin'));

// @route   GET /api/admin/roles
// @desc    Get all roles
// @access  Private/Admin
router.get(
  '/',
  asyncHandler(async (req: any, res: any) => {
    const roles = await roleService.getAllRoles();
    sendSuccess(res, 200, roles, 'Roles retrieved');
  })
);

// @route   GET /api/admin/roles/:roleId
// @desc    Get role by ID
// @access  Private/Admin
router.get(
  '/:roleId',
  asyncHandler(async (req: any, res: any) => {
    const role = await roleService.getRoleById(req.params.roleId);
    sendSuccess(res, 200, role, 'Role retrieved');
  })
);

// @route   POST /api/admin/roles
// @desc    Create new role
// @access  Private/Admin
router.post(
  '/',
  asyncHandler(async (req: any, res: any) => {
    const role = await roleService.createRole(req.body, req.user._id);
    sendSuccess(res, 201, role, 'Role created successfully');
  })
);

// @route   PUT /api/admin/roles/:roleId
// @desc    Update role
// @access  Private/Admin
router.put(
  '/:roleId',
  asyncHandler(async (req: any, res: any) => {
    const role = await roleService.updateRole(req.params.roleId, req.body);
    sendSuccess(res, 200, role, 'Role updated successfully');
  })
);

// @route   DELETE /api/admin/roles/:roleId
// @desc    Delete role
// @access  Private/Admin
router.delete(
  '/:roleId',
  asyncHandler(async (req: any, res: any) => {
    await roleService.deleteRole(req.params.roleId);
    sendSuccess(res, 200, {}, 'Role deleted successfully');
  })
);

// @route   POST /api/admin/roles/:roleId/permissions
// @desc    Add permission to role
// @access  Private/Admin
router.post(
  '/:roleId/permissions',
  asyncHandler(async (req: any, res: any) => {
    const role = await roleService.addPermissionToRole(req.params.roleId, req.body);
    sendSuccess(res, 201, role, 'Permission added successfully');
  })
);

// @route   DELETE /api/admin/roles/:roleId/permissions/:resource
// @desc    Remove permission from role
// @access  Private/Admin
router.delete(
  '/:roleId/permissions/:resource',
  asyncHandler(async (req: any, res: any) => {
    const role = await roleService.removePermissionFromRole(req.params.roleId, req.params.resource);
    sendSuccess(res, 200, role, 'Permission removed successfully');
  })
);

// @route   GET /api/admin/roles/resources/all
// @desc    Get all available resources
// @access  Private/Admin
router.get(
  '/resources/all',
  asyncHandler(async (req: any, res: any) => {
    const resources = roleService.getAllResources();
    sendSuccess(res, 200, resources, 'Resources retrieved');
  })
);

// @route   GET /api/admin/roles/resources/:resource
// @desc    Get available permissions for a resource
// @access  Private/Admin
router.get(
  '/resources/:resource',
  asyncHandler(async (req: any, res: any) => {
    const permissions = roleService.getAvailablePermissions(req.params.resource);
    sendSuccess(res, 200, permissions, 'Permissions retrieved');
  })
);

// @route   PUT /api/admin/roles/assign/:userId
// @desc    Assign role to user
// @access  Private/Admin
router.put(
  '/assign/:userId',
  asyncHandler(async (req: any, res: any) => {
    const { roleId } = req.body;
    const user = await roleService.assignRoleToUser(req.params.userId, roleId);
    sendSuccess(res, 200, user, 'Role assigned successfully');
  })
);

// @route   GET /api/admin/roles/:userId/permissions
// @desc    Get user permissions
// @access  Private/Admin
router.get(
  '/:userId/permissions',
  asyncHandler(async (req: any, res: any) => {
    const permissions = await roleService.getUserPermissions(req.params.userId);
    sendSuccess(res, 200, permissions, 'Permissions retrieved');
  })
);

export default router;
