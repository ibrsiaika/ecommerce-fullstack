import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import AdminDashboard from '../../components/AdminDashboard';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/slices/authSlice';
import cartReducer from '../../store/slices/cartSlice';
import productReducer from '../../store/slices/productSlice';

describe('AdminDashboard', () => {
  const createMockStore = () => {
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
            email: 'admin@example.com',
            name: 'Test Admin',
            role: 'admin' as const,
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

  // Mock fetch
  beforeEach(() => {
    window.fetch = vi.fn((url: string) => {
      if (url.includes('/api/orders')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: [
              {
                _id: '1',
                orderNumber: '001',
                totalPrice: 100,
                isPaid: true,
                orderStatus: 'delivered',
                createdAt: new Date().toISOString(),
              }
            ]
          })
        } as Response);
      }
      if (url.includes('/api/products')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: [
              {
                _id: '1',
                name: 'Test Product',
                countInStock: 5,
                price: 50,
              }
            ]
          })
        } as Response);
      }
      if (url.includes('/api/users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: [{ _id: '1', name: 'Test User' }]
          })
        } as Response);
      }
      return Promise.reject('Unknown endpoint');
    }) as unknown as typeof window.fetch;
  });

  it('renders admin dashboard heading', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <AdminDashboard />
      </Provider>
    );

    const heading = await screen.findByText('Admin Dashboard');
    expect(heading).toBeInTheDocument();
  });

  it('renders all tab buttons', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <AdminDashboard />
      </Provider>
    );

    await screen.findByText('Admin Dashboard');
    
    expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /revenue/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /products/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sellers/i })).toBeInTheDocument();
  });

  it('shows overview tab by default', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <AdminDashboard />
      </Provider>
    );

    await screen.findByText('Admin Dashboard');
    expect(screen.getByText(/total orders/i)).toBeInTheDocument();
    expect(screen.getByText(/recent orders/i)).toBeInTheDocument();
  });

  it('switches to revenue tab when clicked', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <AdminDashboard />
      </Provider>
    );

    await screen.findByText('Admin Dashboard');
    
    const revenueBtn = screen.getByRole('button', { name: /revenue/i });
    fireEvent.click(revenueBtn);

    expect(screen.getByText(/revenue analytics/i)).toBeInTheDocument();
  });

  it('switches to products tab when clicked', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <AdminDashboard />
      </Provider>
    );

    await screen.findByText('Admin Dashboard');
    
    const productsBtn = screen.getByRole('button', { name: /products/i });
    fireEvent.click(productsBtn);

    expect(screen.getByText(/product performance/i)).toBeInTheDocument();
  });

  it('switches to sellers tab when clicked', async () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <AdminDashboard />
      </Provider>
    );

    await screen.findByText('Admin Dashboard');
    
    const sellersBtn = screen.getByRole('button', { name: /sellers/i });
    fireEvent.click(sellersBtn);

    expect(screen.getByText(/seller management/i)).toBeInTheDocument();
  });
});
