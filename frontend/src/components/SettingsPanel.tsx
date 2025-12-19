import React, { useState, useEffect } from 'react';
import { useCustomization } from '../context/CustomizationContext';
import type { INotificationPref } from '../context/CustomizationContext';
import { FiBell, FiMail, FiSmartphone, FiClock, FiSave, FiX } from 'react-icons/fi';

const SettingsPanel: React.FC = () => {
  const {
    notificationPreferences,
    autoRefreshInterval,
    defaultView,
    theme,
    itemsPerPage,
    updateNotifications,
    updateRefreshInterval,
    updateSettings,
    loading,
    error,
    clearError
  } = useCustomization();

  const [localNotifications, setLocalNotifications] = useState<INotificationPref[]>(notificationPreferences);
  const [localRefreshInterval, setLocalRefreshInterval] = useState(autoRefreshInterval);
  const [localDefaultView, setLocalDefaultView] = useState(defaultView);
  const [localTheme, setLocalTheme] = useState(theme);
  const [localItemsPerPage, setLocalItemsPerPage] = useState(itemsPerPage);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLocalNotifications(notificationPreferences);
  }, [notificationPreferences]);

  const handleNotificationToggle = (eventType: string, channel: 'email' | 'inApp' | 'push') => {
    setLocalNotifications(prev =>
      prev.map(pref =>
        pref.eventType === eventType
          ? {
              ...pref,
              [channel === 'email' ? 'emailEnabled' : channel === 'inApp' ? 'inAppEnabled' : 'pushEnabled']:
                !pref[channel === 'email' ? 'emailEnabled' : channel === 'inApp' ? 'inAppEnabled' : 'pushEnabled']
            }
          : pref
      )
    );
  };

  const handleSaveNotifications = async () => {
    await updateNotifications(localNotifications);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveRefreshInterval = async () => {
    await updateRefreshInterval(localRefreshInterval);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveGeneralSettings = async () => {
    await updateSettings({
      defaultView: localDefaultView as any,
      theme: localTheme as any,
      itemsPerPage: localItemsPerPage
    } as any);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const eventTypeLabels: Record<string, string> = {
    newOrder: 'New Order',
    paymentFailed: 'Payment Failed',
    lowStock: 'Low Stock Alert',
    sellerVerification: 'Seller Verification',
    review: 'New Review',
    orderShipped: 'Order Shipped',
    refundProcessed: 'Refund Processed'
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-red-700">{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
            <FiX size={18} />
          </button>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-sm text-green-700">✓ Settings saved successfully</span>
        </div>
      )}

      {/* Notification Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <FiBell size={24} className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          {localNotifications.map(pref => (
            <div key={pref.eventType} className="border-b border-gray-100 pb-4 last:border-b-0">
              <h3 className="font-semibold text-gray-800 mb-3">{eventTypeLabels[pref.eventType]}</h3>
              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pref.emailEnabled}
                    onChange={() => handleNotificationToggle(pref.eventType, 'email')}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <FiMail size={16} className="text-gray-600" />
                    <span className="text-sm text-gray-700">Email</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pref.inAppEnabled}
                    onChange={() => handleNotificationToggle(pref.eventType, 'inApp')}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <FiBell size={16} className="text-gray-600" />
                    <span className="text-sm text-gray-700">In-App</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pref.pushEnabled}
                    onChange={() => handleNotificationToggle(pref.eventType, 'push')}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <FiSmartphone size={16} className="text-gray-600" />
                    <span className="text-sm text-gray-700">Push</span>
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSaveNotifications}
          disabled={loading}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <FiSave size={18} />
          Save Notification Settings
        </button>
      </div>

      {/* Auto-Refresh Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <FiClock size={24} className="text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Data Refresh Interval</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto-Refresh Interval (milliseconds)
            </label>
            <input
              type="range"
              min="5000"
              max="300000"
              step="5000"
              value={localRefreshInterval}
              onChange={(e) => setLocalRefreshInterval(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>5s</span>
              <span className="font-semibold">{(localRefreshInterval / 1000).toFixed(0)}s</span>
              <span>300s</span>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            This controls how often the dashboard data is automatically refreshed.
          </p>
        </div>

        <button
          onClick={handleSaveRefreshInterval}
          disabled={loading}
          className="mt-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <FiSave size={18} />
          Save Refresh Interval
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">General Settings</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Dashboard View
            </label>
            <select
              value={localDefaultView}
              onChange={(e) => setLocalDefaultView(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="overview">Overview</option>
              <option value="products">Products</option>
              <option value="orders">Orders</option>
              <option value="users">Users</option>
              <option value="sellers">Sellers</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="light"
                  checked={localTheme === 'light'}
                  onChange={(e) => setLocalTheme(e.target.value as any)}
                  className="w-5 h-5"
                />
                <span className="text-sm text-gray-700">Light</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="dark"
                  checked={localTheme === 'dark'}
                  onChange={(e) => setLocalTheme(e.target.value as any)}
                  className="w-5 h-5"
                />
                <span className="text-sm text-gray-700">Dark</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items Per Page
            </label>
            <input
              type="number"
              min="5"
              max="100"
              value={localItemsPerPage}
              onChange={(e) => setLocalItemsPerPage(Math.max(5, Math.min(100, parseInt(e.target.value))))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-600 mt-2">Between 5 and 100 items</p>
          </div>
        </div>

        <button
          onClick={handleSaveGeneralSettings}
          disabled={loading}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <FiSave size={18} />
          Save General Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
