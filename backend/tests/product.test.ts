import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server';
import User from '../src/models/User';
import Product from '../src/models/Product';

// product endpoint tests — uses shared in-memory MongoDB from setup.ts

describe('Product Endpoints', () => {
  let authToken: string;
  let adminToken: string;
  let productId: string;

  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});

    // create a regular buyer via the public register endpoint
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123'
      });
    authToken = userResponse.body.token;

    // create an admin: register, then promote role directly in the DB
    const adminReg = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123'
      });

    await User.updateOne(
      { email: 'admin@example.com' },
      { $set: { role: 'admin' } }
    );

    // login again to get a fresh token carrying the admin role
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });
    adminToken = adminLogin.body.token;

    // create a test product as admin
    const productResponse = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        category: 'Electronics',
        countInStock: 10,
        images: ['test-image.jpg'],
        sku: 'TEST-SKU-001'
      });
    productId = productResponse.body.data._id;
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0]).toHaveProperty('name', 'Test Product');
    });

    it('should search products by name', async () => {
      const response = await request(app)
        .get('/api/products?search=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(1);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=Electronics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(1);
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(app)
        .get('/api/products?category=NonExistent')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get product by ID', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', 'Test Product');
      expect(response.body.data).toHaveProperty('price', 99.99);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/products', () => {
    it('should create product as admin', async () => {
      const productData = {
        name: 'New Product',
        description: 'A new test product',
        price: 149.99,
        category: 'Books',
        countInStock: 5,
        images: ['new-product.jpg'],
        sku: 'NEW-PRODUCT-001'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', productData.name);
      expect(response.body.data).toHaveProperty('price', productData.price);
    });

    it('should not create product as regular user', async () => {
      const productData = {
        name: 'New Product',
        description: 'A new test product',
        price: 149.99,
        category: 'Books',
        countInStock: 5,
        images: ['new-product.jpg'],
        sku: 'NEW-PRODUCT-002'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should not create product without authentication', async () => {
      const productData = {
        name: 'New Product',
        description: 'A new test product',
        price: 149.99,
        category: 'Books',
        countInStock: 5,
        images: ['new-product.jpg'],
        sku: 'NEW-PRODUCT-003'
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });

  describe('POST /api/products/:id/reviews', () => {
    it('should add review as authenticated user', async () => {
      const reviewData = {
        rating: 5,
        comment: 'Great product!'
      };

      const response = await request(app)
        .post(`/api/products/${productId}/reviews`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Review added successfully');
    });

    it('should not add review without authentication', async () => {
      const reviewData = {
        rating: 5,
        comment: 'Great product!'
      };

      const response = await request(app)
        .post(`/api/products/${productId}/reviews`)
        .send(reviewData)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });

    it('should not add duplicate review from same user', async () => {
      const reviewData = {
        rating: 5,
        comment: 'Great product!'
      };

      // Add first review
      await request(app)
        .post(`/api/products/${productId}/reviews`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(201);

      // Try to add second review from same user
      const response = await request(app)
        .post(`/api/products/${productId}/reviews`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product already reviewed');
    });
  });
});
