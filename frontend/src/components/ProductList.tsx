import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  countInStock: number;
  rating: number;
  numReviews: number;
  sku: string;
  slug: string;
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

const ProductList: React.FC = () => {
  const dispatch = useAppDispatch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, search, category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const response = await axios.get<ProductsResponse>(
        `${API_BASE_URL}/products?${params.toString()}`
      );
      
      if (response.data.success) {
        setProducts(response.data.data);
        setPagination(response.data.pagination);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/categories`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleCategoryChange = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0] || 'https://via.placeholder.com/400',
      quantity: 1,
      countInStock: product.countInStock
    }));
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Products</h1>
      
      {/* Filters and Search */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="flex">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
              <img
                src={product.images[0] || 'https://via.placeholder.com/400'}
                alt={product.name}
                className="h-48 w-full object-cover object-center group-hover:opacity-75"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-gray-900">
                  ${product.price.toFixed(2)}
                </p>
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-1 text-sm text-gray-600">
                    ({product.numReviews})
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.countInStock > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex space-x-2">
                  <Link
                    to={`/products/${product._id}`}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors text-center"
                  >
                    View Details
                  </Link>
                  <button
                    className={`flex-1 px-4 py-2 rounded-md font-medium ${
                      product.countInStock > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={product.countInStock === 0}
                    onClick={() => handleAddToCart(product)}
                  >
                    {product.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {[...Array(pagination.pages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === pageNumber
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pagination.pages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Results Info */}
      <div className="mt-4 text-center text-sm text-gray-600">
        Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} products
      </div>
    </div>
  );
};

export default ProductList;