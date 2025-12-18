import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { FiShoppingCart, FiUser, FiLogOut, FiLogIn, FiUserPlus, FiMenu } from 'react-icons/fi';

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
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white font-bold">
              E
            </div>
            <span className="text-gray-900">E-Commerce</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Collections
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Orders
              </Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Admin
              </Link>
            )}
            {isAuthenticated && (user?.role === 'seller' || user?.role === 'admin') && (
              <Link
                to="/seller/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Seller
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              className="relative flex items-center gap-1 text-gray-600 hover:text-gray-900 transition"
            >
              <FiShoppingCart size={20} />
              <span className="hidden sm:block text-sm font-medium">Bag</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                >
                  <FiUser size={20} />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs text-gray-500">Signed in</p>
                    <p className="text-sm font-semibold">{user?.name}</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                >
                  <FiLogOut size={20} />
                  <span className="hidden sm:block text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-lg transition"
                >
                  <FiUserPlus size={18} />
                  <span className="hidden sm:block text-sm font-semibold">Create account</span>
                </Link>
              </div>
            )}

            <button className="md:hidden rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 transition" aria-label="Toggle menu">
              <FiMenu size={18} />
            </button>
          </div>
        </div>

        <div className="md:hidden mt-2 flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { label: 'Home', href: '/' },
            { label: 'Collections', href: '/products' },
            ...(isAuthenticated ? [{ label: 'Orders', href: '/orders' }] : []),
            ...(isAuthenticated && user?.role === 'admin'
              ? [{ label: 'Admin', href: '/admin/dashboard' }]
              : []),
            ...(isAuthenticated && (user?.role === 'seller' || user?.role === 'admin')
              ? [{ label: 'Seller', href: '/seller/dashboard' }]
              : []),
          ].map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
