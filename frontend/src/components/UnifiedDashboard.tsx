import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { FiTrendingUp, FiUsers, FiPackage, FiDollarSign, FiShoppingCart, FiStar, FiBarChart2, FiArrowUp, FiDownload, FiLoader, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';

type DashboardTabType = 'overview' | 'orders' | 'products' | 'analytics';

interface MetricCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  loading?: boolean;
}

const UnifiedDashboard: React.FC = () => {
  const { user } = useAppSelector((state: any) => state.auth);
  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller';

  const [activeTab, setActiveTab] = useState<DashboardTabType>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [] as any[],
    topProducts: [] as any[],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isAdmin) {
        // Fetch admin stats
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          api.get('/api/orders').catch(() => ({ data: { data: [] } })),
          api.getProducts(1, 100).catch(() => ({ data: { data: [] } })),
          api.get('/api/users').catch(() => ({ data: { data: [] } }))
        ]);

        const orders = ordersRes.data?.data || [];
        const products = productsRes.data?.data || [];
        const users = usersRes.data?.data || [];

        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0);

        setStats({
          totalOrders: orders.length,
          totalProducts: products.length,
          totalUsers: users.length,
          totalRevenue,
          recentOrders: orders.slice(0, 5),
          topProducts: products.slice(0, 5),
        });
      } else if (isSeller) {
        // Fetch seller stats
        const [storeRes, ordersRes, productsRes] = await Promise.all([
          api.get('/api/seller/store').catch(() => ({ data: {} })),
          api.get('/api/seller/orders').catch(() => ({ data: { data: [] } })),
          api.get('/api/seller/products').catch(() => ({ data: { data: [] } }))
        ]);

        const orders = ordersRes.data?.data || [];
        const products = productsRes.data?.data || [];
        const store = storeRes.data || {};

        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0);

        setStats({
          totalOrders: orders.length,
          totalProducts: products.length,
          totalUsers: store.followers?.length || 0,
          totalRevenue,
          recentOrders: orders.slice(0, 5),
          topProducts: products.slice(0, 5),
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const adminMetrics: MetricCard[] = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: <FiDollarSign className="w-6 h-6" />,
      trend: 12.5,
      loading
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <FiShoppingCart className="w-6 h-6" />,
      trend: 8.2,
      loading
    },
    {
      title: 'Active Users',
      value: stats.totalUsers,
      icon: <FiUsers className="w-6 h-6" />,
      trend: 5.1,
      loading
    },
    {
      title: 'Products Listed',
      value: stats.totalProducts,
      icon: <FiPackage className="w-6 h-6" />,
      trend: 3.7,
      loading
    }
  ];

  const sellerMetrics: MetricCard[] = [
    {
      title: 'Store Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: <FiDollarSign className="w-6 h-6" />,
      trend: 18.5,
      loading
    },
    {
      title: 'Orders',
      value: stats.totalOrders,
      icon: <FiShoppingCart className="w-6 h-6" />,
      trend: 15.2,
      loading
    },
    {
      title: 'Store Followers',
      value: stats.totalUsers,
      icon: <FiUsers className="w-6 h-6" />,
      trend: 22.1,
      loading
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      icon: <FiPackage className="w-6 h-6" />,
      trend: 9.3,
      loading
    }
  ];

  const metrics = isAdmin ? adminMetrics : sellerMetrics;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'shipped':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="container px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {isAdmin ? '📊 Admin Dashboard' : '🏪 Seller Dashboard'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                Welcome back, {user?.name}! Here's your business overview.
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              <FiDownload size={18} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container px-2 sm:px-4 lg:px-8 mt-6">
        <div className="flex gap-2 sm:gap-4 border-b border-gray-200 overflow-x-auto pb-4">
          {(['overview', 'orders', 'products', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'text-gray-900 border-b-2 border-black'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-2 sm:px-4 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <FiAlertCircle className="text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error loading dashboard</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-gray-100 text-gray-900">
                      {metric.loading ? <FiLoader className="w-6 h-6 animate-spin" /> : metric.icon}
                    </div>
                    {metric.trend && (
                      <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                        <FiArrowUp size={16} />
                        {metric.trend}%
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{metric.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {metric.loading ? '-' : metric.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales Chart */}
              <div className="lg:col-span-2 rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FiBarChart2 className="text-gray-700" />
                    {isAdmin ? 'Platform Revenue Trend' : 'Sales Performance'}
                  </h3>
                  <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Last 7 Days</span>
                </div>

                {/* Chart Visualization */}
                <div className="space-y-4">
                  {[65, 78, 82, 75, 88, 92, 85].map((value, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-xs text-gray-600 w-8">Day {i + 1}</span>
                      <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-black transition-all duration-500 hover:opacity-80"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-700 w-12">${(value * 1.5).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiTrendingUp className="text-gray-700" />
                  Key Metrics
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Conversion Rate', value: '3.24%', change: '+0.5%' },
                    { label: 'Avg Order Value', value: '$245.50', change: '+8.2%' },
                    { label: 'Customer Retention', value: '76.8%', change: '+3.1%' },
                    { label: 'Bounce Rate', value: '24.2%', change: '-2.3%' }
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-700 text-sm font-medium">{item.label}</span>
                        <span className="text-green-600 text-xs font-semibold">{item.change}</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FiShoppingCart className="text-gray-700" />
                    Recent Orders
                  </h3>
                  <a href={isAdmin ? '/admin/orders' : '/seller/orders'} className="text-gray-700 hover:text-gray-900 text-sm font-semibold">
                    View All →
                  </a>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <FiLoader className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </div>
                ) : stats.recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentOrders.map((order: any) => (
                      <div key={order._id || order.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-semibold text-sm truncate">#{order._id?.slice(-6) || order.id}</p>
                          <p className="text-gray-600 text-xs mt-1 truncate">{order.customerName || order.user?.name || 'Customer'}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-gray-900 font-bold">${(order.totalPrice || 0).toFixed(2)}</p>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${getStatusColor(order.status)}`}>
                            {order.status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FiShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No orders yet</p>
                  </div>
                )}
              </div>

              {/* Top Products */}
              <div className="rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FiPackage className="text-gray-700" />
                    Top Products
                  </h3>
                  <a href={isAdmin ? '/admin/products' : '/seller/products'} className="text-gray-700 hover:text-gray-900 text-sm font-semibold">
                    Manage →
                  </a>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <FiLoader className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </div>
                ) : stats.topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topProducts.map((product: any, i: number) => (
                      <div key={product._id || i}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-gray-900 font-semibold text-sm truncate">{product.name}</p>
                          <p className="text-gray-600 text-xs">${(product.price || 0).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-black"
                              style={{ width: `${Math.min((product.countInStock || 10) / 50 * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-gray-600 text-xs w-12 text-right">{product.countInStock || 0} in stock</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FiPackage className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No products yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="rounded-lg border border-gray-200 p-8 text-center">
            <FiShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Management</h3>
            <p className="text-gray-600 mb-6">View and manage all your orders in detail</p>
            <a
              href={isAdmin ? '/admin/orders' : '/orders'}
              className="inline-block px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Go to Orders
            </a>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="rounded-lg border border-gray-200 p-8 text-center">
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Product Management</h3>
            <p className="text-gray-600 mb-6">Manage your product catalog and inventory</p>
            <a
              href="/products"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Go to Products
            </a>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="rounded-lg border border-gray-200 p-8 text-center">
            <FiBarChart2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Advanced Analytics</h3>
            <p className="text-gray-600 mb-6">Detailed insights and performance metrics</p>
            <button className="inline-block px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition cursor-pointer">
              Generate Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedDashboard;
