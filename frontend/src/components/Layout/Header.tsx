import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { FiShoppingCart, FiUser, FiLogOut, FiLogIn, FiUserPlus, FiMenu, FiX } from 'react-icons/fi';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.cart);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = items.reduce((total: number, item: any) => total + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Collections', href: '/products' },
    ...(isAuthenticated ? [{ label: 'Orders', href: '/orders' }] : []),
    ...(isAuthenticated && user?.role === 'admin' ? [{ label: 'Admin', href: '/admin/dashboard' }] : []),
    ...(isAuthenticated && (user?.role === 'seller' || user?.role === 'admin') ? [{ label: 'Seller', href: '/seller/dashboard' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-semibold text-base sm:text-lg flex-shrink-0">
            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-sm">
              E
            </div>
            <span className="hidden xs:inline text-gray-900">E-Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative flex items-center gap-1 text-gray-600 hover:text-gray-900 transition p-2 sm:p-0 rounded-lg hover:bg-gray-50 sm:hover:bg-transparent"
            >
              <FiShoppingCart size={20} className="flex-shrink-0" />
              <span className="hidden sm:block text-xs sm:text-sm font-medium">Bag</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Auth Actions - Desktop */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <FiUser size={18} />
                  <span className="hidden md:block text-xs font-medium truncate max-w-[120px]">{user?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  <FiLogOut size={18} />
                  <span className="hidden md:block text-xs font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/seller/register"
                  className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  Sell
                </Link>
                <Link
                  to="/register"
                  className="text-xs sm:text-sm font-semibold text-white bg-black hover:bg-gray-800 px-3 sm:px-4 py-2 rounded-lg transition flex items-center gap-1"
                >
                  <FiUserPlus size={16} className="flex-shrink-0" />
                  <span className="hidden sm:inline">Sign up</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition flex-shrink-0 text-gray-600"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 px-0 space-y-2 bg-gray-50">
            {/* Mobile Navigation Links */}
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white transition rounded-lg"
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Auth Actions */}
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-white rounded-lg transition"
                  >
                    <FiUser size={18} />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <FiLogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white rounded-lg transition border border-gray-200"
                  >
                    <FiLogIn size={18} />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-black hover:bg-gray-800 rounded-lg transition"
                  >
                    <FiUserPlus size={18} />
                    <span>Sign up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
