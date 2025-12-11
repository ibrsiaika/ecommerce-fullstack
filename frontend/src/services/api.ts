import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type { AuthResponse, Product, Order } from '../types';

class ApiClient {
  private client: AxiosInstance;
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Clear auth data on 401
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  get(url: string) {
    return this.client.get(url);
  }

  post(url: string, data?: any) {
    return this.client.post(url, data);
  }

  put(url: string, data?: any) {
    return this.client.put(url, data);
  }

  delete(url: string) {
    return this.client.delete(url);
  }

  // Auth endpoints
  async register(data: { name: string; email: string; password: string }) {
    return this.client.post<AuthResponse>('/api/auth/register', data);
  }

  async login(data: { email: string; password: string }) {
    return this.client.post<AuthResponse>('/api/auth/login', data);
  }

  async logout() {
    return this.client.post('/api/auth/logout');
  }

  async getCurrentUser() {
    return this.client.get('/api/auth/me');
  }

  // Product endpoints
  async getProducts(
    page: number = 1,
    limit: number = 20,
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    search?: string
  ) {
    const params: any = { page, limit };
    if (category) params.category = category;
    if (minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== undefined) params.maxPrice = maxPrice;
    if (search) params.search = search;

    return this.client.get('/api/products', { params });
  }

  async getProduct(id: string) {
    return this.client.get<Product>(`/api/products/${id}`);
  }

  async searchProducts(query: string, limit: number = 10) {
    return this.client.get('/api/products/search', {
      params: { q: query, limit }
    });
  }

  async getFeaturedProducts(limit: number = 8) {
    return this.client.get('/api/products/featured', { params: { limit } });
  }

  async getCategories() {
    return this.client.get('/api/products/categories');
  }

  async getBrands() {
    return this.client.get('/api/products/brands');
  }

  async createProduct(data: Partial<Product>) {
    return this.client.post('/api/products', data);
  }

  async updateProduct(id: string, data: Partial<Product>) {
    return this.client.put(`/api/products/${id}`, data);
  }

  async deleteProduct(id: string) {
    return this.client.delete(`/api/products/${id}`);
  }

  async addProductReview(
    productId: string,
    data: { rating: number; comment: string }
  ) {
    return this.client.post(`/api/products/${productId}/reviews`, data);
  }

  // Order endpoints
  async createOrder(data: Partial<Order>) {
    return this.client.post('/api/orders', data);
  }

  async getOrder(id: string) {
    return this.client.get<Order>(`/api/orders/${id}`);
  }

  async getUserOrders(page: number = 1, limit: number = 10) {
    return this.client.get('/api/orders/my-orders', {
      params: { page, limit }
    });
  }

  async getAllOrders(page: number = 1, limit: number = 20) {
    return this.client.get('/api/orders', { params: { page, limit } });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.client.put(`/api/orders/${orderId}/status`, { status });
  }

  async processPayment(orderId: string, paymentData: any) {
    return this.client.post(`/api/orders/${orderId}/pay`, paymentData);
  }

  async cancelOrder(orderId: string) {
    return this.client.put(`/api/orders/${orderId}/cancel`);
  }

  // Upload endpoints
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.client.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  // User endpoints
  async updateProfile(data: any) {
    return this.client.put('/api/users/profile', data);
  }

  async changePassword(data: { oldPassword: string; newPassword: string }) {
    return this.client.put('/api/users/password', data);
  }

  async getUsers(page: number = 1, limit: number = 20) {
    return this.client.get('/api/users', { params: { page, limit } });
  }

  async updateUser(id: string, data: any) {
    return this.client.put(`/api/users/${id}`, data);
  }

  async deleteUser(id: string) {
    return this.client.delete(`/api/users/${id}`);
  }
}

export default new ApiClient();
