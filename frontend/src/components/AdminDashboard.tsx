import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { Navigate, useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { 
  FiPackage, FiDollarSign, FiShoppingCart, FiUsers, 
  FiMenu, FiX, FiSettings, FiGrid, FiEdit2, FiTrash2, FiPlus, FiSearch,
  FiEye, FiStar, FiHome, FiLogOut, FiTrendingUp
} from 'react-icons/fi';
import api from '../services/api';
import { DashboardLoader } from './Loading';

type AdminTab = 'overview' | 'products' | 'orders' | 'users' | 'settings';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', countInStock: '' });

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        api.get('/api/orders').catch(() => ({ data: { data: [] } })),
        api.getProducts(1, 100).catch(() => ({ data: { data: [] } })),
        api.get('/api/users').catch(() => ({ data: { data: [] } }))
      ]);

      setOrders(ordersRes.data?.data || []);
      setProducts(productsRes.data?.data || []);
      setUsers(usersRes.data?.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    try {
      await api.post('/api/products', {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        countInStock: parseInt(newProduct.countInStock) || 0,
        description: 'New product',
        category: 'General'
      });
      setShowAddProduct(false);
      setNewProduct({ name: '', price: '', countInStock: '' });
      fetchData();
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/api/users/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/api/orders/${orderId}`, { status });
      fetchData();
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <FiGrid size={20} /> },
    { id: 'products', label: 'Products', icon: <FiPackage size={20} /> },
    { id: 'orders', label: 'Orders', icon: <FiShoppingCart size={20} /> },
    { id: 'users', label: 'Users', icon: <FiUsers size={20} /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings size={20} /> }
  ] as const;

  const stats = [
    { label: 'Total Revenue', value: `$${orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0).toFixed(2)}`, icon: FiDollarSign, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Orders', value: orders.length, icon: FiShoppingCart, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Products', value: products.length, icon: FiPackage, color: 'from-amber-500 to-amber-600' },
    { label: 'Users', value: users.length, icon: FiUsers, color: 'from-purple-500 to-purple-600' }
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar - Mobile responsive */}
      <div className={`fixed left-0 top-0 h-screen ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-black text-white transition-transform duration-300 overflow-hidden border-r border-gray-200 z-40 shadow-lg flex flex-col md:translate-x-0`}>
        {/* Logo */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-black border-2 border-white flex items-center justify-center text-xl sm:text-2xl font-bold text-white mx-auto">
              E
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">E-Shop</h1>
              <p className="text-gray-400 text-xs mt-1 tracking-widest">ADMIN</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 sm:px-3 py-4 sm:py-6 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base ${
                activeTab === item.id
                  ? 'bg-white text-black'
                  : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
            >
              <span className="text-base sm:text-lg">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-3 sm:p-4 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full bg-gray-900 rounded-lg p-2.5 sm:p-3 hover:bg-gray-800 transition-colors border border-gray-700 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-left min-w-0">
                  <div className="text-gray-400 text-xs font-bold tracking-widest">ADMIN</div>
                  <div className="font-bold text-white text-xs sm:text-sm truncate">{user?.name}</div>
                </div>
                <span className={`transition-transform duration-300 text-white flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>
            </button>
            
            {dropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden z-50 shadow-lg animate-slideUp">
                <button
                  onClick={() => {
                    navigate('/');
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors font-medium text-sm"
                >
                  <FiHome size={18} />
                  <span>Homepage</span>
                </button>
                
                <div className="border-t border-gray-700"></div>
                
                <button
                  onClick={() => {
                    dispatch(logout());
                    navigate('/');
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-red-400 hover:bg-red-900/30 transition-colors font-medium text-sm"
                >
                  <FiLogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`flex flex-col min-h-screen md:ml-64 transition-all duration-300`}>
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-black flex-shrink-0"
            >
              {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-black truncate">
                {activeTab === 'overview' && 'Dashboard'}
                {activeTab === 'products' && 'Products'}
                {activeTab === 'orders' && 'Orders'}
                {activeTab === 'users' && 'Users'}
                {activeTab === 'settings' && 'Settings'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Welcome back, {user?.name}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3 sm:p-6 bg-white">
          {loading ? (
            <DashboardLoader />
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-4 sm:space-y-8 animate-fadeIn">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {stats.map((stat, i) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={i}
                          className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:border-black transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                        >
                          <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="p-2 rounded-lg bg-gray-100">
                              <Icon size={18} className="text-black" />
                            </div>
                            <FiTrendingUp className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                          </div>
                          <p className="text-gray-600 text-xs sm:text-sm font-semibold mb-2">{stat.label}</p>
                          <p className="text-2xl sm:text-3xl font-bold text-black">{stat.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Recent Orders */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
                          <FiShoppingCart size={18} />
                          <span className="truncate">Recent Orders</span>
                        </h3>
                        <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold flex-shrink-0">{orders.length}</span>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        {orders.slice(0, 5).map((order, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-black transition-colors">
                            <div className="flex justify-between items-start mb-2 gap-2">
                              <p className="font-bold text-black text-sm">#{order._id?.slice(-6)}</p>
                              <span className={`text-xs font-bold px-2 sm:px-3 py-1 rounded-full flex-shrink-0 ${getStatusColor(order.status)}`}>{order.status}</span>
                            </div>
                            <p className="text-gray-600 text-xs sm:text-sm">${order.totalPrice}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
                          <FiPackage size={18} />
                          <span className="truncate">Top Products</span>
                        </h3>
                        <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold flex-shrink-0">{products.length}</span>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        {products.slice(0, 5).map((product, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-black transition-colors">
                            <div className="flex justify-between items-start mb-2 gap-2">
                              <p className="font-bold text-black text-sm truncate">{product.name}</p>
                              <div className="flex items-center gap-1 text-gray-700 flex-shrink-0">
                                <FiStar size={12} className="fill-current" />
                                <span className="text-xs font-bold">{product.rating || 0}</span>
                              </div>
                            </div>
                            <p className="text-gray-600 text-xs sm:text-sm">${product.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <div className="flex-1 relative">
                      <FiSearch className="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none text-black placeholder-gray-400 transition-colors text-sm sm:text-base"
                      />
                    </div>
                    <button 
                      onClick={() => setShowAddProduct(!showAddProduct)}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 font-semibold hover:scale-105 transform whitespace-nowrap text-sm sm:text-base"
                    >
                      <FiPlus size={18} />
                      <span className="hidden sm:inline">Add Product</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>

                  {/* Add Product Modal */}
                  {showAddProduct && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 animate-slideUp">
                      <h3 className="text-base sm:text-lg font-bold text-black mb-4 sm:mb-6">Add New Product</h3>
                      <div className="space-y-3 sm:space-y-4">
                        <input
                          type="text"
                          placeholder="Product name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none text-black placeholder-gray-400 transition-colors text-sm sm:text-base"
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none text-black placeholder-gray-400 transition-colors text-sm sm:text-base"
                        />
                        <input
                          type="number"
                          placeholder="Stock count"
                          value={newProduct.countInStock}
                          onChange={(e) => setNewProduct({...newProduct, countInStock: e.target.value})}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none text-black placeholder-gray-400 transition-colors text-sm sm:text-base"
                        />
                        <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                          <button 
                            onClick={handleAddProduct}
                            className="flex-1 py-2.5 sm:py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 font-semibold hover:scale-105 transform text-sm sm:text-base"
                          >
                            Add
                          </button>
                          <button 
                            onClick={() => setShowAddProduct(false)}
                            className="flex-1 py-2.5 sm:py-3 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm sm:text-base"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Products Table */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm sm:text-base">
                        <thead className="bg-gray-100 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-black uppercase tracking-wider text-xs sm:text-sm">Name</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-black uppercase tracking-wider text-xs sm:text-sm">Price</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-black uppercase tracking-wider text-xs sm:text-sm">Stock</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-black uppercase tracking-wider text-xs sm:text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-black font-medium truncate text-xs sm:text-sm">{product.name}</td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-black font-bold text-xs sm:text-sm">${product.price}</td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4">
                                <span className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs font-bold ${product.countInStock > 10 ? 'bg-black text-white' : 'bg-red-100 text-red-700'}`}>
                                  {product.countInStock}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-center flex items-center justify-center gap-1 sm:gap-2">
                                <button className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-black">
                                  <FiEdit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(product._id)}
                                  className="p-1.5 sm:p-2 hover:bg-red-100 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm sm:text-base">
                        <thead className="bg-gray-100 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-black uppercase tracking-wider text-xs sm:text-sm">Order ID</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-black uppercase tracking-wider text-xs sm:text-sm">Customer</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-black uppercase tracking-wider text-xs sm:text-sm">Amount</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-black uppercase tracking-wider text-xs sm:text-sm">Status</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-black uppercase tracking-wider text-xs sm:text-sm">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {orders.map((order, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-black font-bold text-xs sm:text-sm">#{order._id?.slice(-6)}</td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-700 text-xs sm:text-sm truncate">{order.user?.name || 'Unknown'}</td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-black font-bold text-xs sm:text-sm">${order.totalPrice?.toFixed(2)}</td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4">
                                <select 
                                  value={order.status || ''}
                                  onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                  className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-gray-200 rounded-lg text-xs sm:text-sm font-bold text-black cursor-pointer hover:border-black transition-colors"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                <button className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-black">
                                  <FiEye size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm sm:text-base">
                        <thead className="bg-gray-100 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-black uppercase tracking-wider text-xs sm:text-sm">Name</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-black uppercase tracking-wider text-xs sm:text-sm">Email</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-black uppercase tracking-wider text-xs sm:text-sm">Role</th>
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-black uppercase tracking-wider text-xs sm:text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {users.map((userItem, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-black font-bold text-xs sm:text-sm truncate">{userItem.name}</td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-700 text-xs sm:text-sm truncate">{userItem.email}</td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4">
                                <span className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs font-bold ${userItem.role === 'admin' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}>
                                  {(userItem.role || 'customer').toUpperCase()}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-center flex items-center justify-center gap-1 sm:gap-2">
                                <button className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-black">
                                  <FiEdit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(userItem._id)}
                                  className="p-1.5 sm:p-2 hover:bg-red-100 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-4 sm:space-y-6 animate-fadeIn max-w-3xl">
                  {/* Brand Settings */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 sm:p-8">
                    <h3 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6">Brand Settings</h3>
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-black mb-2 sm:mb-3 uppercase tracking-wider">Store Name</label>
                        <input
                          type="text"
                          defaultValue="E-Shop"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none text-black placeholder-gray-400 transition-colors text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-black mb-2 sm:mb-3 uppercase tracking-wider">Primary Color</label>
                        <div className="flex gap-2 sm:gap-3">
                          <input
                            type="color"
                            defaultValue="#000000"
                            className="w-12 sm:w-16 h-10 sm:h-12 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-black transition-colors"
                          />
                          <input
                            type="text"
                            defaultValue="#000000"
                            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none text-black font-mono transition-colors text-xs sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Settings */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 sm:p-8">
                    <h3 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6">Payment Methods</h3>
                    <div className="space-y-2 sm:space-y-3">
                      {['Stripe', 'PayPal', 'Bank Transfer'].map((method, i) => (
                        <div key={i} className="flex items-center p-3 sm:p-4 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-black transition-colors group cursor-pointer">
                          <input type="checkbox" defaultChecked className="w-4 sm:w-5 h-4 sm:h-5 cursor-pointer" />
                          <span className="ml-3 sm:ml-4 font-semibold text-black flex-1 group-hover:underline transition-colors text-xs sm:text-sm">{method}</span>
                          <button className="text-xs sm:text-sm font-bold text-gray-600 hover:text-black transition-colors whitespace-nowrap px-2 sm:px-0">Configure</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <button 
                    onClick={() => alert('✓ Settings saved successfully!')}
                    className="w-full py-3 sm:py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 font-bold text-base sm:text-lg hover:scale-105 transform"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;