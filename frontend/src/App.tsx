import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';

// Store
import { store } from './store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getCurrentUser } from './store/slices/authSlice';

// Layout
import { Layout } from './components/Layout';

// Route configuration
import {
  publicRoutes,
  authRoutes,
  protectedRoutes,
  adminRoutes,
  sellerRoutes
} from './config/routes';

import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import SellerRoute from './components/SellerRoute';

// Auth guard wrapper
interface AuthGuardProps {
  element: React.ReactNode;
  isAuthenticated: boolean;
}

const AuthGuard = ({ element, isAuthenticated }: AuthGuardProps) => {
  return isAuthenticated ? <Navigate to="/" replace /> : element;
};

/**
 * AppContent component - handles routing and auth logic
 */
function AppContent() {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);

  // Get current user on mount if token exists
  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, isAuthenticated]);

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public routes */}
          {publicRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}

          {/* Auth routes (with redirect if authenticated) */}
          {authRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<AuthGuard element={route.element} isAuthenticated={isAuthenticated} />}
            />
          ))}

          {/* Protected routes */}
          {protectedRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}

          {/* Admin routes */}
          {adminRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}

          {/* Seller routes */}
          {sellerRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600">Page not found</p>
                </div>
              </div>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

/**
 * Main App component - provides Redux store
 */
      <AppContent />
    </Provider>
  );
}

export default App;
