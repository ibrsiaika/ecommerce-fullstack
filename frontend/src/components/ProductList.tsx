import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import api from '../services/api';

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
      setError(err.response?.data?.error || 'We could not load products just now.');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      setCategories(response.data.data || response.data);
    } catch (err) {
      // keep quiet, categories are additive
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
        image: product.images?.[0] || 'https://picsum.photos/400',
        quantity: 1,
        countInStock: product.countInStock,
      })
    );
  };

  const renderCards = () => {
    if (status === 'loading' && products.length === 0) {
      return (
        <>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`placeholder-${index}`} className="surface p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl animate-pulse">
              <div className="h-40 sm:h-56 lg:h-72 rounded-lg bg-gray-300 mb-3 sm:mb-4" />
              <div className="h-4 bg-gray-300 rounded mb-2" />
              <div className="h-3 bg-gray-300 rounded w-3/4" />
            </div>
          ))}
        </>
      );
    }

    if (products.length === 0) {
      return (
        <div className="col-span-full surface p-6 sm:p-12 text-center rounded-lg sm:rounded-2xl">
          <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">📭</div>
          <p className="text-lg sm:text-3xl font-bold mb-2 sm:mb-3 text-gray-900">No products found.</p>
          <p className="text-sm sm:text-lg text-gray-600 mb-6 sm:mb-10 max-w-2xl mx-auto">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
            <button
              className="btn btn-primary py-2 sm:py-3 px-6 sm:px-10 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl"
              onClick={() => {
                setFilters({ ...filters, search: '', category: '' });
                setPage(1);
              }}
            >
              Reset Filters
            </button>
            <Link to="/" className="btn btn-outline py-2 sm:py-3 px-6 sm:px-10 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl">
              Go to Home
            </Link>
          </div>
        </div>
      );
    }

    return products.map((product) => (
      <div
        key={product._id}
        className="surface flex flex-col rounded-lg sm:rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
      >
        {/* Image Container */}
        <div className="relative overflow-hidden bg-gray-100 h-40 sm:h-56 lg:h-64 flex items-center justify-center">
          <img
            src={product.images?.[0] || 'https://picsum.photos/400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Category Badge */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
            <span className="inline-block bg-white text-gray-900 text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-semibold">
              {product.category}
            </span>
          </div>
          {/* Stock Badge */}
          {product.countInStock > 0 && (
            <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3">
              <span className="inline-block bg-green-500 text-white text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-semibold">
                ✓ {product.countInStock}
              </span>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="flex flex-col flex-1 p-3 sm:p-4 lg:p-5">
          {/* Product Title */}
          <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 leading-snug line-clamp-2 mb-1 sm:mb-2">
            {product.name}
          </h3>

          {/* Description - Hide on mobile */}
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3 hidden sm:block">
            {product.description}
          </p>

          {/* Price Section */}
          <div className="mb-2 sm:mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.comparePrice && (
                <span className="text-xs sm:text-sm text-red-600 line-through font-medium">
                  ${product.comparePrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3 sm:mb-4 text-xs sm:text-sm">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-sm sm:text-base ${
                    i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-gray-600 font-medium">
              ({product.numReviews})
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto pt-2 sm:pt-3">
            <Link
              to={`/products/${product._id}`}
              className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 border-2 border-gray-900 bg-white text-gray-900 rounded-lg sm:rounded-lg font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-colors text-center"
            >
              View
            </Link>
            <button
              onClick={() => handleAddToCart(product)}
              disabled={product.countInStock === 0}
              className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                product.countInStock > 0
                  ? 'bg-black text-white hover:bg-gray-800 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {product.countInStock > 0 ? '+ Add' : 'Out'}
            </button>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container px-2 sm:px-4 lg:px-8">
        {/* Header Section */}
        <div className="py-3 sm:py-6 lg:py-12">
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            <div>
              <h1 className="text-xl sm:text-3xl lg:text-5xl font-bold text-gray-900">Shop</h1>
              <p className="text-xs sm:text-base lg:text-lg text-gray-600 mt-1 sm:mt-2">Discover our collection</p>
            </div>

            {/* Search and Filter */}
            <div className="space-y-2 sm:space-y-0 sm:flex sm:gap-2 lg:gap-4">
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full input pr-8 sm:pr-10 lg:pr-14 rounded-md sm:rounded-lg lg:rounded-xl py-1.5 sm:py-2 lg:py-3 text-xs sm:text-sm lg:text-base"
                />
                <button
                  type="submit"
                  className="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 rounded text-xs bg-black text-white px-1.5 sm:px-3 py-1 font-bold hover:bg-gray-800 transition-colors flex-shrink-0"
                >
                  🔍
                </button>
              </form>
              <select
                value={filters.category}
                onChange={(e) => {
                  setFilters({ ...filters, category: e.target.value });
                  setPage(1);
                }}
                className="input rounded-md sm:rounded-lg lg:rounded-xl py-1.5 sm:py-2 lg:py-3 text-xs sm:text-sm lg:text-base font-medium w-full sm:w-auto min-w-[130px] sm:min-w-[160px]"
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Info */}
          <div className="mt-2 sm:mt-4 lg:mt-6 flex flex-wrap items-center gap-1 text-xs sm:text-sm font-semibold">
            <span className="pill">Results</span>
            <span className="text-gray-700 text-xs">
              {visibleRange.start}–{visibleRange.end} of {pagination.total}
            </span>
            {status === 'error' && <span className="text-red-600 text-xs">Error: {error}</span>}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid gap-3 sm:gap-4 lg:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6 sm:mb-8 lg:mb-12">
          {renderCards()}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mb-4 sm:mb-6 lg:mb-10">
            <div className="surface flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 lg:gap-4 px-2 sm:px-4 lg:px-8 py-2 sm:py-3 lg:py-5 rounded-md sm:rounded-lg lg:rounded-xl shadow-lg border border-gray-200">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded px-1.5 sm:px-3 lg:px-5 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm lg:text-base font-bold text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                ←
              </button>
              <span className="text-gray-900 font-bold text-xs sm:text-sm lg:text-base">
                {page}/{pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="rounded px-1.5 sm:px-3 lg:px-5 py-1 sm:py-1.5 lg:py-2 text-xs sm:text-sm lg:text-base font-bold text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
