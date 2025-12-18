import React, { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { FiTrendingUp, FiUsers, FiPackage, FiDollarSign, FiShoppingCart, FiStar, FiBarChart2, FiArrowUp, FiArrowDown, FiEye, FiDownload } from 'react-icons/fi';

type DashboardTabType = 'overview' | 'analytics' | 'transactions' | 'reports';

interface MetricCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number;
  color: string;
}

const UnifiedDashboard: React.FC = () => {
  const { user } = useAppSelector((state: any) => state.auth);
  const [activeTab, setActiveTab] = useState<DashboardTabType>('overview');
  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller';

  // Static Premium Data
  const adminMetrics: MetricCard[] = [
    {
      title: 'Total Revenue',
      value: '$48,572.50',
      icon: <FiDollarSign className="w-6 h-6" />,
      trend: 12.5,
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Total Orders',
      value: '1,248',
      icon: <FiShoppingCart className="w-6 h-6" />,
      trend: 8.2,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Active Users',
      value: '3,847',
      icon: <FiUsers className="w-6 h-6" />,
      trend: 5.1,
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Products Listed',
      value: '2,156',
      icon: <FiPackage className="w-6 h-6" />,
      trend: 3.7,
      color: 'from-orange-500 to-red-600'
    }
  ];

  const sellerMetrics: MetricCard[] = [
    {
      title: 'Store Revenue',
      value: '$12,450.75',
      icon: <FiDollarSign className="w-6 h-6" />,
      trend: 18.5,
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Orders This Month',
      value: '342',
      icon: <FiShoppingCart className="w-6 h-6" />,
      trend: 15.2,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Store Followers',
      value: '1,264',
      icon: <FiUsers className="w-6 h-6" />,
      trend: 22.1,
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Average Rating',
      value: '4.8/5.0',
      icon: <FiStar className="w-6 h-6" />,
      trend: 2.3,
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  const metrics = isAdmin ? adminMetrics : sellerMetrics;

  // Recent Transactions
  const recentTransactions = [
    { id: '#ORD-2025-1847', customer: 'Rajesh Kumar', amount: '$1,245.50', status: 'Completed', date: '2025-12-18' },
    { id: '#ORD-2025-1846', customer: 'Priya Singh', amount: '$862.30', status: 'Processing', date: '2025-12-18' },
    { id: '#ORD-2025-1845', customer: 'Amit Patel', amount: '$2,150.00', status: 'Pending', date: '2025-12-17' },
    { id: '#ORD-2025-1844', customer: 'Neha Gupta', amount: '$745.80', status: 'Completed', date: '2025-12-17' },
    { id: '#ORD-2025-1843', customer: 'Vikram Sharma', amount: '$1,580.25', status: 'Completed', date: '2025-12-16' }
  ];

  // Top Products
  const topProducts = [
    { name: 'Premium Wireless Headphones', sales: 1245, revenue: '$18,675' },
    { name: 'Smart Watch Ultra', sales: 892, revenue: '$13,380' },
    { name: 'USB-C Hub Pro', sales: 756, revenue: '$9,072' },
    { name: 'Phone Stand Deluxe', sales: 543, revenue: '$5,430' },
    { name: 'Portable Charger 20K', sales: 412, revenue: '$6,180' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'Processing':
        return 'bg-blue-100 text-blue-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-gray-700 bg-gray-900/95 backdrop-blur">
        <div className="container px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {isAdmin ? '📊 Admin Dashboard' : '🏪 Seller Dashboard'}
              </h1>
              <p className="text-sm sm:text-base text-gray-400 mt-2">
                Welcome back, {user?.name}! Here's your business overview.
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
              <FiDownload size={18} />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex gap-2 sm:gap-4 border-b border-gray-700 overflow-x-auto pb-4">
          {(['overview', 'analytics', 'transactions', 'reports'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br p-6 hover:shadow-2xl transition-all duration-300"
                  style={{
                    backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                    backgroundSize: '200% 200%',
                    animation: `gradient 8s ease infinite`
                  }}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${metric.color}`} />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${metric.color} text-white`}>
                        {metric.icon}
                      </div>
                      <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                        <FiArrowUp size={16} />
                        {metric.trend}%
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">{metric.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{metric.value}</p>
                  </div>

                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 rounded-xl border border-white/10 group-hover:border-white/30 transition-all duration-300" />
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales Chart */}
              <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FiBarChart2 className="text-blue-400" />
                    {isAdmin ? 'Platform Revenue Trend' : 'Sales Performance'}
                  </h3>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">Last 7 Days</span>
                </div>
                
                {/* Dummy Chart */}
                <div className="space-y-4">
                  {[65, 78, 82, 75, 88, 92, 85].map((value, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 w-8">Day {i + 1}</span>
                      <div className="flex-1 h-8 bg-gray-700 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/50"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-300 w-12">${(value * 1.5).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FiTrendingUp className="text-green-400" />
                  Key Metrics
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Conversion Rate', value: '3.24%', change: '+0.5%' },
                    { label: 'Avg Order Value', value: '$245.50', change: '+8.2%' },
                    { label: 'Customer Retention', value: '76.8%', change: '+3.1%' },
                    { label: 'Bounce Rate', value: '24.2%', change: '-2.3%' }
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300 text-sm">{item.label}</span>
                        <span className="text-green-400 text-xs font-semibold">{item.change}</span>
                      </div>
                      <p className="text-lg font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FiShoppingCart className="text-purple-400" />
                    Recent Transactions
                  </h3>
                  <a href="#" className="text-blue-400 hover:text-blue-300 text-sm font-semibold">View All →</a>
                </div>

                <div className="space-y-3">
                  {recentTransactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between p-4 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition">
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{txn.id}</p>
                        <p className="text-gray-400 text-xs mt-1">{txn.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{txn.amount}</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${getStatusColor(txn.status)}`}>
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FiPackage className="text-orange-400" />
                    Top Products
                  </h3>
                  <a href="#" className="text-blue-400 hover:text-blue-300 text-sm font-semibold">Manage →</a>
                </div>

                <div className="space-y-4">
                  {topProducts.map((product, i) => (
                    <div key={i} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-semibold text-sm">{product.name}</p>
                        <p className="text-gray-400 text-xs">{product.revenue}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                            style={{ width: `${(product.sales / 1500) * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-400 text-xs w-12">{product.sales} sales</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 text-center">
            <FiBarChart2 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Advanced Analytics</h3>
            <p className="text-gray-400 mb-6">Detailed insights and performance metrics coming soon</p>
            <div className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition cursor-pointer">
              Generate Report
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 text-center">
            <FiEye className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Transaction History</h3>
            <p className="text-gray-400 mb-6">Complete transaction logs with filters and exports</p>
            <div className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition cursor-pointer">
              View Transactions
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 text-center">
            <FiDownload className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Reports & Exports</h3>
            <p className="text-gray-400 mb-6">Download detailed reports in multiple formats</p>
            <div className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition cursor-pointer">
              Download Report
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UnifiedDashboard;
