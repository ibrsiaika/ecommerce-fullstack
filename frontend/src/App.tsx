import { useEffect, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';

// Store
import { store } from './store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getCurrentUser } from './store/slices/authSlice';

// Layout
import { Layout } from './components/Layout';

// Loading components
import { PageLoader, LoadingFallback } from './components/Loading';

// Route configuration and guards
import {
  publicRoutes,
  authRoutes,
  protectedRoutes,
  adminRoutes,
  sellerRoutes
} from './config/routes';
import type { RouteConfig } from './config/routes';

import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import SellerRoute from './components/SellerRoute';

/**
 * AppContent component - handles routing and auth logic
 */
function AppContent() {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const [appReady, setAppReady] = useState(false);

  // Get current user on mount if token exists
  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser()).finally(() => {
        setAppReady(true);
      });
    } else {
      setAppReady(true);
    }
  }, [dispatch, token, isAuthenticated]);

  /**
   * Render route with appropriate guards
   */
  const renderRoute = (route: RouteConfig, guard?: 'admin' | 'seller') => {
    const Component = route.component;

    if (guard === 'admin') {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <AdminRoute><Component /></AdminRoute>
        </Suspense>
      );
    }
    if (guard === 'seller') {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <SellerRoute><Component /></SellerRoute>
        </Suspense>
      );
    }
    if (route.protected) {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <PrivateRoute><Component /></PrivateRoute>
        </Suspense>
      );
    }

    // Auth routes - redirect if already authenticated
    if (authRoutes.some((r) => r.path === route.path) && isAuthenticated) {
      return <Navigate to="/" replace />;
    }

    return (
      <Suspense fallback={<LoadingFallback />}>
        <Component />
      </Suspense>
    );
  };

  return (
    <>
      <PageLoader isLoading={!appReady || authLoading} message="Loading app..." />
      <Router>
        <Routes>
          {/* Admin routes - NOT wrapped in Layout */}
          {adminRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={renderRoute(route, 'admin')} />
          ))}

          {/* All other routes wrapped in Layout */}
          {publicRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={
              <Layout>
                {renderRoute(route)}
              </Layout>
            } />
          ))}

          {/* Auth routes */}
          {authRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={
              <Layout>
                {renderRoute(route)}
              </Layout>
            } />
          ))}

          {/* Protected routes */}
          {protectedRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={
              <Layout>
                {renderRoute(route)}
              </Layout>
            } />
          ))}

          {/* Seller routes */}
          {sellerRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={
              <Layout>
                {renderRoute(route, 'seller')}
              </Layout>
            } />
          ))}

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <Layout>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600">Page not found</p>
                  </div>
                </div>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

/**
 * Main App component - provides Redux store
 */
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
