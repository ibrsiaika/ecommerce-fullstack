import mongoose from 'mongoose';
import User from '../models/User';
import connectDB from '../config/database';

export const seedAdmin = async () => {
  try {
    await connectDB();
    
    // Check if demo user already exists
    const existingDemo = await User.findOne({ email: 'user@example.com' });
    if (existingDemo) {
      console.log('✅ Demo user already exists');
      console.log('Email: user@example.com');
      console.log('Password: password123');
      mongoose.connection.close();
      return;
    }
    
    // Create demo user with correct field names
    const demoUser = new User({
      firstName: 'Demo',
      lastName: 'User',
      email: 'user@example.com',
      passwordHash: undefined, // Will be set by setPassword
      role: 'buyer',
      isEmailVerified: true,
      status: 'active'
    });
    
    // Use the setPassword method to properly hash
    await demoUser.setPassword('password123');
    await demoUser.save();
    
    console.log('✅ Demo user created successfully!');
    console.log('Email: user@example.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run if executed directly
if (require.main === module) {
  seedAdmin();
}

export default seedAdmin;
