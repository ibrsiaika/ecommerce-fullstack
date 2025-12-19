import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import Reviews from './Reviews';
import api from '../services/api';
import { FiShoppingBag, FiCheck, FiTruck, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

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
          <div className="inline-block mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-black"></div>
          </div>
          <p className="text-xl text-gray-600 font-semibold">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-7xl mb-6">📦</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Product not found</h2>
          <p className="text-lg text-gray-600 mb-8">{error || 'The product you are looking for does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-50 rounded-full -mr-48 -mt-48 pointer-events-none" />
      
      <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative">
        <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:gap-16 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4 sm:space-y-6">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square shadow-xl group">
              <img
                src={product.images[selectedImage] || 'https://picsum.photos/600'}
                alt={product.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Category & SKU Badges */}
              <div className="absolute bottom-4 left-4 flex gap-3 flex-wrap">
                <span className="px-4 py-2 rounded-full bg-white text-gray-900 font-semibold text-sm shadow-lg backdrop-blur-sm">
                  {product.category}
                </span>
                <span className="px-4 py-2 rounded-full bg-black text-white font-semibold text-sm shadow-lg">
                  SKU {product.sku}
                </span>
              </div>
              
              {/* Stock Badge */}
              <div className="absolute top-4 right-4">
                {product.countInStock > 0 ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/90 text-white font-semibold text-sm backdrop-blur-sm shadow-lg">
                    <FiCheck size={18} />
                    In Stock
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-full bg-red-500/90 text-white font-semibold text-sm backdrop-blur-sm shadow-lg">
                    Out of Stock
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 h-24 w-24 rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                      selectedImage === index 
                        ? 'border-black shadow-lg scale-105 ring-2 ring-black ring-offset-2' 
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
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-black"></span>
                {product.category}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-2xl ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-lg font-bold text-gray-900">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-600 font-medium">({product.numReviews} reviews)</span>
              </div>
            </div>

            {/* Price Section */}
            <div className="space-y-4 p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-5xl sm:text-6xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-base text-green-600 font-semibold">
                <FiCheck size={20} />
                Free shipping on orders over $50
              </div>
            </div>

            {/* Add to Cart Section */}
            {product.countInStock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label htmlFor="quantity" className="text-base font-semibold text-gray-900 whitespace-nowrap">
                    Quantity:
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="px-4 py-3 text-base font-semibold border-2 border-gray-300 rounded-xl focus:border-black focus:outline-none transition-colors bg-white"
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
                  className="w-full py-4 px-6 text-lg font-semibold rounded-xl bg-black text-white hover:bg-gray-900 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 group shadow-lg hover:shadow-xl"
                >
                  <FiShoppingBag size={22} />
                  Add to Bag
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <FiTruck className="text-gray-900 flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="font-semibold text-gray-900">Fast Shipping</p>
                  <p className="text-sm text-gray-600">2-3 business days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiCheck className="text-gray-900 flex-shrink-0 mt-1" size={24} />
                <div>
                  <p className="font-semibold text-gray-900">Quality Guaranteed</p>
                  <p className="text-sm text-gray-600">30-day returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20 pt-16 border-t border-gray-200">
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
