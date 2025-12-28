import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import api from '../services/api';
import { FiArrowRight, FiSearch } from 'react-icons/fi';

// Default fallback image for products without images
const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';

// Hero product showcase image
const HERO_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

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
        const response = await api.getProducts(1, 4);
        setFeaturedProducts(response.data.data?.slice(0, 4) || []);
      } catch (error) {
        console.error('Failed to fetch featured products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Hero Section - Split Layout */}
      <section className="relative">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-0 min-h-[600px] lg:min-h-[700px] items-center">
            {/* Left Content */}
            <div className="py-16 lg:py-24 lg:pr-16">
              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-neutral-900 leading-tight tracking-tight mb-6">
                {isAuthenticated ? (
                  <>Welcome back,<br />{user?.name?.split(' ')[0]}.</>
                ) : (
                  <>Discover essentials<br />that feel inevitable.</>
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-neutral-500 mb-10 max-w-md">
                Quality, simplicity, and exceptional service.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/products" 
                  className="inline-flex items-center gap-2 bg-neutral-900 text-white px-8 py-4 rounded-full font-medium hover:bg-neutral-800 transition-colors"
                >
                  Explore Collections
                  <FiArrowRight className="w-4 h-4" />
                </Link>
                {!isAuthenticated && (
                  <Link 
                    to="/register" 
                    className="inline-flex items-center gap-2 bg-white text-neutral-900 px-8 py-4 rounded-full font-medium border border-neutral-300 hover:border-neutral-400 transition-colors"
                  >
                    Create Account
                  </Link>
                )}
              </div>
            </div>

            {/* Right Image */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-3xl overflow-hidden">
                <img
                  src={HERO_IMAGE}
                  alt="Featured products"
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Clean Grid */}
      <section className="py-16 lg:py-24">
        <div className="container">
          {/* Products Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {loading ? (
              // Skeleton loading
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden">
                  <div className="aspect-square bg-neutral-100 animate-pulse" />
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-neutral-50 overflow-hidden">
                    <img
                      src={product.images?.[0] || FALLBACK_PRODUCT_IMAGE}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
              ))
            ) : (
              // Empty state with placeholder cards
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden">
                  <div className="aspect-square bg-neutral-100 flex items-center justify-center">
                    <FiSearch className="w-8 h-8 text-neutral-300" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

