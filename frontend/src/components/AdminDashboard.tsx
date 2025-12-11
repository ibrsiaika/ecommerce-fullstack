import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';

interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: any[];
  lowStockProducts: any[];
}

const AdminDashboard: React.FC = () => {
  const { user } = useAppSelector((state: any) => state.auth);
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
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Orders</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Products</h3>
              <p className="text-2xl font-bold text-green-600">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-600">No recent orders</p>
          ) : (
            <div className="space-y-4">
              {stats.recentOrders.map((order: any) => (
                <div key={order._id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(order.totalPrice)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Low Stock Alert</h2>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-gray-600">All products are well stocked</p>
          ) : (
            <div className="space-y-4">
              {stats.lowStockProducts.map((product: any) => (
                <div key={product._id} className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">SKU: {product.sku || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
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

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Product
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View All Orders
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            Manage Users
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;