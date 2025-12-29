import mongoose from 'mongoose';
import User from '../models/User';
import connectDB from '../config/database';

export const seedAdmin = async () => {
  try {
    await connectDB();
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email: admin@example.com');
      console.log('Password: admin1234567890');
      mongoose.connection.close();
      return;
    }
    
    // Create admin user - DO NOT hash password here, User model will do it in pre-save hook
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin1234567890', // User model will hash this in pre-save hook
      phone: '+1234567890',
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    });
    
    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin1234567890');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run if executed directly
if (require.main === module) {
  seedAdmin();
}

export default seedAdmin;
