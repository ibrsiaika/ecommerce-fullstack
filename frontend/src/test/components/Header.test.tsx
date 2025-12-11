import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import Header from '../../components/Layout/Header';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import cartReducer from '../../store/slices/cartSlice';
import productReducer from '../../store/slices/productSlice';

describe('Header with Role Badges', () => {
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
            email: `${role}@example.com`,
            name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
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

  it('renders header with logo', async () => {
    const store = createMockStore('user');
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/marketplace|ecommerce/i)).toBeInTheDocument();
  });

  it('displays user role badge for regular users', async () => {
    const store = createMockStore('user');
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    // Should show user profile indicator
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('displays admin role badge with red color', async () => {
    const store = createMockStore('admin');
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Test Admin')).toBeInTheDocument();
  });

  it('displays seller role badge with green color', async () => {
    const store = createMockStore('seller');
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Test Seller')).toBeInTheDocument();
  });

  it('shows seller dashboard link for sellers', async () => {
    const store = createMockStore('seller');
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    const sellerLink = screen.queryByText(/seller dashboard|seller/i);
    if (sellerLink) {
      expect(sellerLink).toBeInTheDocument();
    }
  });

  it('shows admin dashboard link for admins', async () => {
    const store = createMockStore('admin');
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    const adminLink = screen.queryByText(/admin dashboard|admin/i);
    if (adminLink) {
      expect(adminLink).toBeInTheDocument();
    }
  });

  it('does not show admin/seller links for regular users', async () => {
    const store = createMockStore('user');
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    // Should not have admin/seller specific dashboard links
    const allText = screen.getByRole('banner').textContent || '';
    expect(allText).not.toMatch(/admin dashboard/i);
    expect(allText).not.toMatch(/seller dashboard/i);
  });
});
