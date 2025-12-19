import React, { useState, useEffect } from 'react';
import { FiPlus, FiX, FiSave, FiDownload, FiTrash2, FiEdit2 } from 'react-icons/fi';

interface ReportConfig {
  id?: string;
  name: string;
  metrics: string[];
  dateRange: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate?: string;
  endDate?: string;
  filters: Record<string, any>;
}

const ReportBuilder: React.FC = () => {
  const [reports, setReports] = useState<ReportConfig[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingReport, setEditingReport] = useState<ReportConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ReportConfig>({
    name: '',
    metrics: [],
    dateRange: 'monthly',
    filters: {}
  });

  const availableMetrics = [
    { id: 'totalRevenue', label: 'Total Revenue' },
    { id: 'totalOrders', label: 'Total Orders' },
    { id: 'totalProducts', label: 'Total Products' },
    { id: 'totalUsers', label: 'Total Users' },
    { id: 'totalStores', label: 'Total Stores' },
    { id: 'conversionRate', label: 'Conversion Rate' },
    { id: 'averageOrderValue', label: 'Average Order Value' },
    { id: 'topProducts', label: 'Top Products' },
    { id: 'topSellers', label: 'Top Sellers' },
    { id: 'orderStatusDistribution', label: 'Order Status Distribution' },
    { id: 'userGrowth', label: 'User Growth' },
    { id: 'categoryPerformance', label: 'Category Performance' },
    { id: 'paymentMetrics', label: 'Payment Metrics' },
    { id: 'customerInsights', label: 'Customer Insights' }
  ];

  const loadSavedReports = async () => {
    try {
      const response = await fetch('/api/admin/customization/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to load reports');
      const data = await response.json();
      setReports(data.data?.savedReports || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSavedReports();
  }, []);

  const handleAddMetric = (metricId: string) => {
    if (!formData.metrics.includes(metricId)) {
      setFormData({
        ...formData,
        metrics: [...formData.metrics, metricId]
      });
    }
  };

  const handleRemoveMetric = (metricId: string) => {
    setFormData({
      ...formData,
      metrics: formData.metrics.filter(m => m !== metricId)
    });
  };

  const handleSaveReport = async () => {
    if (!formData.name) {
      setError('Report name is required');
      return;
    }

    if (formData.metrics.length === 0) {
      setError('Please select at least one metric');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/customization/preferences/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save report');

      setFormData({
        name: '',
        metrics: [],
        dateRange: 'monthly',
        filters: {}
      });
      setShowBuilder(false);
      setEditingReport(null);
      loadSavedReports();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportName: string) => {
    if (!window.confirm('Delete this report?')) return;

    try {
      const response = await fetch(`/api/admin/customization/preferences/reports/${reportName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete report');

      loadSavedReports();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditReport = (report: ReportConfig) => {
    setFormData(report);
    setEditingReport(report);
    setShowBuilder(true);
  };

  const handleExportReport = (report: ReportConfig) => {
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.name}.json`;
    link.click();
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
        <h2 className="text-2xl font-bold text-gray-900">Custom Reports</h2>
        <button
          onClick={() => {
            setShowBuilder(!showBuilder);
            setEditingReport(null);
            setFormData({
              name: '',
              metrics: [],
              dateRange: 'monthly',
              filters: {}
            });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FiPlus size={18} />
          New Report
        </button>
      </div>

      {/* Report Builder */}
      {showBuilder && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingReport ? 'Edit Report' : 'Create New Report'}
          </h3>

          <div className="space-y-6">
            {/* Report Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Monthly Sales Report"
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={formData.dateRange}
                onChange={(e) => setFormData({ ...formData, dateRange: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {formData.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Metrics Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Metrics to Include</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableMetrics.map(metric => (
                  <label key={metric.id} className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.metrics.includes(metric.id)}
                      onChange={(e) =>
                        e.target.checked
                          ? handleAddMetric(metric.id)
                          : handleRemoveMetric(metric.id)
                      }
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">{metric.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Filters (Optional)</label>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
                <p>You can add filters to narrow down the data:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Filter by category</li>
                  <li>• Filter by status (paid, pending, etc.)</li>
                  <li>• Filter by seller</li>
                </ul>
              </div>
            </div>

            {/* Selected Metrics Preview */}
            {formData.metrics.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Metrics Preview</label>
                <div className="flex flex-wrap gap-2">
                  {formData.metrics.map(metricId => {
                    const metric = availableMetrics.find(m => m.id === metricId);
                    return (
                      <span
                        key={metricId}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2"
                      >
                        {metric?.label}
                        <button
                          onClick={() => handleRemoveMetric(metricId)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSaveReport}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <FiSave size={18} />
              {editingReport ? 'Update' : 'Save'} Report
            </button>
            <button
              onClick={() => {
                setShowBuilder(false);
                setEditingReport(null);
                setFormData({
                  name: '',
                  metrics: [],
                  dateRange: 'monthly',
                  filters: {}
                });
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Saved Reports */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Saved Reports</h3>
        {reports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No saved reports yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map(report => (
              <div key={report.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{report.name}</h4>
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">{report.metrics.length}</span> metrics · Date Range:{' '}
                  <span className="font-medium capitalize">{report.dateRange}</span>
                </p>
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-2">Metrics:</p>
                  <div className="flex flex-wrap gap-1">
                    {report.metrics.map(metric => (
                      <span key={metric} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditReport(report)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <FiEdit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleExportReport(report)}
                    className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <FiDownload size={16} />
                    Export
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report.name)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <FiTrash2 size={16} />
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

export default ReportBuilder;
