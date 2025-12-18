import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import Reviews from './Reviews';
import api from '../services/api';

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
  reviews: Review[];
}

interface Review {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.getProduct(id!);
      const payload = response.data.data || response.data;
      setProduct(payload);
      setError(null);
    } catch (err) {
      setError('Failed to fetch product');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0] || 'https://picsum.photos/400',
      quantity: quantity,
      countInStock: product.countInStock
    }));

    // Show success message
    alert(`Added ${quantity} ${product.name} to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black mb-6"></div>
          </div>
          <p className="text-xl text-gray-600 font-semibold">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">😕</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Product not found</h2>
          <p className="text-lg text-gray-600">{error || 'The product you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:gap-12 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4 sm:space-y-6">
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gray-100 h-64 sm:h-80 lg:h-[500px] shadow-xl">
              <img
                src={product.images[selectedImage] || 'https://picsum.photos/600'}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 flex gap-2 sm:gap-3 flex-wrap">
                <span className="pill bg-white text-gray-900 font-semibold text-xs sm:text-sm">{product.category}</span>
                <span className="pill bg-black text-white font-semibold text-xs sm:text-sm">SKU {product.sku}</span>
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`overflow-hidden rounded-lg sm:rounded-xl border-2 transition-all h-16 sm:h-20 lg:h-24 ${
                      selectedImage === index 
                        ? 'border-black shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 leading-tight mb-2 sm:mb-4">{product.name}</h1>
              <p className="text-sm sm:text-base lg:text-xl text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Rating */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-lg sm:text-xl lg:text-2xl ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-base sm:text-lg lg:text-lg text-gray-900 font-bold ml-2">{product.rating.toFixed(1)}</span>
                <span className="text-xs sm:text-sm text-gray-600 font-semibold">({product.numReviews})</span>
              </div>
              <div className={`pill font-bold text-xs sm:text-sm lg:text-lg ${product.countInStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.countInStock > 0 ? `✓ ${product.countInStock} in stock` : '✗ Out of stock'}
              </div>
            </div>

            {/* Pricing */}
            <div className="surface p-4 sm:p-6 lg:p-8 rounded-lg sm:rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
              <div className="flex items-baseline gap-2 sm:gap-4 flex-wrap">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                {product.comparePrice && (
                  <span className="text-lg sm:text-2xl text-red-600 line-through font-semibold">${product.comparePrice.toFixed(2)}</span>
                )}
              </div>
              {product.comparePrice && (
                <p className="text-green-600 font-bold mt-2 sm:mt-3 text-sm sm:text-base">
                  Save ${(product.comparePrice - product.price).toFixed(2)} ({Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%)
                </p>
              )}
            </div>

            {/* Add to Cart */}
            {product.countInStock > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <label htmlFor="quantity" className="text-base sm:text-lg font-bold text-gray-900">
                    Quantity:
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="input rounded-lg sm:rounded-xl py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-lg font-semibold border-2 border-gray-300"
                  >
                    {[...Array(Math.min(product.countInStock, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full btn btn-primary rounded-lg sm:rounded-xl py-3 sm:py-4 text-base sm:text-lg lg:text-xl font-bold shadow-lg hover:shadow-xl transition-shadow"
                >
                  + Add to Bag
                </button>
              </div>
            )}

            {/* Product Details Box */}
            <div className="surface p-4 sm:p-6 lg:p-8 rounded-lg sm:rounded-2xl border border-gray-200">
              <div className="grid grid-cols-2 gap-4 sm:gap-8">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-widest">Category</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900 mt-1 sm:mt-2">{product.category}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-widest">SKU</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900 mt-1 sm:mt-2">{product.sku}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20 surface p-6 sm:p-8 lg:p-12 rounded-lg sm:rounded-2xl border border-gray-200">
          <Reviews
            productId={product._id}
            reviews={product.reviews}
            onReviewAdded={fetchProduct}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
