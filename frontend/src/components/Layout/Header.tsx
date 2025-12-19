import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { FiShoppingCart, FiUser, FiLogOut, FiLogIn, FiUserPlus, FiMenu, FiX, FiSearch } from 'react-icons/fi';

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
    { label: 'Collections', href: '/products' },
    ...(isAuthenticated ? [{ label: 'Orders', href: '/orders' }] : []),
    ...(isAuthenticated && user?.role === 'admin' ? [{ label: 'Control Panel', href: '/admin/dashboard' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between py-4 sm:py-5">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 font-bold text-lg sm:text-xl flex-shrink-0 hover:opacity-80 transition-opacity group"
          >
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-black to-gray-800 flex items-center justify-center text-white font-bold text-sm group-hover:shadow-lg transition-shadow">
              E
            </div>
            <span className="hidden sm:inline text-gray-900 tracking-tight">E-Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Search Button - Desktop Only */}
            <button className="hidden sm:inline-flex p-2 lg:p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
              <FiSearch size={20} />
            </button>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition p-2 lg:p-2.5 rounded-lg hover:bg-gray-50"
            >
              <div className="relative">
                <FiShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:block text-xs font-semibold text-gray-700">Bag</span>
            </Link>

            {/* Auth Actions - Desktop */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                {user?.role !== 'seller' && user?.role !== 'admin' && (
                  <button
                    onClick={() => navigate('/seller/register')}
                    className="text-xs lg:text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    Sell
                  </button>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition group"
                >
                  <div className="p-1.5 bg-gray-100 rounded-full group-hover:bg-gray-200 transition">
                    <FiUser size={16} />
                  </div>
                  <span className="hidden lg:block text-xs font-medium truncate max-w-[100px]">{user?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 p-2 lg:p-2.5 rounded-lg hover:bg-red-50 transition"
                  title="Logout"
                >
                  <FiLogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                <Link
                  to="/login"
                  className="text-xs lg:text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs lg:text-sm font-semibold text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-lg transition hover:shadow-md flex items-center gap-1"
                >
                  <FiUserPlus size={16} />
                  <span className="hidden sm:inline">Sign up</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition text-gray-600"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 px-0 space-y-1 bg-gray-50 animate-in fade-in slide-in-from-top-2">
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
                  {user?.role !== 'seller' && user?.role !== 'admin' && (
                    <Link
                      to="/seller/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-white rounded-lg transition"
                    >
                      🏪 Become a Seller
                    </Link>
                  )}
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
