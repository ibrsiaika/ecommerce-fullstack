import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server';
import User from '../src/models/User';
import Product from '../src/models/Product';
import Order from '../src/models/Order';

const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ecommerce_test_orders';

describe('Order Endpoints', () => {
  let authToken: string;
  let adminToken: string;
  let productId: string;
  let orderId: string;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_TEST_URI);
  });

  beforeEach(async () => {
    // Clean up database
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    // Create regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123'
      });
    authToken = userResponse.body.token;

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });
    adminToken = adminResponse.body.token;

    // Create a test product
    const product = await Product.create({
      name: 'Test Product',
      description: 'A test product',
      price: 99.99,
      category: 'Electronics',
      countInStock: 10,
      images: ['test-image.jpg'],
      sku: 'TEST-SKU-001'
    });
    productId = (product._id as mongoose.Types.ObjectId).toString();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/orders', () => {
    it('should create order as authenticated user', async () => {
      const orderData = {
        orderItems: [
          {
            product: productId,
            name: 'Test Product',
            price: 99.99,
            quantity: 2,
            image: 'test-image.jpg'
          }
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        totalPrice: 199.98
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.totalPrice).toBe(199.98);
      orderId = response.body.data._id;
    });

    it('should not create order without authentication', async () => {
      const orderData = {
        orderItems: [
          {
            product: productId,
            name: 'Test Product',
            price: 99.99,
            quantity: 2,
            image: 'test-image.jpg'
          }
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        totalPrice: 199.98
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Not authorized');
    });

    it('should not create order with empty order items', async () => {
      const orderData = {
        orderItems: [],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        totalPrice: 0
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/orders/mine', () => {
    beforeEach(async () => {
      // Create an order for the user
      const orderData = {
        orderItems: [
          {
            product: productId,
            name: 'Test Product',
            price: 99.99,
            quantity: 1,
            image: 'test-image.jpg'
          }
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        totalPrice: 99.99
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);
      orderId = response.body.data._id;
    });

    it('should get user orders', async () => {
      const response = await request(app)
        .get('/api/orders/myorders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0]).toHaveProperty('totalPrice', 99.99);
    });

    it('should not get orders without authentication', async () => {
      const response = await request(app)
        .get('/api/orders/myorders')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Not authorized');
    });
  });

  describe('GET /api/orders/:id', () => {
    beforeEach(async () => {
      // Create an order
      const orderData = {
        orderItems: [
          {
            product: productId,
            name: 'Test Product',
            price: 99.99,
            quantity: 1,
            image: 'test-image.jpg'
          }
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        totalPrice: 99.99
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);
      orderId = response.body.data._id;
    });

    it('should get order by ID for owner', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id', orderId);
      expect(response.body.data).toHaveProperty('totalPrice', 99.99);
    });

    it('should get order by ID for admin', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id', orderId);
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/orders/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Order not found');
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    beforeEach(async () => {
      // Create an order
      const orderData = {
        orderItems: [
          {
            product: productId,
            name: 'Test Product',
            price: 99.99,
            quantity: 1,
            image: 'test-image.jpg'
          }
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        totalPrice: 99.99
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);
      orderId = response.body.data._id;
    });

    it('should update order status as admin', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'shipped' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderStatus).toBe('shipped');
    });

    it('should not update order status as regular user', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'shipped' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not authorized');
    });

    it('should not update order status without authentication', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .send({ status: 'shipped' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Not authorized');
    });
  });
});