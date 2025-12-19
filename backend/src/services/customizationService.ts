import AdminPreferences, { IAdminPreferences, IWidgetConfig, IReportConfig } from '../models/AdminPreferences';
import SavedFilter from '../models/SavedFilter';
import Role from '../models/Role';
import User from '../models/User';
import { AppError } from '../middleware/appError';

export class AdminPreferencesService {
  // Get or create admin preferences
  async getOrCreatePreferences(adminId: string): Promise<IAdminPreferences> {
    let preferences = await AdminPreferences.findOne({ admin: adminId });
    
    if (!preferences) {
      preferences = await AdminPreferences.create({
        admin: adminId,
        dashboardWidgets: this.getDefaultWidgets(),
        notificationPreferences: this.getDefaultNotifications()
      });
    }
    
    return preferences;
  }

  // Get default widgets configuration
  getDefaultWidgets(): IWidgetConfig[] {
    return [
      { id: 'revenue', name: 'Total Revenue', enabled: true, position: 1, size: 'medium' },
      { id: 'orders', name: 'Total Orders', enabled: true, position: 2, size: 'medium' },
      { id: 'products', name: 'Total Products', enabled: true, position: 3, size: 'medium' },
      { id: 'users', name: 'Total Users', enabled: true, position: 4, size: 'medium' },
      { id: 'revenue-trends', name: 'Revenue Trends', enabled: true, position: 5, size: 'large' },
      { id: 'top-products', name: 'Top Products', enabled: true, position: 6, size: 'large' },
      { id: 'order-status', name: 'Order Status', enabled: true, position: 7, size: 'medium' },
      { id: 'user-growth', name: 'User Growth', enabled: true, position: 8, size: 'large' },
      { id: 'category-performance', name: 'Category Performance', enabled: false, position: 9, size: 'medium' },
      { id: 'top-sellers', name: 'Top Sellers', enabled: false, position: 10, size: 'large' }
    ];
  }

  // Get default notification preferences
  getDefaultNotifications() {
    return [
      { eventType: 'newOrder', emailEnabled: true, inAppEnabled: true, pushEnabled: false },
      { eventType: 'paymentFailed', emailEnabled: true, inAppEnabled: true, pushEnabled: true },
      { eventType: 'lowStock', emailEnabled: true, inAppEnabled: true, pushEnabled: false },
      { eventType: 'sellerVerification', emailEnabled: true, inAppEnabled: true, pushEnabled: false },
      { eventType: 'review', emailEnabled: false, inAppEnabled: true, pushEnabled: false },
      { eventType: 'orderShipped', emailEnabled: false, inAppEnabled: true, pushEnabled: false },
      { eventType: 'refundProcessed', emailEnabled: true, inAppEnabled: true, pushEnabled: false }
    ];
  }

  // Update dashboard widgets
  async updateDashboardWidgets(adminId: string, widgets: IWidgetConfig[]): Promise<IAdminPreferences> {
    const preferences = await AdminPreferences.findOneAndUpdate(
      { admin: adminId },
      { dashboardWidgets: widgets },
      { new: true, runValidators: true }
    );

    if (!preferences) {
      throw new AppError('Admin preferences not found', 404);
    }

    return preferences;
  }

  // Toggle a specific widget
  async toggleWidget(adminId: string, widgetId: string): Promise<IAdminPreferences> {
    const preferences = await AdminPreferences.findOne({ admin: adminId });
    
    if (!preferences) {
      throw new AppError('Admin preferences not found', 404);
    }

    const widget = preferences.dashboardWidgets.find(w => w.id === widgetId);
    if (widget) {
      widget.enabled = !widget.enabled;
    }

    await preferences.save();
    return preferences;
  }

