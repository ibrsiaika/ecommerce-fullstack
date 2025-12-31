import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX, FiSearch } from 'react-icons/fi';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.cart);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const totalItems = items.reduce((total: number, item: any) => total + item.quantity, 0);

  // Check if currently on products page
  const isOnProductsPage = location.pathname === '/products';

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close search on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchToggle = () => {
    if (searchOpen) {
      setSearchOpen(false);
      setSearchQuery('');
    } else {
      setSearchOpen(true);
    }
  };

  const navItems = [
    { label: 'Collections', href: '/products' },
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
            className="flex items-center gap-2.5 font-semibold text-neutral-900 hover:opacity-70 transition-opacity"
          >
            <div className="h-8 w-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white text-sm font-bold">
              E
            </div>
            <span className="hidden sm:inline tracking-tight">E-Shop</span>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1">
            {/* Search - Hidden on products page */}
            {!isOnProductsPage && (
              <button 
                onClick={handleSearchToggle}
                className="p-2.5 text-neutral-500 hover:text-neutral-900 transition-colors"
                aria-label="Search"
              >
                <FiSearch className="w-5 h-5" />
              </button>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-2.5 py-2 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <FiShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 left-5 bg-neutral-900 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
              <span className="hidden sm:inline text-sm font-medium">Bag</span>
            </Link>

            {/* Auth Actions - Desktop */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-1 ml-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  <FiUser className="w-5 h-5" />
                  <span className="text-sm font-medium max-w-[80px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors"
                  title="Sign out"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3 ml-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900 border border-neutral-300 rounded-full px-4 py-2 hover:bg-neutral-50 transition-colors"
                >
                  <FiUser className="w-4 h-4" />
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-500 hover:text-neutral-900 transition-colors"
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
                  className="block px-4 py-3 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
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
                    className="block w-full py-2.5 text-center text-sm font-medium text-neutral-700 border border-neutral-200 rounded-full hover:bg-neutral-50 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center text-sm font-medium text-neutral-900 border border-neutral-300 rounded-full hover:bg-neutral-50 transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Overlay */}
        <div 
          className={`absolute left-0 right-0 top-full bg-white border-b border-neutral-200 shadow-lg overflow-hidden transition-all duration-300 ease-out ${
            searchOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <form onSubmit={handleSearchSubmit} className="container py-4">
            <div className="relative flex items-center">
              <FiSearch className="absolute left-4 w-5 h-5 text-neutral-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-24 py-3 text-base border border-neutral-300 rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              />
              <div className="absolute right-2 flex items-center gap-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-neutral-900 rounded-full hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Search Backdrop */}
        {searchOpen && (
          <div 
            className="fixed inset-0 top-16 bg-black/20 z-[-1] animate-fade-in"
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery('');
            }}
          />
        )}
      </div>
    </header>
  );
};

export default Header;
