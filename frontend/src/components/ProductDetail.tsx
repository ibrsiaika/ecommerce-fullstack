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
      image: product.images[0] || 'https://via.placeholder.com/400',
      quantity: quantity,
      countInStock: product.countInStock
    }));

    // Show success message
    alert(`Added ${quantity} ${product.name} to cart!`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-xl">{error || 'Product not found'}</div>
      </div>
    );
  }

  return (
    <div className="container py-10 text-white">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
            <img
              src={product.images[selectedImage] || 'https://via.placeholder.com/600'}
              alt={product.name}
              className="h-[420px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 flex gap-2">
              <span className="pill bg-white/10 text-white border-white/20">{product.category}</span>
              <span className="pill bg-amber-400/20 text-amber-100 border-amber-200/20">SKU {product.sku}</span>
            </div>
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden rounded-xl border ${
                    selectedImage === index ? 'border-amber-400' : 'border-white/10'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-20 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="surface p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">{product.name}</h1>
            <p className="text-white/60 mt-2">Thoughtfully sourced, ready to ship.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-white/80">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(product.rating) ? 'text-amber-300' : 'text-white/30'}>
                  ★
                </span>
              ))}
              <span className="ml-2 text-sm">{product.rating.toFixed(1)} ({product.numReviews} reviews)</span>
            </div>
            <span className={`pill ${product.countInStock > 0 ? 'bg-emerald-400/20 text-emerald-100 border-emerald-200/20' : 'bg-white/10 text-white border-white/15'}`}>
              {product.countInStock > 0 ? `${product.countInStock} in studio` : 'Reserved'}
            </span>
          </div>

          <div>
            <p className="text-4xl font-semibold text-amber-200">${product.price.toFixed(2)}</p>
            {product.comparePrice && (
              <p className="text-sm text-white/50">Previously ${product.comparePrice.toFixed(2)}</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-white/70 leading-relaxed">{product.description}</p>
          </div>

          {product.countInStock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="text-sm font-medium text-white/80">
                  Quantity
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="input max-w-[140px]"
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
                className="w-full btn btn-primary rounded-xl py-3 text-base font-semibold"
              >
                Add to bag
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 surface p-6">
        <Reviews
          productId={product._id}
          reviews={product.reviews}
          onReviewAdded={fetchProduct}
        />
      </div>
    </div>
  );
};

export default ProductDetail;
