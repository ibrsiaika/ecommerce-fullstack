import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Set test timeout
jest.setTimeout(30000);

const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ecommerce_test';

beforeAll(async () => {
  try {
    // Disconnect if already connected
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Connect to test database
    await mongoose.connect(MONGODB_TEST_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Test DB connected');
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    process.exit(1);
  }
}, 30000);

afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch (error) {
    console.error('Failed to disconnect:', error);
    process.exit(1);
  }
}, 10000);

afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    // Ignore cleanup errors
  }
});

// Mock console to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};