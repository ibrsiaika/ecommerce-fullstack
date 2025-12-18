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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-xl">
      <div className="container">
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-lg shadow-amber-900/40 flex items-center justify-center text-slate-900 font-black">
              E.
            </div>
            <div className="leading-tight">
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">Maison</p>
              <p className="text-xl font-semibold text-white">E-Commerce</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-3 lg:gap-5">
            <Link
              to="/"
              className="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              Collections
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                className="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                Orders
              </Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="px-3 py-2 rounded-lg text-sm font-medium text-amber-200 hover:text-amber-50 hover:bg-amber-500/20 transition-colors"
              >
                Admin
              </Link>
            )}
            {isAuthenticated && (user?.role === 'seller' || user?.role === 'admin') && (
              <Link
                to="/seller/dashboard"
                className="px-3 py-2 rounded-lg text-sm font-medium text-emerald-200 hover:text-emerald-50 hover:bg-emerald-500/20 transition-colors"
              >
                Seller
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              className="relative flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20 transition"
            >
              <FiShoppingCart size={18} />
              <span className="hidden md:block text-sm font-medium">Bag</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 text-xs rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center font-semibold">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20 transition"
                >
                  <FiUser size={18} />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs text-white/70">Signed in</p>
                    <p className="text-sm font-semibold leading-tight">{user?.name}</p>
                  </div>
                  {user?.role && (
                    <span className="pill bg-white/10 text-white border-white/20">
                      {user.role}
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-white/80 hover:text-white hover:bg-white/15 transition"
                >
                  <FiLogOut size={18} />
                  <span className="hidden sm:block text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20 transition"
                >
                  <FiLogIn size={18} />
                  <span className="hidden sm:block text-sm font-medium">Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-3 py-2 text-slate-900 font-semibold shadow-lg shadow-amber-900/30 hover:from-amber-500 hover:to-amber-700 transition"
                >
                  <FiUserPlus size={18} />
                  <span className="hidden sm:block text-sm font-semibold">Create account</span>
                </Link>
              </div>
            )}

            <button className="md:hidden rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition" aria-label="Toggle menu">
              <FiMenu size={18} />
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 shadow-inner shadow-black/30">
          <span className="pill bg-white/10 text-white border-white/20">Concierge onboarding</span>
          <p className="flex-1 text-center text-white/70">
            We curate essentials, gifting, and statement pieces—shipped with white-glove care.
          </p>
          <div className="flex items-center gap-4 text-white/70">
            <span className="text-xs uppercase tracking-[0.2em]">Support</span>
            <span className="font-semibold text-white">Live within 5 minutes</span>
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
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/15"
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
