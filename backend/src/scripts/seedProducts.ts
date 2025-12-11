import mongoose from 'mongoose';
import Product, { IReview } from '../models/Product';
import User from '../models/User';
import connectDB from '../config/database';

// Sample product data
const sampleProducts = [
  {
    name: 'iPhone 14 Pro',
    description: 'The most Pro iPhone yet. Featuring the A16 Bionic chip, Pro camera system, and stunning Super Retina XDR display.',
    price: 999,
    comparePrice: 1099,
    category: 'Electronics',
    subcategory: 'Smartphones',
    brand: 'Apple',
    countInStock: 50,
    isActive: true,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    ],
    tags: ['smartphone', 'apple', 'ios', 'premium'],
    weight: 0.206,
    dimensions: {
      length: 147.5,
      width: 71.5,
      height: 7.85
    }
  },
  {
    name: 'MacBook Air M2',
    description: 'Supercharged by M2 chip. The redesigned MacBook Air is more portable than ever and weighs just 2.7 pounds.',
    price: 1199,
    comparePrice: 1299,
    category: 'Electronics',
    subcategory: 'Laptops',
    brand: 'Apple',
    countInStock: 25,
    isActive: true,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    ],
    tags: ['laptop', 'apple', 'macbook', 'ultrabook'],
    weight: 1.24
  },
  {
    name: 'Nike Air Max 270',
    description: 'The Nike Air Max 270 delivers visible Air cushioning and all-day comfort in a sleek, modern design.',
    price: 150,
    comparePrice: 180,
    category: 'Clothing',
    subcategory: 'Shoes',
    brand: 'Nike',
    countInStock: 100,
    isActive: true,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    ],
    tags: ['shoes', 'nike', 'sneakers', 'athletic'],
    weight: 0.8
  },
  {
    name: 'The Psychology of Money',
    description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel. A bestselling book about financial psychology.',
    price: 14.99,
    comparePrice: 18.99,
    category: 'Books',
    subcategory: 'Finance',
    brand: 'Harriman House',
    countInStock: 200,
    isActive: true,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    ],
    tags: ['book', 'finance', 'psychology', 'bestseller'],
    weight: 0.3
  },
  {
    name: 'Gaming Chair Pro',
    description: 'Ergonomic gaming chair with RGB lighting, lumbar support, and premium leather upholstery.',
    price: 299,
    comparePrice: 399,
    category: 'Home & Garden',
    subcategory: 'Furniture',
    brand: 'ProGamer',
    countInStock: 30,
    isActive: true,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1541558869434-2840d308329a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    ],
    tags: ['chair', 'gaming', 'furniture', 'ergonomic'],
    weight: 25
  },
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling headphones with 30-hour battery life and crystal-clear audio quality.',
    price: 199,
    comparePrice: 249,
    category: 'Electronics',
    subcategory: 'Audio',
    brand: 'SoundTech',
    countInStock: 75,
    isActive: true,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    ],
    tags: ['headphones', 'wireless', 'audio', 'noise-cancelling'],
    weight: 0.25
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Eco-friendly yoga mat with superior grip and cushioning. Perfect for all types of yoga and exercise.',
    price: 49.99,
    comparePrice: 69.99,
    category: 'Sports',
    subcategory: 'Fitness',
    brand: 'ZenFlow',
    countInStock: 150,
    isActive: true,
    isFeatured: false,
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    ],
    tags: ['yoga', 'fitness', 'exercise', 'eco-friendly'],
    weight: 1.2
  },
  {
    name: 'Smart Watch Series 8',
    description: 'Advanced health monitoring, GPS tracking, and seamless connectivity in a sleek design.',
    price: 399,
    comparePrice: 449,
    category: 'Electronics',
    subcategory: 'Wearables',
    brand: 'TechWear',
    countInStock: 60,
    isActive: true,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    ],
    tags: ['smartwatch', 'fitness', 'health', 'wearable'],
    weight: 0.045
  }
];

export const seedProducts = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('✅ Cleared existing products');
    
    // Get a user to assign as creator (admin user)
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin user first.');
      return;
    }
    
    // Add creator to each product
    const productsWithCreator = sampleProducts.map(product => ({
      ...product,
      createdBy: adminUser._id
    }));
    
    // Insert sample products
    const createdProducts = await Product.insertMany(productsWithCreator);
    console.log(`✅ Seeded ${createdProducts.length} products`);
    
    // Add some reviews to products
    const reviewsData = [
      {
        user: adminUser._id,
        name: adminUser.name,
        rating: 5,
        comment: 'Excellent product! Highly recommended.',
        createdAt: new Date()
      },
      {
        user: adminUser._id,
        name: adminUser.name,
        rating: 4,
        comment: 'Great quality and fast delivery.',
        createdAt: new Date()
      }
    ];
    
    // Add reviews to first few products
    for (let i = 0; i < Math.min(4, createdProducts.length); i++) {
      const product = createdProducts[i];
      const reviewData: IReview = {
        user: adminUser._id as mongoose.Types.ObjectId,
        name: adminUser.name,
        rating: reviewsData[i % reviewsData.length].rating,
        comment: reviewsData[i % reviewsData.length].comment,
        createdAt: new Date()
      } as IReview;
      product.reviews = [reviewData];
      await product.save();
    }
    
    console.log('✅ Added sample reviews');
    console.log('🎉 Product seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedProducts();
}