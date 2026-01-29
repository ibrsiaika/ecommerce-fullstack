import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import WishlistButton from './WishlistButton';
import api from '../services/api';
import { FiArrowRight, FiCheck, FiPlus, FiSearch, FiRefreshCw, FiLoader } from 'react-icons/fi';

// Default fallback image for products without images
const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';

interface Product {
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  countInStock: number;
  rating: number;
  numReviews: number;
  sku: string;
  slug?: string;
  comparePrice?: number;
}

// Lazy loaded image component with loading state
const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      setLoaded(true);
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      {!loaded && !error && (
        <div className="absolute inset-0 skeleton animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={error ? FALLBACK_PRODUCT_IMAGE : src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      />
    </div>
  );
};

const ProductList: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'loadingMore' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12,
  });
  
  // Get initial search from URL params
  const urlSearch = searchParams.get('search') || '';
  
  const [filters, setFilters] = useState({
    search: urlSearch,
    category: '',
    limit: 12,
  });
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Sync filters with URL search params
  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    if (searchFromUrl !== filters.search) {
      setFilters(prev => ({ ...prev, search: searchFromUrl }));
    }
  }, [searchParams]);

  // Update URL when search filter changes
  const handleSearchChange = (newSearch: string) => {
    setFilters(prev => ({ ...prev, search: newSearch }));
    if (newSearch) {
      setSearchParams({ search: newSearch });
    } else {
      setSearchParams({});
    }
  };

  const fetchProducts = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      setStatus(append ? 'loadingMore' : 'loading');
      const response = await api.getProducts(
        pageNum,
        filters.limit,
        filters.category || undefined,
        undefined,
        undefined,
        filters.search || undefined
      );

      const payload = response.data;
      const newProducts = payload.data || [];
      
      if (append) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }
      
      const paginationData = payload.pagination || { 
        page: pageNum, 
        pages: 1, 
        total: newProducts.length, 
        limit: filters.limit 
      };
      
      setPagination(paginationData);
      setHasMore(pageNum < paginationData.pages);
      setStatus('idle');
      setError(null);
    } catch (err: any) {
      setStatus('error');
      setError(err.response?.data?.error || 'Unable to load products');
    }
  }, [filters.limit, filters.category, filters.search]);

  useEffect(() => {
    setPage(1);
    setProducts([]);
    fetchProducts(1, false);
  }, [filters.search, filters.category, filters.limit, fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && status === 'idle') {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProducts(nextPage, true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, status, page, fetchProducts]);

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      setCategories(response.data.data || response.data);
    } catch (err) {
      // Silent fail for categories
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to page 1 and clear products - useEffect will trigger fetch
    setPage(1);
    setProducts([]);
  };

  const handleAddToCart = (product: Product) => {
    dispatch(
      addToCart({
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || FALLBACK_PRODUCT_IMAGE,
        quantity: 1,
        countInStock: product.countInStock,
      })
    );
    setAddedToCart(product._id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const renderProducts = () => {
    // Initial Loading State
    if (status === 'loading' && products.length === 0) {
      return (
        <div className="masonry-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className="card p-0 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="skeleton aspect-[4/5]" />
              <div className="p-5 space-y-3">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
                <div className="flex gap-2 mt-4">
                  <div className="skeleton h-3 w-3" />
                  <div className="skeleton h-3 w-3" />
                  <div className="skeleton h-3 w-3" />
                  <div className="skeleton h-3 w-3" />
                  <div className="skeleton h-3 w-3" />
                </div>
                <div className="skeleton h-6 w-1/3 mt-2" />
                <div className="flex gap-2 mt-4">
                  <div className="skeleton h-10 flex-1" />
                  <div className="skeleton h-10 flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Empty State
    if (products.length === 0) {
      return (
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-100 rounded-full mb-6">
            <FiSearch className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-2xl font-semibold text-neutral-900 mb-3">No products found</h3>
          <p className="text-neutral-500 mb-8 max-w-md mx-auto">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <button
            onClick={() => {
              handleSearchChange('');
              setFilters(prev => ({ ...prev, category: '' }));
              setPage(1);
            }}
            className="btn btn-secondary inline-flex items-center gap-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      );
    }

    // Products Grid - Masonry style with staggered animations
    return (
      <>
        <div className="masonry-grid">
          {products.map((product, index) => (
            <div
              key={product._id}
              className="card card-interactive relative p-0 overflow-hidden group animate-fade-in"
              style={{ animationDelay: `${(index % 12) * 30}ms` }}
            >
              {/* Image */}
              <Link to={`/products/${product._id}`} className="block">
                <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
                  <LazyImage
                    src={product.images?.[0] || FALLBACK_PRODUCT_IMAGE}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category */}
                  <div className="absolute top-3 left-3">
                    <span className="pill bg-white/90 backdrop-blur-sm text-neutral-700 text-xs shadow-sm">
                      {product.category}
                    </span>
                  </div>
                  
                  {/* Stock Status */}
                  {product.countInStock > 0 ? (
                    <div className="absolute bottom-3 right-3">
                      <span className="pill bg-neutral-900/90 text-white text-xs shadow-sm">
                        <FiCheck className="w-3 h-3" />
                        In Stock
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-neutral-950/60 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white font-semibold px-4 py-2 bg-neutral-900/80 rounded-full">Out of Stock</span>
                    </div>
                  )}
                  
                  {/* Discount Badge */}
                  {product.comparePrice && product.comparePrice > product.price && (
                    <div className="absolute bottom-3 left-3">
                      <span className="pill bg-neutral-900/90 text-white text-xs shadow-sm">
                        -{Math.round((1 - product.price / product.comparePrice) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Wishlist heart — top-right corner, sibling of Link so the
                  button stays valid HTML (not nested inside an <a>). */}
              <div className="absolute top-3 right-3 z-10">
                <WishlistButton productId={product._id} variant="icon" />
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5">
                <Link to={`/products/${product._id}`}>
                  <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-2 group-hover:text-neutral-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < Math.floor(product.rating)
                            ? 'text-neutral-900'
                            : 'text-neutral-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">
                    {product.rating.toFixed(1)} ({product.numReviews})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-xl font-bold text-neutral-950">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-sm text-neutral-400 line-through">
                      ${product.comparePrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/products/${product._id}`}
                    className="flex-1 btn btn-secondary py-2.5 text-sm justify-center group/btn font-medium border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-200 active:scale-95"
                  >
                    View
                    <FiArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.countInStock === 0}
                    className={`flex-1 btn py-2.5 text-sm justify-center font-medium transition-all duration-300 active:scale-95 ${
                      addedToCart === product._id
                        ? 'bg-neutral-800 hover:bg-neutral-900 text-white shadow-lg shadow-black/20 border border-neutral-900'
                        : 'bg-black text-white hover:bg-neutral-900 shadow-lg shadow-black/20 border border-black hover:border-neutral-900'
                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:shadow-none`}
                  >
                    {addedToCart === product._id ? (
                      <>
                        <FiCheck className="w-4 h-4 mr-1.5" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <FiPlus className="w-4 h-4 mr-1.5 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Infinite Scroll Loading Indicator */}
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {status === 'loadingMore' && (
            <div className="flex items-center gap-3 text-neutral-500">
              <FiLoader className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Loading more products...</span>
            </div>
          )}
          {!hasMore && products.length > 0 && (
            <p className="text-sm text-neutral-400">You've seen all products</p>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container section">
        {/* Header */}
        <div className="mb-8">
          <p className="text-meta text-neutral-500 mb-2">COLLECTION</p>
          <h1 className="text-headline text-neutral-950 mb-2">Shop</h1>
          <p className="text-body">Browse our curated selection of quality products</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="input pl-10"
            />
          </form>
          <select
            value={filters.category}
            onChange={(e) => {
              setFilters({ ...filters, category: e.target.value });
              setPage(1);
            }}
            className="input w-full sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-neutral-500">
            {pagination.total > 0 ? (
              <>Showing {products.length} of {pagination.total} products</>
            ) : (
              'No products found'
            )}
          </p>
          {status === 'loading' && products.length > 0 && (
            <span className="flex items-center gap-2 text-sm text-neutral-500">
              <FiLoader className="w-4 h-4 animate-spin" />
              Refreshing...
            </span>
          )}
        </div>

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-fade-in">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => fetchProducts(1, false)}
              className="mt-2 text-sm text-red-600 font-medium hover:text-red-800 underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {/* Products */}
        {renderProducts()}
      </div>
    </div>
  );
};

export default ProductList;
