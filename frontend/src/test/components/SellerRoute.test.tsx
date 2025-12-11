import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import SellerRoute from '../../components/SellerRoute';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import cartReducer from '../../store/slices/cartSlice';
import productReducer from '../../store/slices/productSlice';

// Mock child component
const MockComponent = () => <div>Protected Content</div>;

describe('SellerRoute', () => {
  const createMockStore = (role: 'user' | 'seller' | 'admin') => {
    return configureStore({
      reducer: {
        auth: authReducer,
        cart: cartReducer,
        products: productReducer,
      },
      preloadedState: {
        auth: {
          user: {
            id: '123',
            email: 'seller@example.com',
            name: 'Test Seller',
            role: role,
            avatar: 'https://example.com/avatar.png',
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
          },
          token: 'mock-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
        cart: {
          items: [],
          totalPrice: 0,
          totalQuantity: 0,
        },
        products: {
          products: [],
          loading: false,
          error: null,
          currentProduct: null,
          filteredProducts: [],
        },
      },
    });
  };

  it('renders protected content when user is a seller', () => {
    const store = createMockStore('seller');
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SellerRoute>
            <MockComponent />
          </SellerRoute>
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders protected content when user is an admin', () => {
    const store = createMockStore('admin');
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SellerRoute>
            <MockComponent />
          </SellerRoute>
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to unauthorized page when user is a regular user', () => {
    const store = createMockStore('user');
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SellerRoute>
            <MockComponent />
          </SellerRoute>
        </BrowserRouter>
      </Provider>
    );

    // Should not render protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects when user is not authenticated', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        cart: cartReducer,
        products: productReducer,
      },
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        },
        cart: {
          items: [],
          totalPrice: 0,
          totalQuantity: 0,
        },
        products: {
          products: [],
          loading: false,
          error: null,
          currentProduct: null,
          filteredProducts: [],
        },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <SellerRoute>
            <MockComponent />
          </SellerRoute>
        </BrowserRouter>
      </Provider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
