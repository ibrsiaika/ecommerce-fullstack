import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { FiShoppingCart, FiUser, FiLogOut, FiLogIn, FiUserPlus } from 'react-icons/fi';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.cart);

  const totalItems = items.reduce((total: number, item: any) => total + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <h1 className="text-2xl font-bold text-indigo-600">E-Commerce</h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Products
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                className="text-gray-900 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Orders
              </Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <FiShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Authentication */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  <FiUser size={20} />
                  <span className="hidden sm:block text-sm">{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors p-2"
                >
                  <FiLogOut size={20} />
                  <span className="hidden sm:block text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition-colors p-2"
                >
                  <FiLogIn size={20} />
                  <span className="hidden sm:block text-sm">Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1 bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm transition-colors"
                >
                  <FiUserPlus size={20} />
                  <span className="hidden sm:block">Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className="text-gray-900 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="text-gray-900 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
          >
            Products
          </Link>
          {isAuthenticated && (
            <Link
              to="/orders"
              className="text-gray-900 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Orders
            </Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className="text-red-600 hover:text-red-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;