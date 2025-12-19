import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface IWidget {
  id: string;
  name: string;
  enabled: boolean;
  position: number;
  size?: 'small' | 'medium' | 'large';
}

export interface INotificationPref {
  eventType: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
}

export interface IAdminCustomizationState {
  dashboardWidgets: IWidget[];
  notificationPreferences: INotificationPref[];
  autoRefreshInterval: number;
  defaultView: 'overview' | 'products' | 'orders' | 'users' | 'sellers';
  theme: 'light' | 'dark';
  itemsPerPage: number;
  orderFilters: Record<string, any>;
  productFilters: Record<string, any>;
  sellerVerificationWorkflow: string[];
  loading: boolean;
  error: string | null;
}

export interface ICustomizationContextType extends IAdminCustomizationState {
  fetchPreferences: () => Promise<void>;
  updateWidgets: (widgets: IWidget[]) => Promise<void>;
  toggleWidget: (widgetId: string) => Promise<void>;
  rearrangeWidgets: (widgets: IWidget[]) => Promise<void>;
  updateNotifications: (prefs: INotificationPref[]) => Promise<void>;
  updateRefreshInterval: (interval: number) => Promise<void>;
  updateSettings: (settings: Partial<IAdminCustomizationState>) => Promise<void>;
  saveFilter: (filterData: any) => Promise<void>;
  getSavedFilters: (type: string) => Promise<any[]>;
  deleteFilter: (filterId: string) => Promise<void>;
  clearError: () => void;
}

const CustomizationContext = createContext<ICustomizationContextType | undefined>(undefined);

interface CustomizationProviderProps {
  children: ReactNode;
}

export const CustomizationProvider: React.FC<CustomizationProviderProps> = ({ children }) => {
  const [state, setState] = useState<IAdminCustomizationState>({
    dashboardWidgets: [],
    notificationPreferences: [],
    autoRefreshInterval: 30000,
    defaultView: 'overview',
    theme: 'light',
    itemsPerPage: 10,
    orderFilters: {},
    productFilters: {},
    sellerVerificationWorkflow: [],
    loading: false,
    error: null
  });

  const fetchPreferences = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/admin/customization/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        dashboardWidgets: data.data?.dashboardWidgets || [],
        notificationPreferences: data.data?.notificationPreferences || [],
        autoRefreshInterval: data.data?.autoRefreshInterval || 30000,
        defaultView: data.data?.defaultView || 'overview',
        theme: data.data?.theme || 'light',
        itemsPerPage: data.data?.itemsPerPage || 10,
        orderFilters: data.data?.orderFilters || {},
        productFilters: data.data?.productFilters || {},
        sellerVerificationWorkflow: data.data?.sellerVerificationWorkflow || [],
        loading: false
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message, loading: false }));
    }
  };

  const updateWidgets = async (widgets: IWidget[]) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/admin/customization/preferences/widgets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ widgets })
      });

      if (!response.ok) {
        throw new Error('Failed to update widgets');
      }

      setState(prev => ({ ...prev, dashboardWidgets: widgets, loading: false }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message, loading: false }));
    }
  };

  const toggleWidget = async (widgetId: string) => {
    try {
      const response = await fetch(`/api/admin/customization/preferences/widgets/${widgetId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle widget');
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        dashboardWidgets: data.data?.dashboardWidgets || []
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  };

  const rearrangeWidgets = async (widgets: IWidget[]) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/admin/customization/preferences/widgets/rearrange', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ widgets })
      });

      if (!response.ok) {
        throw new Error('Failed to rearrange widgets');
      }

      setState(prev => ({ ...prev, dashboardWidgets: widgets, loading: false }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message, loading: false }));
    }
  };

  const updateNotifications = async (prefs: INotificationPref[]) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/admin/customization/preferences/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(prefs)
      });

      if (!response.ok) {
        throw new Error('Failed to update notifications');
      }

      setState(prev => ({ ...prev, notificationPreferences: prefs, loading: false }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message, loading: false }));
    }
  };

  const updateRefreshInterval = async (interval: number) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/admin/customization/preferences/refresh-interval', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ interval })
      });

      if (!response.ok) {
        throw new Error('Failed to update refresh interval');
      }

      setState(prev => ({ ...prev, autoRefreshInterval: interval, loading: false }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message, loading: false }));
    }
  };

  const updateSettings = async (settings: Partial<IAdminCustomizationState>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/admin/customization/preferences/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      setState(prev => ({ ...prev, ...settings, loading: false }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message, loading: false }));
    }
  };

  const saveFilter = async (filterData: any) => {
    try {
      const response = await fetch('/api/admin/customization/filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(filterData)
      });

      if (!response.ok) {
        throw new Error('Failed to save filter');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  };

  const getSavedFilters = async (type: string): Promise<any[]> => {
    try {
      const response = await fetch(`/api/admin/customization/filters/${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch filters');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      return [];
    }
  };

  const deleteFilter = async (filterId: string) => {
    try {
      const response = await fetch(`/api/admin/customization/filters/${filterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete filter');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Fetch preferences on mount
  useEffect(() => {
    fetchPreferences();
  }, []);

  const value: ICustomizationContextType = {
    ...state,
    fetchPreferences,
    updateWidgets,
    toggleWidget,
    rearrangeWidgets,
    updateNotifications,
    updateRefreshInterval,
    updateSettings,
    saveFilter,
    getSavedFilters,
    deleteFilter,
    clearError
  };

  return (
    <CustomizationContext.Provider value={value}>
      {children}
    </CustomizationContext.Provider>
  );
};

export const useCustomization = (): ICustomizationContextType => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within CustomizationProvider');
  }
  return context;
};
