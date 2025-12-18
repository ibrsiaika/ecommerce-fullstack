import React, { useState } from 'react';

interface Seller {
  _id: string;
  name: string;
  email: string;
  storeName: string;
  storeDescription: string;
  logo: string;
  banner: string;
  rating: number;
  totalReviews: number;
  followers: number;
  verified: boolean;
  joinedDate: string;
  policies?: {
    returnPolicy: string;
    refundPolicy: string;
    shippingPolicy: string;
  };
}

interface Product {
  _id: string;
  name: string;
  price: number;
  rating: number;
  numReviews: number;
  image: string;
  countInStock: number;
}

interface Review {
  _id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const SellerProfile: React.FC<{ sellerId?: string }> = ({ sellerId }) => {
  const [seller] = useState<Seller>({
    _id: sellerId || '1',
    name: 'John Seller',
    email: 'seller@example.com',
    storeName: 'Premium Electronics Store',
    storeDescription: 'Your trusted source for quality electronics and gadgets',
    logo: 'https://picsum.photos/100',
    banner: 'https://picsum.photos/1200x400',
    rating: 4.7,
    totalReviews: 324,
    followers: 1250,
    verified: true,
    joinedDate: '2023-01-15',
    policies: {
      returnPolicy: '30 days money-back guarantee on all products',
      refundPolicy: 'Full refund within 7 business days of return',
      shippingPolicy: 'Free shipping on orders over $50, Express shipping available',
    },
  });

  const [isFavorite, setIsFavorite] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'policies'>('products');

  const products: Product[] = [
    {
      _id: '1',
      name: 'Wireless Headphones',
      price: 79.99,
      rating: 4.8,
      numReviews: 256,
      image: 'https://picsum.photos/300x300',
      countInStock: 45,
    },
    {
      _id: '2',
      name: 'USB-C Cable',
      price: 12.99,
      rating: 4.6,
      numReviews: 189,
      image: 'https://picsum.photos/300x300',
      countInStock: 128,
    },
    {
      _id: '3',
      name: 'Phone Charger',
      price: 24.99,
      rating: 4.7,
      numReviews: 412,
      image: 'https://picsum.photos/300x300',
      countInStock: 87,
    },
    {
      _id: '4',
      name: 'Screen Protector',
      price: 9.99,
      rating: 4.5,
      numReviews: 156,
      image: 'https://picsum.photos/300x300',
      countInStock: 234,
    },
  ];

  const reviews: Review[] = [
    {
      _id: '1',
      author: 'Alice Johnson',
      rating: 5,
      comment: 'Excellent quality and fast shipping! Highly recommended.',
      createdAt: '2025-01-10',
    },
    {
      _id: '2',
      author: 'Bob Smith',
      rating: 4,
      comment: 'Good products, arrived on time. Very satisfied.',
      createdAt: '2025-01-08',
    },
    {
      _id: '3',
      author: 'Carol White',
      rating: 5,
      comment: 'Best seller I have dealt with. Great customer service!',
      createdAt: '2025-01-05',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
        <img src={seller.banner} alt="Store Banner" className="w-full h-full object-cover" />
      </div>

      {/* Store Info Header */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Basic Info */}
            <div className="md:col-span-1">
              <img
                src={seller.logo}
                alt="Store Logo"
                className="w-24 h-24 rounded-lg border border-gray-200 mb-4"
              />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{seller.storeName}</h1>
              {seller.verified && (
                <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  ✓ Verified Seller
                </div>
              )}
            </div>

            {/* Stats and Actions */}
            <div className="md:col-span-3">
              <p className="text-gray-600 mb-4">{seller.storeDescription}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-gray-600 text-sm">Rating</p>
                  <p className="text-2xl font-bold text-yellow-500">⭐ {seller.rating}</p>
                  <p className="text-xs text-gray-500">({seller.totalReviews} reviews)</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Followers</p>
                  <p className="text-2xl font-bold text-blue-600">{seller.followers}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Member Since</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(seller.joinedDate)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Contact</p>
                  <p className="text-sm font-semibold text-gray-900">{seller.email}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-900'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? '✓ Following' : '+ Follow'}
                </button>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    isFavorite
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  {isFavorite ? '❤️ Favorited' : '🤍 Favorite'}
                </button>
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  Contact Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex border-b border-gray-200 gap-8">
          {(['products', 'reviews', 'policies'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(product.price)}</span>
                      <span className="text-sm text-yellow-500">⭐ {product.rating}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">({product.numReviews} reviews)</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{product.countInStock} in stock</span>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{review.author}</p>
                      <p className="text-sm text-gray-600">{formatDate(review.createdAt)}</p>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <div className="space-y-6">
            {seller.policies && (
              <>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Return Policy</h3>
                  <p className="text-gray-700">{seller.policies.returnPolicy}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Refund Policy</h3>
                  <p className="text-gray-700">{seller.policies.refundPolicy}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Shipping Policy</h3>
                  <p className="text-gray-700">{seller.policies.shippingPolicy}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;
