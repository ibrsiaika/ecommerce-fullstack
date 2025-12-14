import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';

interface SellerStats {
  storeName: string;
  storeDescription: string;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  netEarnings: number;
  rating: number;
  followers: number;
  totalReviews: number;
  recentOrders: any[];
  topProducts: any[];
  platformCommission: number;
}

type SellerTabType = 'overview' | 'products' | 'earnings' | 'withdrawals' | 'analytics';

const SellerDashboard: React.FC = () => {
  const { user } = useAppSelector((state: any) => state.auth);
  const [activeTab, setActiveTab] = useState<SellerTabType>('overview');
  const [stats, setStats] = useState<SellerStats>({
    storeName: '',
    storeDescription: '',
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    netEarnings: 0,
    rating: 0,
    followers: 0,
    totalReviews: 0,
    recentOrders: [],
    topProducts: [],
    platformCommission: 15
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    countInStock: '',
    category: '',
    image: ''
  });

  // Withdrawal form state
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    fetchSellerData();
  }, [user]);

  const fetchSellerData = async () => {
    if (!user || user.role !== 'seller') {
      setError('You must be a seller to access this dashboard');
      setLoading(false);
      return;
    }

    try {
      // Fetch seller dashboard statistics
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        fetch('/api/seller/stats', {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        fetch('/api/seller/orders', {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        fetch('/api/seller/products', {
          headers: { Authorization: `Bearer ${user.token}` }
        })
      ]);

      if (statsRes.ok && ordersRes.ok && productsRes.ok) {
        const [statsData, ordersData, productsData] = await Promise.all([
          statsRes.json(),
          ordersRes.json(),
          productsRes.json()
        ]);

        setStats({
          storeName: statsData.data?.storeName || 'My Store',
          storeDescription: statsData.data?.storeDescription || 'Welcome to my store',
          totalProducts: productsData.data?.length || 0,
          totalOrders: ordersData.data?.length || 0,
          totalRevenue: statsData.data?.totalRevenue || 0,
          netEarnings: (statsData.data?.totalRevenue || 0) * 0.85, // 15% commission
          rating: statsData.data?.rating || 4.5,
          followers: statsData.data?.followers || 0,
          totalReviews: statsData.data?.totalReviews || 0,
          recentOrders: ordersData.data?.slice(0, 5) || [],
          topProducts: productsData.data?.slice(0, 5) || [],
          platformCommission: 15
        });
      } else {
        setError('Failed to fetch seller data');
      }
    } catch (err) {
      console.error('Error fetching seller data:', err);
      setError('Failed to fetch seller data');
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify(productFormData)
      });

      if (response.ok) {
        setProductFormData({
          name: '',
          description: '',
          price: '',
          countInStock: '',
          category: '',
          image: ''
        });
        setShowProductForm(false);
        fetchSellerData(); // Refresh data
      }
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/seller/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ amount: parseFloat(withdrawalAmount) })
      });

      if (response.ok) {
        const data = await response.json();
        setWithdrawals([...withdrawals, data.data]);
        setWithdrawalAmount('');
        setShowWithdrawalForm(false);
      }
    } catch (err) {
      console.error('Error processing withdrawal:', err);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">Seller Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage your store, products, earnings, and analytics</p>
        </div>

        {/* Store Info Section */}
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 mb-10 animate-slide-down">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{stats.storeName}</h2>
            <p className="text-gray-600 mt-1 mb-6">{stats.storeDescription}</p>
            <div className="flex flex-wrap gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-600">{stats.rating.toFixed(1)}⭐</p>
                <p className="text-sm text-gray-600 mt-1">Rating ({stats.totalReviews} reviews)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.followers}</p>
                <p className="text-sm text-gray-600 mt-1">Followers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-10 bg-white rounded-xl p-2 shadow-card w-fit animate-slide-down border border-gray-100 overflow-x-auto">
          {(['overview', 'products', 'earnings', 'withdrawals', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 font-semibold rounded-lg transition-all duration-200 capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
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
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Store Rating */}
              <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 group animate-slide-up" style={{animationDelay: '0ms'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 group-hover:from-amber-200 group-hover:to-amber-100 transition-colors">
                    <span className="text-2xl">⭐</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Store Rating</p>
                <p className="text-4xl font-bold text-amber-600 mt-2">{stats.rating.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-2">{stats.totalReviews} reviews</p>
              </div>

              {/* Followers */}
              <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 group animate-slide-up" style={{animationDelay: '100ms'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 group-hover:from-blue-200 group-hover:to-blue-100 transition-colors">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Followers</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{stats.followers}</p>
                <div className="mt-4 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                </div>
              </div>

              {/* Total Products */}
              <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 group animate-slide-up" style={{animationDelay: '200ms'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 group-hover:from-purple-200 group-hover:to-purple-100 transition-colors">
                    <span className="text-2xl">📦</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Products</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">{stats.totalProducts}</p>
                <div className="mt-4 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 group animate-slide-up" style={{animationDelay: '300ms'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-green-100 to-green-50 group-hover:from-green-200 group-hover:to-green-100 transition-colors">
                    <span className="text-2xl">📋</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Orders</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{stats.totalOrders}</p>
                <div className="mt-4 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Revenue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {/* Total Revenue */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-card-lg p-6 text-white border border-blue-400 animate-slide-up" style={{animationDelay: '400ms'}}>
                <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Total Revenue</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</p>
                <div className="mt-4 text-blue-200 text-sm">All transactions this month</div>
              </div>

              {/* Net Earnings */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-card-lg p-6 text-white border border-green-400 animate-slide-up" style={{animationDelay: '500ms'}}>
                <p className="text-green-100 text-sm font-semibold uppercase tracking-wide">Net Earnings</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(stats.netEarnings)}</p>
                <div className="mt-4 text-green-200 text-sm">After 15% platform fee</div>
              </div>

              {/* Platform Fee */}
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-card-lg p-6 text-white border border-orange-400 animate-slide-up" style={{animationDelay: '600ms'}}>
                <p className="text-orange-100 text-sm font-semibold uppercase tracking-wide">Platform Fee (15%)</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalRevenue * 0.15)}</p>
                <div className="mt-4 text-orange-200 text-sm">Marketplace commission</div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
              {stats.recentOrders.length === 0 ? (
                <p className="text-gray-600">No recent orders</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentOrders.map((order: any) => (
                    <div key={order._id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(order.totalPrice)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Top Products</h2>
              {stats.topProducts.length === 0 ? (
                <p className="text-gray-600">No products listed</p>
              ) : (
                <div className="space-y-3">
                  {stats.topProducts.map((product: any, idx: number) => (
                    <div key={product._id} className="flex justify-between items-start border-b pb-3">
                      <div>
                        <p className="font-medium text-gray-900">#{idx + 1} {product.name}</p>
                        <p className="text-sm text-gray-600">⭐ {product.rating?.toFixed(1)} • {product.numReviews} reviews</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(product.price)}</p>
                        <p className="text-sm text-gray-600">{product.countInStock} in stock</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
            <button
              onClick={() => setShowProductForm(!showProductForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showProductForm ? 'Cancel' : '+ Add Product'}
            </button>
          </div>

          {showProductForm && (
            <form onSubmit={handleAddProduct} className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={productFormData.category}
                    onChange={(e) => setProductFormData({...productFormData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({...productFormData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={productFormData.countInStock}
                    onChange={(e) => setProductFormData({...productFormData, countInStock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({...productFormData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={productFormData.image}
                    onChange={(e) => setProductFormData({...productFormData, image: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Product
              </button>
            </form>
          )}

          {/* Products List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Products ({stats.totalProducts})</h3>
            {stats.topProducts.length === 0 ? (
              <p className="text-gray-600">No products yet. Add your first product above.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.topProducts.map((product: any) => (
                  <div key={product._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(product.price)}</span>
                      <span className="text-sm text-gray-600">{product.countInStock} left</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Earnings Tab */}
      {activeTab === 'earnings' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Earnings Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <p className="text-gray-700 text-sm font-medium mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-gray-600 mt-2">From {stats.totalOrders} orders</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
              <p className="text-gray-700 text-sm font-medium mb-2">Net Earnings</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.netEarnings)}</p>
              <p className="text-xs text-gray-600 mt-2">After platform fees</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
              <p className="text-gray-700 text-sm font-medium mb-2">Pending Withdrawal</p>
              <p className="text-3xl font-bold text-orange-600">{formatCurrency(stats.netEarnings)}</p>
              <p className="text-xs text-gray-600 mt-2">Ready to cash out</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Earning Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total Revenue</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-gray-700">Platform Commission (15%)</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(stats.totalRevenue * 0.15)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-3 bg-gray-50 p-3 rounded">
                  <span className="text-gray-900 font-medium">Your Earnings</span>
                  <span className="font-bold text-lg text-green-600">{formatCurrency(stats.netEarnings)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Earnings</h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between"><span className="text-gray-600">This Month</span><span className="font-medium">{formatCurrency(stats.netEarnings * 0.8)}</span></p>
                <p className="flex justify-between"><span className="text-gray-600">Last Month</span><span className="font-medium">{formatCurrency(stats.netEarnings * 0.95)}</span></p>
                <p className="flex justify-between"><span className="text-gray-600">3 Months Avg</span><span className="font-medium">{formatCurrency(stats.netEarnings * 0.85)}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawals Tab */}
      {activeTab === 'withdrawals' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Withdrawal Management</h2>
            <button
              onClick={() => setShowWithdrawalForm(!showWithdrawalForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              {showWithdrawalForm ? 'Cancel' : '+ Request Withdrawal'}
            </button>
          </div>

          {showWithdrawalForm && (
            <form onSubmit={handleWithdrawal} className="bg-green-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-4">Request Withdrawal</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Withdraw</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-600">$</span>
                  <input
                    type="number"
                    step="0.01"
                    max={stats.netEarnings}
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">Available: {formatCurrency(stats.netEarnings)}</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 mb-4">
                <p className="text-sm text-gray-600">Processing time: 3-5 business days</p>
                <p className="text-sm text-gray-600">Minimum withdrawal: $10.00</p>
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Request Withdrawal
              </button>
            </form>
          )}

          {/* Withdrawal History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdrawal History</h3>
            {withdrawals.length === 0 ? (
              <p className="text-gray-600">No withdrawal requests yet</p>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((withdrawal: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{formatCurrency(withdrawal.amount)}</p>
                      <p className="text-sm text-gray-600">{formatDate(withdrawal.requestDate)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                      withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {withdrawal.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Store Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Store Rating</span>
                  <span className="text-lg font-bold text-blue-600">⭐ {stats.rating.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Total Followers</span>
                  <span className="text-lg font-bold text-purple-600">{stats.followers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Total Reviews</span>
                  <span className="text-lg font-bold text-green-600">{stats.totalReviews}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Average Order Value</span>
                  <span className="text-lg font-bold text-orange-600">
                    {formatCurrency((stats.totalRevenue / (stats.totalOrders || 1)))}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Indicators</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-sm text-gray-600 mb-1">Month-over-Month Growth</p>
                  <p className="text-2xl font-bold text-blue-600">+12.5%</p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-sm text-gray-600 mb-1">Customer Retention Rate</p>
                  <p className="text-2xl font-bold text-green-600">87.3%</p>
                </div>
                <div className="p-3 bg-purple-50 rounded">
                  <p className="text-sm text-gray-600 mb-1">Average Response Time</p>
                  <p className="text-2xl font-bold text-purple-600">2.5 hrs</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Categories</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded">
                <span className="text-gray-700">Electronics</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded mr-3">
                    <div className="h-full bg-blue-600 rounded" style={{width: '85%'}}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">85%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <span className="text-gray-700">Fashion</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded mr-3">
                    <div className="h-full bg-green-600 rounded" style={{width: '65%'}}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">65%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <span className="text-gray-700">Home & Garden</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded mr-3">
                    <div className="h-full bg-purple-600 rounded" style={{width: '45%'}}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">45%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default SellerDashboard;
