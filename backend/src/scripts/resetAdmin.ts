import mongoose from 'mongoose';
import User from '../models/User';
import connectDB from '../config/database';

export const resetAdmin = async () => {
  try {
    await connectDB();
    
    // Delete existing admin user
    const deleted = await User.deleteOne({ email: 'admin@example.com' });
    if (deleted.deletedCount > 0) {
      console.log('✅ Deleted existing admin user');
    }
    
    // Create new admin user - User model will hash password in pre-save hook
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // User model will hash this in pre-save hook
      phone: '+1234567890',
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    });
    
    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error resetting admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run if executed directly
if (require.main === module) {
  resetAdmin();
}

export default resetAdmin;
