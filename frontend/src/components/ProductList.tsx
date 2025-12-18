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

const PlaceholderCard = () => (
  <div className="surface h-full p-4 animate-pulse">
    <div className="h-40 rounded-lg bg-gray-200" />
    <div className="mt-4 h-4 rounded bg-gray-200 w-2/3" />
    <div className="mt-2 h-3 rounded bg-gray-200 w-1/2" />
    <div className="mt-4 flex gap-2">
      <div className="h-10 flex-1 rounded bg-gray-200" />
      <div className="h-10 flex-1 rounded bg-gray-200" />
    </div>
  </div>
);

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
        image: product.images?.[0] || 'https://via.placeholder.com/400',
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
            <PlaceholderCard key={`placeholder-${index}`} />
          ))}
        </>
      );
    }

    if (products.length === 0) {
      return (
        <div className="col-span-full surface p-10 text-center">
          <p className="text-xl font-semibold mb-2 text-gray-900">No products found.</p>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <div className="flex justify-center gap-3">
            <button
              className="btn btn-primary rounded-lg"
              onClick={() => {
                setFilters({ ...filters, search: '', category: '' });
                setPage(1);
              }}
            >
              Reset filters
            </button>
            <Link to="/products" className="btn btn-outline rounded-lg">
              Browse all
            </Link>
          </div>
        </div>
      );
    }

    return products.map((product) => (
      <div key={product._id} className="surface group p-4 flex flex-col">
        <div className="relative overflow-hidden rounded-lg bg-gray-200">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 bottom-3 flex items-center gap-2">
            <span className="pill">{product.category}</span>
            {product.countInStock > 0 && <span className="pill">{product.countInStock} in stock</span>}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 leading-tight">{product.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
              {product.comparePrice && (
                <p className="text-xs text-gray-400 line-through">${product.comparePrice.toFixed(2)}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
              <span className="ml-2">({product.numReviews})</span>
            </div>
            <span className="text-xs text-gray-500">SKU {product.sku}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            to={`/products/${product._id}`}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Details
          </Link>
          <button
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              product.countInStock > 0
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            disabled={product.countInStock === 0}
            onClick={() => handleAddToCart(product)}
          >
            {product.countInStock > 0 ? 'Add to bag' : 'Out of stock'}
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="container py-10">
      <div className="surface p-6 lg:p-8 mb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="pill bg-white/5 text-white border-white/10">Live inventory</p>
            <h1 className="text-3xl font-semibold mt-3">The calmest way to browse products.</h1>
            <p className="text-white/60">
              Filter without page jumps, see truthful inventory, and get curated suggestions when lists are empty.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-[1fr,1fr] lg:w-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search quietly..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input pr-12"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
              >
                Go
              </button>
            </form>
            <select
              value={filters.category}
              onChange={(e) => {
                setFilters({ ...filters, category: e.target.value });
                setPage(1);
              }}
              className="input"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/70">
          <span className="pill bg-white/5 text-white border-white/10">Results</span>
          <span>
            Showing {visibleRange.start} – {visibleRange.end} of {pagination.total} items
          </span>
          {status === 'error' && <span className="text-amber-200">Retrying… {error}</span>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{renderCards()}</div>

      {pagination.pages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="surface flex items-center gap-2 px-4 py-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white/80 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
            >
              Prev
            </button>
            <span className="text-white/70">
              Page {page} / {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white/80 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
