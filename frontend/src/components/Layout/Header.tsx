import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { FiShoppingBag, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

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
    { label: 'Shop', href: '/products' },
    ...(isAuthenticated ? [{ label: 'Orders', href: '/orders' }] : []),
    ...(isAuthenticated && user?.role === 'admin' ? [{ label: 'Admin', href: '/admin/config' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 font-semibold text-neutral-950 hover:opacity-70 transition-opacity"
          >
            <div className="h-8 w-8 rounded-lg bg-neutral-950 flex items-center justify-center text-white text-sm font-bold">
              E
            </div>
            <span className="hidden sm:inline tracking-tight">E-Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3 py-2 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              <FiShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-neutral-950 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
              <span className="hidden sm:inline text-sm font-medium">Cart</span>
            </Link>

            {/* Auth Actions - Desktop */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <FiUser className="w-5 h-5" />
                  <span className="text-sm font-medium max-w-[80px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-50 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary py-2 px-4 text-sm"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-100 py-4 animate-fade-in">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-neutral-100 mt-4 pt-4 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    <FiUser className="w-5 h-5" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiLogOut className="w-5 h-5" />
                    Sign out
                  </button>
                </>
              ) : (
                <div className="space-y-2 px-4">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center text-sm font-medium text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center text-sm font-medium text-white bg-neutral-950 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    Sign up
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
