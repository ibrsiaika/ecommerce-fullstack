import React from 'react';
import { Navigate } from 'react-router-dom';

// Pages
import { Home, Login, Register, Profile } from '../pages';

// Components
import PrivateRoute from '../components/PrivateRoute';
import AdminRoute from '../components/AdminRoute';
import SellerRoute from '../components/SellerRoute';
import ProductList from '../components/ProductList';
import ProductDetail from '../components/ProductDetail';
import Cart from '../components/Cart';
import Checkout from '../components/Checkout';
import OrderDetail from '../components/OrderDetail';
import OrderHistory from '../components/OrderHistory';
import AdminDashboard from '../components/AdminDashboard';
import AdminMetrics from '../components/AdminMetrics';
import AdminOrders from '../components/AdminOrders';
import AdminUsers from '../components/AdminUsers';
import SellerDashboard from '../components/SellerDashboard';

/**
 * Route interface
 */
export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
}

/**
 * Public routes - accessible to everyone
 */
export const publicRoutes: RouteConfig[] = [
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/products',
    element: <ProductList />
  },
  {
    path: '/products/:id',
    element: <ProductDetail />
  },
  {
    path: '/cart',
    element: <Cart />
  }
];

/**
 * Auth routes - redirect if already authenticated
 */
export const authRoutes: RouteConfig[] = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  }
];

/**
 * Protected routes - require authentication
 */
export const protectedRoutes: RouteConfig[] = [
  {
    path: '/profile',
    element: <PrivateRoute><Profile /></PrivateRoute>
  },
  {
    path: '/checkout',
    element: <PrivateRoute><Checkout /></PrivateRoute>
  },
  {
    path: '/orders',
    element: <PrivateRoute><OrderHistory /></PrivateRoute>
  },
  {
    path: '/order/:id',
    element: <PrivateRoute><OrderDetail /></PrivateRoute>
  }
];

/**
 * Admin routes - require admin role
 */
export const adminRoutes: RouteConfig[] = [
  {
    path: '/admin',
    element: <AdminRoute><AdminDashboard /></AdminRoute>
  },
  {
    path: '/admin/metrics',
    element: <AdminRoute><AdminMetrics /></AdminRoute>
  },
  {
    path: '/admin/orders',
    element: <AdminRoute><AdminOrders /></AdminRoute>
  },
  {
    path: '/admin/users',
    element: <AdminRoute><AdminUsers /></AdminRoute>
  }
];

/**
 * Seller routes - require seller role
 */
export const sellerRoutes: RouteConfig[] = [
  {
    path: '/seller',
    element: <SellerRoute><SellerDashboard /></SellerRoute>
  }
];

/**
 * All routes combined
 */
export const allRoutes: RouteConfig[] = [
  ...publicRoutes,
  ...authRoutes,
  ...protectedRoutes,
  ...adminRoutes,
  ...sellerRoutes,
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
];
