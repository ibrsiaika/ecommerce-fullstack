import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import api from '../services/api';
import { FiArrowRight } from 'react-icons/fi';

// Default fallback image for products without images
const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';

// Hero product showcase image - matching reference design
const HERO_IMAGE = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80';

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
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);

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

  // Preload hero image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setHeroImageLoaded(true);
    img.src = HERO_IMAGE;
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Hero Section - Split Layout matching reference */}
      <section className="relative overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 min-h-[580px] lg:min-h-[620px] items-center">
            {/* Left Content */}
            <div className="py-12 lg:py-20 lg:pr-8">
              {/* Main Heading - Exact style from reference */}
              <h1 className="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] font-semibold text-neutral-900 leading-[1.1] tracking-[-0.02em] mb-5">
                {isAuthenticated ? (
                  <>Welcome back,<br />{user?.name?.split(' ')[0]}.</>
                ) : (
                  <>Discover essentials<br />that feel inevitable.</>
                )}
              </h1>

              {/* Subtitle - Matching reference */}
              <p className="text-lg text-neutral-400 mb-10 max-w-md font-normal">
                Quality, simplicity, and exceptional service.
              </p>

              {/* CTAs - Exact button sizes from reference */}
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/products" 
                  className="inline-flex items-center justify-center gap-3 bg-neutral-900 text-white text-base font-medium rounded-full hover:bg-neutral-800 transition-colors"
                  style={{ padding: '18px 32px', minWidth: '220px' }}
                >
                  Explore Collections
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                {!isAuthenticated && (
                  <Link 
                    to="/register" 
                    className="inline-flex items-center justify-center bg-white text-neutral-900 text-base font-medium rounded-full border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
                    style={{ padding: '18px 32px', minWidth: '180px' }}
                  >
                    Create Account
                  </Link>
                )}
              </div>
            </div>

            {/* Right Image - Hero Product Showcase */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div 
                className="relative w-full h-[500px] rounded-3xl overflow-hidden"
                style={{ backgroundColor: '#e8e8e8' }}
              >
                {/* Loading skeleton */}
                {!heroImageLoaded && (
                  <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
                )}
                {/* Hero image */}
                <img
                  src={HERO_IMAGE}
                  alt="Featured products showcase"
                  className={`w-full h-full object-cover transition-opacity duration-500 ${heroImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setHeroImageLoaded(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Clean Grid with proper loading */}
      <section className="py-12 lg:py-16">
        <div className="container">
          {/* Products Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {loading ? (
              // Skeleton loading state
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="aspect-square bg-neutral-100 animate-pulse" />
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              // Empty state placeholder cards
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="aspect-square bg-neutral-50 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-neutral-100" />
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

// Product Card Component with lazy loading
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const imageSrc = imageError 
    ? FALLBACK_PRODUCT_IMAGE 
    : (product.images?.[0] || FALLBACK_PRODUCT_IMAGE);

  return (
    <Link
      to={`/products/${product._id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-neutral-50 overflow-hidden relative">
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-neutral-100 animate-pulse" />
        )}
        {/* Product image with lazy loading */}
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />
      </div>
    </Link>
  );
};

export default Home;

