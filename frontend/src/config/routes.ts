import { lazy } from 'react';
import { Home, Login, Register, Profile } from '../pages';

// Lazy load heavy components
const ProductList = lazy(() => import('../components/ProductList'));
const ProductDetail = lazy(() => import('../components/ProductDetail'));
const Cart = lazy(() => import('../components/Cart'));
const Checkout = lazy(() => import('../components/Checkout'));
const OrderHistory = lazy(() => import('../components/OrderHistory'));
const OrderDetail = lazy(() => import('../components/OrderDetail'));
const AdminConfig = lazy(() => import('../components/AdminConfig'));
const AdminDashboard = lazy(() => import('../components/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('../components/admin/AdminProducts'));
const AdminOrders = lazy(() => import('../components/admin/AdminOrders'));
const AdminUsers = lazy(() => import('../components/admin/AdminUsers'));
const SellerDashboard = lazy(() => import('../components/seller/SellerDashboard'));
const SellerProducts = lazy(() => import('../components/seller/SellerProducts'));
const SellerOrders = lazy(() => import('../components/seller/SellerOrders'));
const SellerRegistration = lazy(() => import('../pages/SellerRegistration'));

/**
 * Route configuration interface
 */
export interface RouteConfig {
  path: string;
  component: any;
  protected?: boolean;
  adminOnly?: boolean;
  sellerOnly?: boolean;
}

/**
 * Public routes - accessible to everyone
 */
export const publicRoutes: RouteConfig[] = [
  { path: '/', component: Home },
  { path: '/products', component: ProductList },
  { path: '/products/:id', component: ProductDetail },
  { path: '/cart', component: Cart },
  { path: '/seller/register', component: SellerRegistration }
];

/**
 * Auth routes - redirect if already authenticated
 */
export const authRoutes: RouteConfig[] = [
  { path: '/login', component: Login },
  { path: '/register', component: Register }
];

/**
 * Protected routes - require authentication
 */
export const protectedRoutes: RouteConfig[] = [
  { path: '/profile', component: Profile, protected: true },
  { path: '/checkout', component: Checkout, protected: true },
  { path: '/orders', component: OrderHistory, protected: true },
  { path: '/order/:id', component: OrderDetail, protected: true }
];

/**
 * Admin routes - require admin role
 */
export const adminRoutes: RouteConfig[] = [
  { path: '/admin', component: AdminConfig, adminOnly: true },
  { path: '/admin/config', component: AdminConfig, adminOnly: true },
  { path: '/admin/dashboard', component: AdminDashboard, adminOnly: true },
  { path: '/admin/products', component: AdminProducts, adminOnly: true },
  { path: '/admin/orders', component: AdminOrders, adminOnly: true },
  { path: '/admin/users', component: AdminUsers, adminOnly: true }
];

/**
 * Seller routes - require seller role
 */
export const sellerRoutes: RouteConfig[] = [
  { path: '/seller', component: SellerDashboard, sellerOnly: true },
  { path: '/seller/products', component: SellerProducts, sellerOnly: true },
  { path: '/seller/orders', component: SellerOrders, sellerOnly: true },
];