  // Rearrange widgets
  async rearrangeWidgets(adminId: string, widgets: IWidgetConfig[]): Promise<IAdminPreferences> {
    const preferences = await AdminPreferences.findOneAndUpdate(
      { admin: adminId },
      { dashboardWidgets: widgets.map((w, idx) => ({ ...w, position: idx + 1 })) },
      { new: true, runValidators: true }
    );

    if (!preferences) {
      throw new AppError('Admin preferences not found', 404);
    }

    return preferences;
  }

  // Save custom report
  async saveReport(adminId: string, report: IReportConfig): Promise<IAdminPreferences> {
    const preferences = await AdminPreferences.findOne({ admin: adminId });
    
    if (!preferences) {
      throw new AppError('Admin preferences not found', 404);
    }

    // Remove existing report with same name
    preferences.savedReports = preferences.savedReports.filter(r => r.name !== report.name);
    preferences.savedReports.push(report);

    await preferences.save();
    return preferences;
  }

  // Delete saved report
  async deleteReport(adminId: string, reportName: string): Promise<IAdminPreferences> {
    const preferences = await AdminPreferences.findOneAndUpdate(
      { admin: adminId },
      { $pull: { savedReports: { name: reportName } } },
      { new: true }
    );

    if (!preferences) {
      throw new AppError('Admin preferences not found', 404);
    }

    return preferences;
  }

  // Update notification preferences
  async updateNotificationPreferences(adminId: string, preferences: any): Promise<IAdminPreferences> {
    const adminPrefs = await AdminPreferences.findOneAndUpdate(
      { admin: adminId },
      { notificationPreferences: preferences },
      { new: true, runValidators: true }
    );

    if (!adminPrefs) {
      throw new AppError('Admin preferences not found', 404);
    }

    return adminPrefs;
  }

  // Update refresh interval
  async updateRefreshInterval(adminId: string, interval: number): Promise<IAdminPreferences> {
    if (interval < 5000 || interval > 300000) {
      throw new AppError('Refresh interval must be between 5 and 300 seconds', 400);
    }

    const preferences = await AdminPreferences.findOneAndUpdate(
      { admin: adminId },
      { autoRefreshInterval: interval },
      { new: true, runValidators: true }
    );

    if (!preferences) {
      throw new AppError('Admin preferences not found', 404);
    }

    return preferences;
  }

  // Update general settings
  async updateSettings(adminId: string, settings: Partial<IAdminPreferences>): Promise<IAdminPreferences> {
    const preferences = await AdminPreferences.findOneAndUpdate(
      { admin: adminId },
      settings,
      { new: true, runValidators: true }
    );

    if (!preferences) {
      throw new AppError('Admin preferences not found', 404);
    }

    return preferences;
  }

  // Save custom filter/view
  async saveFilter(adminId: string, filterData: any): Promise<any> {
    return await SavedFilter.create({
      admin: adminId,
      ...filterData
    });
  }

  // Get saved filters
  async getSavedFilters(adminId: string, type: string): Promise<any[]> {
    return await SavedFilter.find({ admin: adminId, type });
  }

  // Delete saved filter
  async deleteFilter(adminId: string, filterId: string): Promise<void> {
    const result = await SavedFilter.deleteOne({ _id: filterId, admin: adminId });
    
    if (result.deletedCount === 0) {
      throw new AppError('Saved filter not found', 404);
    }
  }

  // Update filter
  async updateFilter(adminId: string, filterId: string, filterData: any): Promise<any> {
    return await SavedFilter.findOneAndUpdate(
      { _id: filterId, admin: adminId },
      filterData,
      { new: true, runValidators: true }
    );
  }

  // Set default filter
  async setDefaultFilter(adminId: string, filterId: string): Promise<any> {
    // Remove default from all filters
    await SavedFilter.updateMany(
      { admin: adminId },
      { isDefault: false }
    );

    // Set new default
    return await SavedFilter.findOneAndUpdate(
      { _id: filterId, admin: adminId },
      { isDefault: true },
      { new: true }
    );
  }
}

export default new AdminPreferencesService();
