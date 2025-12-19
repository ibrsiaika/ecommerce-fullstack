import express from 'express';
import { protect, authorize } from '../middleware/auth';
import customizationService from '../services/customizationService';
import { asyncHandler } from '../middleware/appError';
import { sendSuccess, sendError } from '../utils/response';

const router = express.Router();

// All customization routes require admin authentication
router.use(protect, authorize('admin'));

// @route   GET /api/admin/preferences
// @desc    Get admin preferences
// @access  Private/Admin
router.get(
  '/preferences',
  asyncHandler(async (req: any, res: any) => {
    const preferences = await customizationService.getOrCreatePreferences(req.user._id);
    sendSuccess(res, 200, preferences, 'Preferences retrieved');
  })
);

// @route   PUT /api/admin/preferences/widgets
// @desc    Update dashboard widgets
// @access  Private/Admin
router.put(
  '/preferences/widgets',
  asyncHandler(async (req: any, res: any) => {
    const { widgets } = req.body;
    const preferences = await customizationService.updateDashboardWidgets(req.user._id, widgets);
    sendSuccess(res, 200, preferences, 'Widgets updated successfully');
  })
);

// @route   PUT /api/admin/preferences/widgets/:widgetId/toggle
// @desc    Toggle a specific widget
// @access  Private/Admin
router.put(
  '/preferences/widgets/:widgetId/toggle',
  asyncHandler(async (req: any, res: any) => {
    const preferences = await customizationService.toggleWidget(req.user._id, req.params.widgetId);
    sendSuccess(res, 200, preferences, 'Widget toggled successfully');
  })
);

// @route   PUT /api/admin/preferences/widgets/rearrange
// @desc    Rearrange widgets
// @access  Private/Admin
router.put(
  '/preferences/widgets/rearrange',
  asyncHandler(async (req: any, res: any) => {
    const { widgets } = req.body;
    const preferences = await customizationService.rearrangeWidgets(req.user._id, widgets);
    sendSuccess(res, 200, preferences, 'Widgets rearranged successfully');
  })
);

// @route   POST /api/admin/preferences/reports
// @desc    Save custom report
// @access  Private/Admin
router.post(
  '/preferences/reports',
  asyncHandler(async (req: any, res: any) => {
    const { name, metrics, dateRange, startDate, endDate, filters } = req.body;
    const preferences = await customizationService.saveReport(req.user._id, {
      id: Date.now().toString(),
      name,
      metrics,
      dateRange,
      startDate,
      endDate,
      filters
    });
    sendSuccess(res, 201, preferences, 'Report saved successfully');
  })
);

// @route   DELETE /api/admin/preferences/reports/:reportName
// @desc    Delete saved report
// @access  Private/Admin
router.delete(
  '/preferences/reports/:reportName',
  asyncHandler(async (req: any, res: any) => {
    const preferences = await customizationService.deleteReport(req.user._id, req.params.reportName);
    sendSuccess(res, 200, preferences, 'Report deleted successfully');
  })
);

// @route   PUT /api/admin/preferences/notifications
// @desc    Update notification preferences
// @access  Private/Admin
router.put(
  '/preferences/notifications',
  asyncHandler(async (req: any, res: any) => {
    const preferences = await customizationService.updateNotificationPreferences(req.user._id, req.body);
    sendSuccess(res, 200, preferences, 'Notification preferences updated');
  })
);

// @route   PUT /api/admin/preferences/refresh-interval
// @desc    Update auto-refresh interval
// @access  Private/Admin
router.put(
  '/preferences/refresh-interval',
  asyncHandler(async (req: any, res: any) => {
    const { interval } = req.body;
    const preferences = await customizationService.updateRefreshInterval(req.user._id, interval);
    sendSuccess(res, 200, preferences, 'Refresh interval updated');
  })
);

// @route   PUT /api/admin/preferences/settings
// @desc    Update general settings
// @access  Private/Admin
router.put(
  '/preferences/settings',
  asyncHandler(async (req: any, res: any) => {
    const preferences = await customizationService.updateSettings(req.user._id, req.body);
    sendSuccess(res, 200, preferences, 'Settings updated successfully');
  })
);

// @route   POST /api/admin/filters
// @desc    Save custom filter/view
// @access  Private/Admin
router.post(
  '/filters',
  asyncHandler(async (req: any, res: any) => {
    const filter = await customizationService.saveFilter(req.user._id, req.body);
    sendSuccess(res, 201, filter, 'Filter saved successfully');
  })
);

// @route   GET /api/admin/filters/:type
// @desc    Get saved filters for a type
// @access  Private/Admin
router.get(
  '/filters/:type',
  asyncHandler(async (req: any, res: any) => {
    const filters = await customizationService.getSavedFilters(req.user._id, req.params.type);
    sendSuccess(res, 200, filters, 'Filters retrieved');
  })
);

// @route   PUT /api/admin/filters/:filterId
// @desc    Update saved filter
// @access  Private/Admin
router.put(
  '/filters/:filterId',
  asyncHandler(async (req: any, res: any) => {
    const filter = await customizationService.updateFilter(req.user._id, req.params.filterId, req.body);
    sendSuccess(res, 200, filter, 'Filter updated successfully');
  })
);

// @route   DELETE /api/admin/filters/:filterId
// @desc    Delete saved filter
// @access  Private/Admin
router.delete(
  '/filters/:filterId',
  asyncHandler(async (req: any, res: any) => {
    await customizationService.deleteFilter(req.user._id, req.params.filterId);
    sendSuccess(res, 200, {}, 'Filter deleted successfully');
  })
);

// @route   PUT /api/admin/filters/:filterId/set-default
// @desc    Set filter as default
// @access  Private/Admin
router.put(
  '/filters/:filterId/set-default',
  asyncHandler(async (req: any, res: any) => {
    const filter = await customizationService.setDefaultFilter(req.user._id, req.params.filterId);
    sendSuccess(res, 200, filter, 'Default filter updated');
  })
);

export default router;
