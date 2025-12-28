import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import api from '../services/api';
import { FiArrowRight, FiCheck, FiPlus, FiSearch } from 'react-icons/fi';

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

const ProductList: React.FC = () => {
  const dispatch = useAppDispatch();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12,
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    limit: 12,
  });

  const visibleRange = useMemo(() => {
    const start = pagination.total ? (page - 1) * pagination.limit + 1 : 0;
    const end = pagination.total ? Math.min(page * pagination.limit, pagination.total) : 0;
    return { start, end };
  }, [page, pagination.limit, pagination.total]);

  useEffect(() => {
    fetchProducts();
  }, [page, filters.search, filters.category, filters.limit]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setStatus('loading');
      const response = await api.getProducts(
        page,
        filters.limit,
        filters.category || undefined,
        undefined,
        undefined,
        filters.search || undefined
      );

      const payload = response.data;
      setProducts(payload.data || []);
      setPagination(payload.pagination || { page: 1, pages: 1, total: payload.data?.length || 0, limit: filters.limit });
      setStatus('idle');
      setError(null);
    } catch (err: any) {
      setStatus('error');
      setError(err.response?.data?.error || 'Unable to load products');
    }
  };

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
    setPage(1);
    fetchProducts();
  };

  const handleAddToCart = (product: Product) => {
    dispatch(
      addToCart({
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || 'FALLBACK_PRODUCT_IMAGE',
        quantity: 1,
        countInStock: product.countInStock,
      })
    );
  };

  const renderProducts = () => {
    // Loading State
    if (status === 'loading' && products.length === 0) {
      return (
        <div className="masonry-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-0 overflow-hidden">
              <div className="skeleton aspect-[4/5]" />
              <div className="p-5 space-y-3">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-6 w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Empty State
    if (products.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-6">
            <FiSearch className="w-7 h-7 text-neutral-400" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No products found</h3>
          <p className="text-neutral-500 mb-8 max-w-md mx-auto">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <button
            onClick={() => {
              setFilters({ ...filters, search: '', category: '' });
              setPage(1);
            }}
            className="btn btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      );
    }

    // Products Grid - Masonry style
    return (
      <div className="masonry-grid">
        {products.map((product) => (
          <div
            key={product._id}
            className="card card-interactive p-0 overflow-hidden group"
          >
            {/* Image */}
            <Link to={`/products/${product._id}`} className="block">
              <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
                <img
                  src={product.images?.[0] || 'FALLBACK_PRODUCT_IMAGE'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Category */}
                <div className="absolute top-3 left-3">
                  <span className="pill bg-white/90 backdrop-blur-sm text-neutral-700 text-xs">
                    {product.category}
                  </span>
                </div>
                
                {/* Stock Status */}
                {product.countInStock > 0 ? (
                  <div className="absolute top-3 right-3">
                    <span className="pill bg-green-600/90 text-white text-xs">
                      <FiCheck className="w-3 h-3" />
                      In Stock
                    </span>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-neutral-950/60 flex items-center justify-center">
                    <span className="text-white font-medium">Out of Stock</span>
                  </div>
                )}
              </div>
            </Link>

            {/* Content */}
            <div className="p-4 sm:p-5">
              <Link to={`/products/${product._id}`}>
                <h3 className="font-medium text-neutral-900 mb-1 line-clamp-2 group-hover:text-neutral-600 transition-colors">
                  {product.name}
                </h3>
              </Link>

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
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-lg font-semibold text-neutral-950">
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
                  className="flex-1 btn btn-secondary py-2.5 text-sm justify-center"
                >
                  View
                  <FiArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.countInStock === 0}
                  className="flex-1 btn btn-primary py-2.5 text-sm justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiPlus className="w-4 h-4 mr-1" />
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
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
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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
              <>Showing {visibleRange.start}–{visibleRange.end} of {pagination.total} products</>
            ) : (
              'No products found'
            )}
          </p>
          {status === 'loading' && products.length > 0 && (
            <span className="text-sm text-neutral-500">Loading...</span>
          )}
        </div>

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Products */}
        {renderProducts()}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-2 bg-neutral-50 rounded-lg p-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-white rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-neutral-900">
                {page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-white rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
