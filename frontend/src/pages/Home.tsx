import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import api from '../services/api';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  rating: number;
  numReviews: number;
  category: string;
}

const Home: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.getProducts(1, 6);
        setFeaturedProducts(response.data.data?.slice(0, 6) || []);
      } catch (error) {
        console.error('Failed to fetch featured products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="text-gray-900 bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container px-2 sm:px-4 lg:px-8 py-6 sm:py-12 lg:py-20">
          <div className="max-w-3xl">
            <span className="inline-block bg-black text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold mb-4 sm:mb-6">
              ✨ Welcome to our store
            </span>
            
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
              {isAuthenticated ? (
                <span>Welcome back, <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{user?.name}</span></span>
              ) : (
                <span>Shop minimal.<br className="hidden sm:block" /> Shop smart.</span>
              )}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl leading-relaxed mb-6 sm:mb-8">
              Carefully curated essentials for modern living. We focus on quality, simplicity, and exceptional service. Discover products you'll love.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link 
                to="/products" 
                className="bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-center hover:bg-gray-800 transition-colors shadow-lg"
              >
                Explore Collection
              </Link>
              <Link 
                to={isAuthenticated ? '/orders' : '/register'} 
                className="border-2 border-gray-900 text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-center hover:bg-gray-50 transition-colors"
              >
                {isAuthenticated ? 'View Orders' : 'Create Account'}
              </Link>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-12 lg:mt-16">
            {[
              { label: 'Fast Delivery', value: '2-3 days', icon: '🚀' },
              { label: '24/7 Support', value: 'Always here', icon: '💬' },
              { label: '100% Quality', value: 'Guaranteed', icon: '✓' },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 border border-gray-200 p-4 sm:p-6 rounded-lg sm:rounded-xl">
                <p className="text-2xl sm:text-3xl mb-2">{stat.icon}</p>
                <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide">{stat.label}</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-gray-50 border-t border-gray-200 py-8 sm:py-12 lg:py-16">
        <div className="container px-2 sm:px-4 lg:px-8">
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <span className="inline-block bg-black text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold mb-3 sm:mb-4">
              ⭐ FEATURED
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Popular Products
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Handpicked favorites from our collection
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg animate-pulse h-72 sm:h-96"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {featuredProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="relative overflow-hidden bg-gray-100 h-40 sm:h-56">
                    <img
                      src={product.images?.[0] || 'https://picsum.photos/400'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="inline-block bg-white text-gray-900 text-xs sm:text-sm px-2 py-1 rounded-full font-semibold">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-2 mb-3">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-xs ${
                              i < Math.floor(product.rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">({product.numReviews})</span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:mt-10">
            <Link
              to="/products"
              className="inline-block text-gray-900 font-semibold text-sm sm:text-base hover:text-black transition-colors"
            >
              View all products →
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 sm:py-12 lg:py-16 border-b border-gray-200">
        <div className="container px-2 sm:px-4 lg:px-8">
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <span className="inline-block bg-black text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold mb-3 sm:mb-4">
              🛍️ CATEGORIES
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Shop by Category
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              { title: 'Electronics', emoji: '📱', description: 'Latest gadgets & devices' },
              { title: 'Clothing', emoji: '👕', description: 'Stylish apparel' },
              { title: 'Home & Garden', emoji: '🏠', description: 'Make your space beautiful' },
              { title: 'Sports', emoji: '⚽', description: 'Active lifestyle gear' },
              { title: 'Books', emoji: '📚', description: 'Knowledge & inspiration' },
              { title: 'More', emoji: '✨', description: 'And much more...' },
            ].map((category) => (
              <Link
                key={category.title}
                to={`/products?category=${category.title}`}
                className="group border border-gray-200 rounded-lg p-5 sm:p-6 hover:bg-gray-50 transition-all duration-300"
              >
                <p className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {category.emoji}
                </p>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                  {category.title}
                </h3>
                <p className="text-sm text-gray-600">{category.description}</p>
                <p className="text-sm font-semibold text-gray-900 mt-4 group-hover:text-black transition-colors">
                  Browse → 
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gray-900 text-white py-8 sm:py-12 lg:py-16">
        <div className="container px-2 sm:px-4 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">
            Why shop with us?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              {
                title: 'Curated Selection',
                description: 'Hand-picked products that meet our high standards for quality and design.'
              },
              {
                title: 'Fast Shipping',
                description: 'Quick delivery to get you what you love, when you need it.'
              },
              {
                title: 'Easy Returns',
                description: '30-day returns policy for complete peace of mind.'
              },
              {
                title: 'Expert Support',
                description: 'Our team is here to help with any questions or concerns.'
              },
            ].map((benefit) => (
              <div key={benefit.title} className="border border-gray-700 rounded-lg p-5 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-sm sm:text-base text-gray-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container px-2 sm:px-4 lg:px-8">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg sm:rounded-xl p-6 sm:p-8 lg:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Ready to discover?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8">
              Browse our full collection and find the perfect products for your lifestyle.
            </p>
            <Link
              to="/products"
              className="inline-block bg-black text-white px-8 sm:px-12 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
