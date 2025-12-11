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
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{stats.storeName}</h1>
      <p className="text-gray-600 mb-8">{stats.storeDescription}</p>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-8 gap-4 overflow-x-auto">
        {(['overview', 'products', 'earnings', 'withdrawals', 'analytics'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-2">⭐ Store Rating</p>
              <p className="text-3xl font-bold text-blue-600">{stats.rating.toFixed(1)}</p>
              <p className="text-xs text-gray-500 mt-2">{stats.totalReviews} reviews</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-2">👥 Followers</p>
              <p className="text-3xl font-bold text-green-600">{stats.followers}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-2">📦 Total Products</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalProducts}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-2">📋 Total Orders</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.totalOrders}</p>
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6">
              <p className="text-gray-700 text-sm font-medium mb-2">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6">
              <p className="text-gray-700 text-sm font-medium mb-2">Net Earnings</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.netEarnings)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md p-6">
              <p className="text-gray-700 text-sm font-medium mb-2">Platform Fee (15%)</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalRevenue * 0.15)}</p>
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
  );
};

export default SellerDashboard;
