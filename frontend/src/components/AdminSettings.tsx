import React from 'react';
import { useAppSelector } from '../store/hooks';
import { Navigate } from 'react-router-dom';
import { FiSettings, FiUsers, FiFileText, FiFilter } from 'react-icons/fi';
import SettingsPanel from './SettingsPanel';
import RoleManagement from './RoleManagement';
import ReportBuilder from './ReportBuilder';
import CustomViewsManager from './CustomViewsManager';

type AdminSettingsTab = 'general' | 'roles' | 'reports' | 'views';

const AdminSettings: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);
  const [activeTab, setActiveTab] = React.useState<AdminSettingsTab>('general');

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const tabs: { id: AdminSettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General Settings', icon: <FiSettings size={20} /> },
    { id: 'roles', label: 'Role Management', icon: <FiUsers size={20} /> },
    { id: 'reports', label: 'Custom Reports', icon: <FiFileText size={20} /> },
    { id: 'views', label: 'Custom Views', icon: <FiFilter size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings & Customization</h1>
          <p className="text-gray-600 mt-2">Manage dashboard settings, roles, reports, and custom views</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'general' && <SettingsPanel />}
        {activeTab === 'roles' && <RoleManagement />}
        {activeTab === 'reports' && <ReportBuilder />}
        {activeTab === 'views' && <CustomViewsManager />}
      </div>
    </div>
  );
};

export default AdminSettings;
