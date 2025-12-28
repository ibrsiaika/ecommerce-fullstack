import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import api from '../services/api';
import { FiArrowRight, FiShoppingBag, FiStar, FiCheck } from 'react-icons/fi';

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
  countInStock?: number;
}

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);

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

  // Preload hero image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setHeroImageLoaded(true);
    img.src = HERO_IMAGE;
  }, []);

  const handleAddToCart = (product: Product) => {
    dispatch(
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || FALLBACK_PRODUCT_IMAGE,
        quantity: 1,
        countInStock: product.countInStock || 10,
      })
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Clean Split Layout */}
      <section className="relative overflow-hidden bg-gray-50">
        {/* Decorative background elements - matching Login/Register style */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-100 rounded-full -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gray-100 rounded-full -ml-36 -mb-36 pointer-events-none" />
        
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 min-h-[580px] lg:min-h-[620px] items-center">
            {/* Left Content */}
            <div className="py-12 lg:py-20 lg:pr-8">
              {/* Brand Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm mb-8">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-black to-gray-800 flex items-center justify-center text-white text-xs font-bold">
                  E
                </div>
                <span className="text-sm font-medium text-gray-700">Premium Quality</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
                {isAuthenticated ? (
                  <>Welcome back,<br /><span className="text-gray-600">{user?.name?.split(' ')[0]}.</span></>
                ) : (
                  <>Discover<br /><span className="text-gray-600">Quality Essentials.</span></>
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-gray-500 mb-10 max-w-md leading-relaxed">
                Curated products with exceptional quality, simplicity, and outstanding service. Shop with confidence.
              </p>

              {/* CTAs - Matching Login/Register button style */}
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/products" 
                  className="inline-flex items-center justify-center gap-3 bg-black text-white text-base font-semibold rounded-xl hover:bg-gray-900 active:scale-95 transition-all duration-200 py-4 px-8 shadow-lg"
                >
                  Explore Collections
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                {!isAuthenticated && (
                  <Link 
                    to="/register" 
                    className="inline-flex items-center justify-center bg-white text-gray-900 text-base font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 py-4 px-8"
                  >
                    Create Account
                  </Link>
                )}
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <FiCheck className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Free Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">30-Day Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Secure Payment</span>
                </div>
              </div>
            </div>

            {/* Right Image - Hero Product Showcase */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-gray-200">
                {/* Loading skeleton */}
                {!heroImageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
                {/* Hero image */}
                <img
                  src={HERO_IMAGE}
                  alt="Featured products showcase"
                  className={`w-full h-full object-cover transition-opacity duration-500 ${heroImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setHeroImageLoaded(true)}
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">FEATURED COLLECTION</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Trending Products</h2>
            <p className="text-gray-500 max-w-md mx-auto">Discover our most popular items, handpicked for quality and style.</p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              // Skeleton loading state
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <div className="aspect-square bg-gray-100 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                    <div className="h-6 bg-gray-100 rounded animate-pulse w-1/3" />
                  </div>
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))
            ) : (
              // Empty state
              <div className="col-span-full text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                  <FiShoppingBag className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-500 mb-6">Check back soon for new arrivals.</p>
                <Link 
                  to="/products" 
                  className="inline-flex items-center gap-2 text-black font-semibold hover:underline"
                >
                  Browse all products
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* View All Button */}
          {featuredProducts.length > 0 && (
            <div className="text-center mt-12">
              <Link 
                to="/products" 
                className="inline-flex items-center justify-center gap-2 bg-black text-white text-base font-semibold rounded-xl hover:bg-gray-900 active:scale-95 transition-all duration-200 py-4 px-8"
              >
                View All Products
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20 bg-gray-50 border-t border-gray-100">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Premium Quality',
                description: 'Every product is carefully selected for exceptional quality and durability.',
                icon: '✨'
              },
              {
                title: 'Fast Delivery',
                description: 'Free shipping on orders over $50. Quick and reliable delivery to your door.',
                icon: '🚚'
              },
              {
                title: 'Easy Returns',
                description: '30-day hassle-free returns. Shop with confidence knowing you are covered.',
                icon: '↩️'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Product Card Component with proper styling matching Login/Register
const ProductCard: React.FC<{ product: Product; onAddToCart: () => void }> = ({ product, onAddToCart }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  
  const imageSrc = imageError 
    ? FALLBACK_PRODUCT_IMAGE 
    : (product.images?.[0] || FALLBACK_PRODUCT_IMAGE);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300">
      <Link to={`/products/${product._id}`}>
        <div className="aspect-square bg-gray-50 overflow-hidden relative">
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
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
          
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-sm">
              {product.category}
            </span>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center">
            <FiStar className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-medium text-gray-700 ml-1">{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-gray-400">({product.numReviews} reviews)</span>
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            className={`inline-flex items-center justify-center gap-1.5 text-sm font-semibold rounded-xl transition-all duration-200 py-2.5 px-4 ${
              addedToCart 
                ? 'bg-green-600 text-white' 
                : 'bg-black text-white hover:bg-gray-900 active:scale-95'
            }`}
          >
            {addedToCart ? (
              <>
                <FiCheck className="w-4 h-4" />
                Added
              </>
            ) : (
              <>
                <FiShoppingBag className="w-4 h-4" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;

