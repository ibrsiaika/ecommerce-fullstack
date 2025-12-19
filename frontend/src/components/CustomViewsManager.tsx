import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiSave, FiTrash2, FiStar } from 'react-icons/fi';

interface SavedFilterType {
  _id: string;
  name: string;
  type: 'orders' | 'products' | 'users' | 'sellers';
  filterConfig: Record<string, any>;
  isDefault: boolean;
  createdAt: string;
}

interface FilterOption {
  id: string;
  label: string;
  type: string;
  options?: string[];
}

const CustomViewsManager: React.FC = () => {
  const [filters, setFilters] = useState<SavedFilterType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedType, setSelectedType] = useState<'orders' | 'products' | 'users' | 'sellers'>('orders');
  const [filterName, setFilterName] = useState('');
  const [filterConfig, setFilterConfig] = useState<Record<string, any>>({});

  const filterTypes = ['orders', 'products', 'users', 'sellers'] as const;

  const filterOptions: Record<string, FilterOption[]> = {
    orders: [
      { id: 'status', label: 'Order Status', type: 'select', options: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
      { id: 'paymentStatus', label: 'Payment Status', type: 'select', options: ['paid', 'unpaid', 'failed'] },
      { id: 'minPrice', label: 'Minimum Price', type: 'number' },
      { id: 'maxPrice', label: 'Maximum Price', type: 'number' },
      { id: 'dateFrom', label: 'Date From', type: 'date' },
      { id: 'dateTo', label: 'Date To', type: 'date' }
    ],
    products: [
      { id: 'category', label: 'Category', type: 'text' },
      { id: 'minPrice', label: 'Minimum Price', type: 'number' },
      { id: 'maxPrice', label: 'Maximum Price', type: 'number' },
      { id: 'stock', label: 'Stock Status', type: 'select', options: ['inStock', 'lowStock', 'outOfStock'] },
      { id: 'rating', label: 'Minimum Rating', type: 'number' }
    ],
    users: [
      { id: 'role', label: 'User Role', type: 'select', options: ['user', 'seller', 'admin'] },
      { id: 'isVerified', label: 'Email Verified', type: 'select', options: ['yes', 'no'] },
      { id: 'joinDate', label: 'Join Date From', type: 'date' },
      { id: 'lastActive', label: 'Last Active From', type: 'date' }
    ],
    sellers: [
      { id: 'isVerified', label: 'Verification Status', type: 'select', options: ['verified', 'pending', 'rejected'] },
      { id: 'minRating', label: 'Minimum Rating', type: 'number' },
      { id: 'minEarnings', label: 'Minimum Earnings', type: 'number' },
      { id: 'joinDate', label: 'Join Date From', type: 'date' }
    ]
  };

  const loadFilters = async (type: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/customization/filters/${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to load filters');
      const data = await response.json();
      setFilters(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilters(selectedType);
  }, [selectedType]);

  const handleSaveFilter = async () => {
    if (!filterName) {
      setError('Filter name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/customization/filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: filterName,
          type: selectedType,
          filterConfig: filterConfig,
          isDefault: false
        })
      });

      if (!response.ok) throw new Error('Failed to save filter');

      setFilterName('');
      setFilterConfig({});
      setShowBuilder(false);
      loadFilters(selectedType);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFilter = async (filterId: string) => {
    if (!window.confirm('Delete this filter?')) return;

    try {
      const response = await fetch(`/api/admin/customization/filters/${filterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete filter');

      loadFilters(selectedType);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSetDefault = async (filterId: string) => {
    try {
      const response = await fetch(`/api/admin/customization/filters/${filterId}/set-default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to set default filter');

      loadFilters(selectedType);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleFilterConfigChange = (key: string, value: any) => {
    setFilterConfig({
      ...filterConfig,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <FiX size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Custom Views & Filters</h2>
        <button
          onClick={() => {
            setShowBuilder(!showBuilder);
            setFilterName('');
            setFilterConfig({});
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FiPlus size={18} />
          New View
        </button>
      </div>

      {/* Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Select Data Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filterTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Builder */}
      {showBuilder && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} View
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Name</label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={`e.g., Pending ${selectedType}`}
              />
            </div>

            {/* Dynamic Filter Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Filter Criteria</label>
              <div className="space-y-3">
                {filterOptions[selectedType]?.map((option: FilterOption) => (
                  <div key={option.id}>
                    {option.type === 'select' ? (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">{option.label}</label>
                        <select
                          value={filterConfig[option.id] || ''}
                          onChange={(e) => handleFilterConfigChange(option.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select...</option>
                          {option.options?.map((opt: string) => (
                            <option key={opt} value={opt}>
                              {opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : option.type === 'date' ? (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">{option.label}</label>
                        <input
                          type="date"
                          value={filterConfig[option.id] || ''}
                          onChange={(e) => handleFilterConfigChange(option.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ) : option.type === 'number' ? (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">{option.label}</label>
                        <input
                          type="number"
                          value={filterConfig[option.id] || ''}
                          onChange={(e) => handleFilterConfigChange(option.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter value"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">{option.label}</label>
                        <input
                          type="text"
                          value={filterConfig[option.id] || ''}
                          onChange={(e) => handleFilterConfigChange(option.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter value"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Preview */}
            {Object.keys(filterConfig).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Applied Filters</label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-1 text-sm">
                    {Object.entries(filterConfig).map(([key, value]) => {
                      const option = filterOptions[selectedType]?.find((o: FilterOption) => o.id === key);
                      return (
                        value && (
                          <div key={key} className="text-blue-900">
                            <span className="font-medium">{option?.label}:</span> {String(value)}
                          </div>
                        )
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSaveFilter}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <FiSave size={18} />
              Save View
            </button>
            <button
              onClick={() => {
                setShowBuilder(false);
                setFilterName('');
                setFilterConfig({});
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Saved Filters List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Saved Views</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : filters.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">No saved views for {selectedType}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filters.map(filter => (
              <div key={filter._id} className="bg-white rounded-lg border border-gray-200 p-4 relative">
                {filter.isDefault && (
                  <div className="absolute top-3 right-3">
                    <FiStar size={18} className="text-yellow-500 fill-yellow-500" />
                  </div>
                )}

                <h4 className="font-semibold text-gray-900 mb-2">{filter.name}</h4>
                <p className="text-xs text-gray-500 mb-3">
                  Created: {new Date(filter.createdAt).toLocaleDateString()}
                </p>

                <div className="mb-3">
                  <p className="text-xs text-gray-600 font-medium mb-1">Filters Applied:</p>
                  <div className="space-y-1">
                    {Object.entries(filter.filterConfig).map(([key, value]) => (
                      <div key={key} className="text-xs text-gray-600">
                        • <span className="font-medium capitalize">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSetDefault(filter._id)}
                    className={`flex-1 px-3 py-2 rounded hover:opacity-80 transition-opacity text-sm font-medium flex items-center justify-center gap-2 ${
                      filter.isDefault
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <FiStar size={14} />
                    {filter.isDefault ? 'Default' : 'Set Default'}
                  </button>
                  <button
                    onClick={() => handleDeleteFilter(filter._id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <FiTrash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomViewsManager;
