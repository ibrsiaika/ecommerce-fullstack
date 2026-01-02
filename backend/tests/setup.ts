import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from 'dotenv';

// load test env
config({ path: '.env.test' });

process.env.NODE_ENV = 'test';

jest.setTimeout(30000);

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  try {
    // disconnect any existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // spin up in-memory mongodb so tests don't need a local mongod
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
  } catch (error) {
    console.error('Failed to start in-memory MongoDB:', error);
    process.exit(1);
  }
}, 60000);

afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Failed to disconnect:', error);
  }
}, 30000);

afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (_error) {
    // ignore cleanup errors
  }
});

// keep error logs visible during tests so failures are debuggable
// but suppress noisy info/debug logs
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  // keep warn and error visible
};
