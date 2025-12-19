import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import api from '../services/api';
import { FiArrowRight, FiCheck, FiTruck, FiHeadphones, FiShield } from 'react-icons/fi';

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
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 opacity-50"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />
        
        <div className="container relative px-2 sm:px-4 lg:px-8 py-12 sm:py-20 lg:py-28">
          <div className="max-w-4xl">
            
            {/* Hero Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 sm:mb-8 tracking-tight">
              {isAuthenticated ? (
                <span>Welcome, <span className="bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent">{user?.name}</span></span>
              ) : (
                <span>Discover.<br className="hidden sm:block" />Simplify.<br className="hidden sm:block" />Elevate.</span>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl leading-relaxed mb-8 sm:mb-10 font-light">
              Thoughtfully curated essentials for the modern lifestyle. Quality, simplicity, and exceptional service in every interaction.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
              <Link 
                to="/products" 
                className="group relative bg-black text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-semibold text-center overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2">
                  Explore Collection
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link 
                to={isAuthenticated ? '/orders' : '/register'} 
                className="group relative border-2 border-gray-900 text-gray-900 px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-semibold text-center hover:bg-gray-50 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity" />
                <span className="relative">
                  {isAuthenticated ? 'View Orders' : 'Create Account'}
                </span>
              </Link>
            </div>
          </div>

          {/* Trust Indicators - Enhanced */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-14 sm:mt-16 lg:mt-20">
            {[
              { label: 'Fast Delivery', value: '2-3 Days', icon: FiTruck },
              { label: '24/7 Support', value: 'Always Ready', icon: FiHeadphones },
              { label: 'Quality Assured', value: '100% Guaranteed', icon: FiShield },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="group bg-white border border-gray-200 p-6 sm:p-8 rounded-xl hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-black transition-colors duration-300">
                      <Icon className="w-6 h-6 text-gray-900 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide">{stat.label}</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section - Enhanced */}
      <section className="relative py-14 sm:py-20 lg:py-24 border-t border-gray-200">
        <div className="container px-2 sm:px-4 lg:px-8">
          {/* Section Header */}
          <div className="mb-10 sm:mb-12 lg:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-4">
              <FiCheck className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-semibold text-gray-900">HANDPICKED</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              Featured Products
            </h2>
            <p className="text-base text-gray-600 font-light">
              Discover our most loved and bestselling items
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-80 sm:h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-2xl"
                >
                  {/* Product Image Container */}
                  <div className="relative overflow-hidden bg-gray-100 h-52 sm:h-64 rounded-xl">
                    <img
                      src={product.images?.[0] || 'https://picsum.photos/400'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-block bg-white/95 backdrop-blur text-gray-900 text-xs sm:text-sm px-3 py-1.5 rounded-full font-semibold">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="bg-white p-5 sm:p-6 rounded-b-xl">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 group-hover:line-clamp-1 transition-all">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-3 mb-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
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

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </p>
                      <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* View All Link */}
          <div className="text-center mt-12 sm:mt-14">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-gray-900 font-semibold hover:text-black transition-colors group"
            >
              View all products
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section - Redesigned */}
      <section className="py-14 sm:py-20 lg:py-24 bg-gray-50 border-y border-gray-200">
        <div className="container px-2 sm:px-4 lg:px-8">
          <div className="mb-10 sm:mb-12 lg:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full mb-4">
              <span className="text-lg">🛍️</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900">CATEGORIES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Shop by Category
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              { title: 'Electronics', emoji: '📱', description: 'Latest gadgets & devices', color: 'from-blue-50' },
              { title: 'Clothing', emoji: '👕', description: 'Stylish apparel', color: 'from-pink-50' },
              { title: 'Home & Garden', emoji: '🏠', description: 'Make your space beautiful', color: 'from-green-50' },
              { title: 'Sports', emoji: '⚽', description: 'Active lifestyle gear', color: 'from-orange-50' },
              { title: 'Books', emoji: '📚', description: 'Knowledge & inspiration', color: 'from-purple-50' },
              { title: 'More', emoji: '✨', description: 'And much more...', color: 'from-yellow-50' },
            ].map((category) => (
              <Link
                key={category.title}
                to={`/products?category=${category.title}`}
                className={`group relative bg-gradient-to-br ${category.color} to-white border border-gray-200 rounded-xl p-6 sm:p-8 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden`}
              >
                {/* Animated background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100 to-transparent opacity-0 group-hover:opacity-100 rounded-full blur-2xl transition-opacity duration-500 -mr-16 -mt-16" />
                
                <div className="relative z-10">
                  <p className="text-4xl sm:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                    {category.emoji}
                  </p>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-5">{category.description}</p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 group-hover:gap-3 transition-all">
                    <span>Explore</span>
                    <FiArrowRight />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Enhanced */}
      <section className="relative py-14 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl" />
        
        <div className="container relative px-2 sm:px-4 lg:px-8 z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-12 sm:mb-14">
            Why choose us?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {[
              {
                icon: FiCheck,
                title: 'Curated Selection',
                description: 'Hand-picked products that meet our high standards for quality and design.'
              },
              {
                icon: FiTruck,
                title: 'Fast Shipping',
                description: 'Quick delivery to get you what you love, when you need it.'
              },
              {
                icon: FiShield,
                title: 'Easy Returns',
                description: '30-day returns policy for complete peace of mind.'
              },
              {
                icon: FiHeadphones,
                title: 'Expert Support',
                description: 'Our team is here to help with any questions or concerns.'
              },
            ].map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={benefit.title} 
                  className="group border border-gray-700 rounded-xl p-7 sm:p-8 hover:border-gray-500 hover:bg-gray-900/50 transition-all duration-300"
                >
                  <div className="p-3 bg-white/10 rounded-lg w-fit mb-4 group-hover:bg-white/20 transition-colors">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-sm sm:text-base text-gray-400">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section - Premium */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container px-2 sm:px-4 lg:px-8">
          <div className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-200 to-transparent opacity-10 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Ready to discover something amazing?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 font-light leading-relaxed">
                Browse our complete collection and find the perfect products for your lifestyle. Quality, simplicity, and exceptional service await.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-black text-white px-8 sm:px-12 py-4 sm:py-5 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
              >
                Start Shopping
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

