import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';

interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: any[];
  lowStockProducts: any[];
  topProducts?: any[];
  topSellers?: any[];
  userGrowth?: any;
}

type TabType = 'overview' | 'revenue' | 'products' | 'sellers';

const AdminDashboard: React.FC = () => {
  const { user } = useAppSelector((state: any) => state.auth);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || user.role !== 'admin') return;

      try {
        // Fetch dashboard statistics
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          fetch('/api/orders', {
            headers: { Authorization: `Bearer ${user.token}` }
          }),
          fetch('/api/products', {
            headers: { Authorization: `Bearer ${user.token}` }
          }),
          fetch('/api/users', {
            headers: { Authorization: `Bearer ${user.token}` }
          })
        ]);

        if (ordersRes.ok && productsRes.ok && usersRes.ok) {
          const [ordersData, productsData, usersData] = await Promise.all([
            ordersRes.json(),
            productsRes.json(),
            usersRes.json()
          ]);

          const totalRevenue = ordersData.data?.reduce((sum: number, order: any) => {
            return order.isPaid ? sum + order.totalPrice : sum;
          }, 0) || 0;

          const lowStockProducts = productsData.data?.filter((product: any) => 
            product.countInStock < 10
          ) || [];

          const recentOrders = ordersData.data?.slice(0, 5) || [];

          setStats({
            totalOrders: ordersData.data?.length || 0,
            totalProducts: productsData.data?.length || 0,
            totalUsers: usersData.data?.length || 0,
            totalRevenue,
            recentOrders,
            lowStockProducts
          });
        } else {
          setError('Failed to fetch dashboard data');
        }
      } catch (err) {
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage your platform, monitor metrics, and control the marketplace</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-10 bg-white rounded-xl p-2 shadow-card w-fit animate-slide-down border border-gray-100">
          {(['overview', 'revenue', 'products', 'sellers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 font-semibold rounded-lg transition-all duration-200 capitalize ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Orders Card */}
            <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 group animate-slide-up" style={{animationDelay: '0ms'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 group-hover:from-blue-200 group-hover:to-blue-100 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Orders</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalOrders}</p>
              <div className="mt-4 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
              </div>
            </div>

            {/* Total Products Card */}
            <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 group animate-slide-up" style={{animationDelay: '100ms'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-100 to-green-50 group-hover:from-green-200 group-hover:to-green-100 transition-colors">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Products</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{stats.totalProducts}</p>
              <div className="mt-4 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
              </div>
            </div>

            {/* Total Users Card */}
            <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 group animate-slide-up" style={{animationDelay: '200ms'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 group-hover:from-purple-200 group-hover:to-purple-100 transition-colors">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Users</p>
              <p className="text-4xl font-bold text-purple-600 mt-2">{stats.totalUsers}</p>
              <div className="mt-4 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
              </div>
            </div>

            {/* Total Revenue Card */}
            <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 group animate-slide-up" style={{animationDelay: '300ms'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 group-hover:from-amber-200 group-hover:to-amber-100 transition-colors">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Revenue</p>
              <p className="text-4xl font-bold text-amber-600 mt-2">{formatCurrency(stats.totalRevenue)}</p>
              <div className="mt-4 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden animate-slide-up" style={{animationDelay: '400ms'}}>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <h2 className="text-xl font-bold text-white">📦 Recent Orders</h2>
              </div>
              <div className="p-6">
                {stats.recentOrders.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No recent orders</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentOrders.map((order: any) => (
                      <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatCurrency(order.totalPrice)}</p>
                          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mt-1 ${
                            order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-200 text-gray-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Low Stock Products */}
            <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden animate-slide-up" style={{animationDelay: '500ms'}}>
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6">
                <h2 className="text-xl font-bold text-white">⚠️ Low Stock Alert</h2>
              </div>
              <div className="p-6">
                {stats.lowStockProducts.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">All products are well stocked</p>
                ) : (
                  <div className="space-y-3">
                    {stats.lowStockProducts.map((product: any) => (
                      <div key={product._id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                        <div className="flex items-center space-x-4 flex-1">
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            product.countInStock === 0 ? 'bg-red-100 text-red-800' :
                            product.countInStock < 5 ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {product.countInStock} left
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-10 bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden animate-slide-up" style={{animationDelay: '600ms'}}>
            <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-6">
              <h2 className="text-xl font-bold text-white">⚡ Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 group">
                  <svg className="w-6 h-6 mr-2 text-blue-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-semibold text-blue-700">Add Product</span>
                </button>
                <button className="flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-105 group">
                  <svg className="w-6 h-6 mr-2 text-green-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="font-semibold text-green-700">All Orders</span>
                </button>
                <button className="flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 group">
                  <svg className="w-6 h-6 mr-2 text-purple-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span className="font-semibold text-purple-700">Users</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Revenue Analytics</h2>
          <p className="text-gray-600 mb-4">Revenue metrics and trends</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Average Order Value</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalRevenue / (stats.totalOrders || 1))}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Performance</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Total Products</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowStockProducts.filter((p: any) => p.countInStock === 0).length}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{stats.lowStockProducts.filter((p: any) => p.countInStock > 0 && p.countInStock < 10).length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Well Stocked</p>
                <p className="text-2xl font-bold text-green-600">{stats.lowStockProducts.filter((p: any) => p.countInStock >= 10).length}</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Top Products</h3>
            <div className="space-y-2">
              {stats.topProducts?.slice(0, 5).map((product: any, idx: number) => (
                <div key={product._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium text-gray-900">#{idx + 1} {product.name}</span>
                  <span className="text-gray-600">{product.countInStock} in stock</span>
                </div>
              )) || <p className="text-gray-600">Loading top products...</p>}
            </div>
          </div>
        </div>
      )}

      {/* Sellers Tab */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Seller Management</h2>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Sellers</h3>
            <div className="space-y-3">
              {stats.topSellers?.slice(0, 5).map((seller: any, idx: number) => (
                <div key={seller._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">#{idx + 1} {seller.name || seller.email}</p>
                    <p className="text-sm text-gray-600">{seller.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {seller.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              )) || <p className="text-gray-600">Loading seller data...</p>}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminDashboard;