import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import api from '../services/api';
import { FiArrowRight, FiCheck, FiPackage, FiHeadphones, FiShield } from 'react-icons/fi';

// Default fallback image for products without images
const FALLBACK_PRODUCT_IMAGE = FALLBACK_PRODUCT_IMAGE;

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
        const response = await api.getProducts(1, 8);
        setFeaturedProducts(response.data.data?.slice(0, 8) || []);
      } catch (error) {
        console.error('Failed to fetch featured products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section - Minimal & Precise */}
      <section className="section">
        <div className="container">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <p className="text-meta mb-4 text-neutral-500">CURATED ESSENTIALS</p>
            
            {/* Main Heading */}
            <h1 className="text-display text-neutral-950 mb-6">
              {isAuthenticated ? (
                <>Welcome back, {user?.name?.split(' ')[0]}</>
              ) : (
                <>Quality products,<br />thoughtfully selected</>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-body max-w-xl mb-10">
              A refined collection of products chosen for quality, design, and value. 
              Simple shopping, exceptional service.
            </p>

            {/* CTAs - Clear hierarchy */}
            <div className="flex flex-wrap gap-3">
              <Link 
                to="/products" 
                className="btn btn-primary px-8 py-3.5 text-base"
              >
                Shop Collection
                <FiArrowRight className="ml-2 w-4 h-4" />
              </Link>
              {!isAuthenticated && (
                <Link 
                  to="/register" 
                  className="btn btn-secondary px-8 py-3.5 text-base"
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>

          {/* Trust Indicators - Minimal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 pt-16 border-t border-neutral-200">
            {[
              { icon: FiPackage, title: 'Fast Delivery', desc: '2-3 business days' },
              { icon: FiHeadphones, title: '24/7 Support', desc: 'Always available' },
              { icon: FiShield, title: 'Quality Guarantee', desc: '30-day returns' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 py-2">
                <div className="p-2.5 bg-neutral-100 rounded-lg">
                  <item.icon className="w-5 h-5 text-neutral-700" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 text-sm">{item.title}</p>
                  <p className="text-sm text-neutral-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Structured Grid */}
      <section className="section bg-neutral-50">
        <div className="container">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-meta text-neutral-500 mb-2">FEATURED</p>
              <h2 className="text-headline text-neutral-950">New Arrivals</h2>
            </div>
            <Link 
              to="/products" 
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-950 transition-colors"
            >
              View all
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="masonry-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card p-0 overflow-hidden">
                  <div className="skeleton h-64" />
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="masonry-grid">
              {featuredProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="card card-interactive p-0 overflow-hidden group"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
                    <img
                      src={product.images?.[0] || FALLBACK_PRODUCT_IMAGE}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Category pill */}
                    <div className="absolute top-4 left-4">
                      <span className="pill bg-white/90 backdrop-blur-sm text-neutral-700">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-medium text-neutral-900 mb-1 line-clamp-1 group-hover:text-neutral-700 transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-xs ${
                              i < Math.floor(product.rating)
                                ? 'text-amber-400'
                                : 'text-neutral-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-neutral-500">({product.numReviews})</span>
                    </div>
                    
                    {/* Price */}
                    <p className="text-lg font-semibold text-neutral-950">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-neutral-500">No products available</p>
            </div>
          )}

          {/* Mobile View All */}
          <div className="mt-8 text-center sm:hidden">
            <Link 
              to="/products" 
              className="btn btn-secondary"
            >
              View All Products
              <FiArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories - Clean & Structured */}
      <section className="section">
        <div className="container">
          <div className="mb-10">
            <p className="text-meta text-neutral-500 mb-2">BROWSE</p>
            <h2 className="text-headline text-neutral-950">Shop by Category</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Electronics', count: '120+ items', href: '/products?category=Electronics' },
              { title: 'Clothing', count: '85+ items', href: '/products?category=Clothing' },
              { title: 'Home & Living', count: '64+ items', href: '/products?category=Home' },
              { title: 'Sports', count: '42+ items', href: '/products?category=Sports' },
              { title: 'Books', count: '156+ items', href: '/products?category=Books' },
              { title: 'Accessories', count: '73+ items', href: '/products?category=Accessories' },
            ].map((category) => (
              <Link
                key={category.title}
                to={category.href}
                className="group p-6 lg:p-8 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <h3 className="font-semibold text-neutral-900 mb-1 group-hover:text-neutral-700">
                  {category.title}
                </h3>
                <p className="text-sm text-neutral-500">{category.count}</p>
                <FiArrowRight className="w-4 h-4 text-neutral-400 mt-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition - Minimal Dark Section */}
      <section className="section bg-neutral-950 text-white">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-headline text-white mb-6">
              Why customers choose us
            </h2>
            <p className="text-neutral-400 mb-12 text-lg">
              We focus on what matters: quality products, fair prices, and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FiCheck, title: 'Curated Quality', desc: 'Every product meets our standards' },
              { icon: FiPackage, title: 'Fast Shipping', desc: 'Free delivery on orders over $50' },
              { icon: FiShield, title: 'Easy Returns', desc: '30-day hassle-free returns' },
              { icon: FiHeadphones, title: 'Expert Support', desc: 'Real humans, real help' },
            ].map((item) => (
              <div key={item.title} className="p-6 border border-neutral-800 rounded-xl">
                <item.icon className="w-5 h-5 text-neutral-400 mb-4" />
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Clean */}
      <section className="section">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-headline text-neutral-950 mb-4">
              Ready to explore?
            </h2>
            <p className="text-body mb-8">
              Browse our complete collection and find exactly what you're looking for.
            </p>
            <Link
              to="/products"
              className="btn btn-primary px-10 py-4 text-base"
            >
              Start Shopping
              <FiArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

