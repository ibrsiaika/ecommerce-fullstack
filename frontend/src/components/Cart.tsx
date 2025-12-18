import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, totalItems, totalPrice } = useAppSelector((state) => state.cart);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  const handleRemoveFromCart = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32">
          <div className="text-center max-w-md mx-auto">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <FiShoppingBag className="h-8 sm:h-10 w-8 sm:w-10 text-gray-400" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">Your cart is empty</h1>
            <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10">Start exploring our collection and add items to your cart.</p>
            <Link
              to="/products"
              className="btn btn-primary inline-block py-3 sm:py-4 px-8 sm:px-12 text-base sm:text-lg font-semibold rounded-xl"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 lg:mb-16 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
          </div>
          <button
            onClick={handleClearCart}
            className="flex items-center justify-center sm:justify-start gap-2 text-red-600 hover:text-red-700 font-semibold text-xs sm:text-sm px-4 py-2 rounded-lg hover:bg-red-50 transition-colors w-full sm:w-auto"
          >
            <FiTrash2 size={18} />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {items.map((item, idx) => (
              <div 
                key={item.id} 
                className="surface p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 lg:gap-8 hover:shadow-lg transition-shadow duration-300 group rounded-xl"
              >
                {/* Product Image */}
                <div className="relative flex-shrink-0 self-start sm:self-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 sm:h-24 lg:h-32 w-20 sm:w-24 lg:w-32 object-cover rounded-lg sm:rounded-xl shadow-md group-hover:shadow-lg transition-shadow"
                  />
                  <div className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center">
                    {idx + 1}
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-black transition-colors truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-baseline gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">${item.price.toFixed(2)}</p>
                      <p className="text-xs sm:text-sm text-gray-500">per item</p>
                    </div>
                    <p className={`text-xs sm:text-sm font-medium ${item.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.countInStock > 0 ? `✓ ${item.countInStock} in stock` : '✗ Out of stock'}
                    </p>
                  </div>

                  {/* Quantity Controls - Mobile Responsive */}
                  <div className="flex items-center justify-between mt-4 sm:mt-0 sm:gap-6">
                    <div className="flex items-center gap-0 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg sm:rounded-xl p-1 flex-shrink-0 shadow-sm">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-2 sm:p-3 hover:bg-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-gray-700 hover:text-black text-sm"
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus size={16} className="sm:h-5 sm:w-5" />
                      </button>
                      
                      <span className="w-8 sm:w-12 text-center font-bold text-gray-900 text-sm sm:text-lg">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-2 sm:p-3 hover:bg-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-gray-700 hover:text-black text-sm"
                        disabled={item.quantity >= item.countInStock}
                      >
                        <FiPlus size={16} className="sm:h-5 sm:w-5" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-gray-600 text-xs sm:text-sm mb-1">Subtotal</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFromCart(item.id)}
                  className="p-2 sm:p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex-shrink-0 font-semibold self-start sm:self-center"
                >
                  <FiTrash2 size={20} className="sm:h-6 sm:w-6" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary - Sticky on Desktop */}
          <div className="lg:col-span-1">
            <div className="surface p-6 sm:p-8 lg:sticky lg:top-24 shadow-xl rounded-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Order Summary</h2>
              
              <div className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
                <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium text-sm sm:text-base">Subtotal ({totalItems} items)</span>
                  <span className="text-lg sm:text-xl font-semibold text-gray-900">${totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium text-sm sm:text-base">Shipping</span>
                  {totalPrice > 100 ? (
                    <span className="text-lg sm:text-xl font-semibold text-green-600">FREE</span>
                  ) : (
                    <span className="text-lg sm:text-xl font-semibold text-gray-900">$10.00</span>
                  )}
                </div>
                
                <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium text-sm sm:text-base">Tax (15%)</span>
                  <span className="text-lg sm:text-xl font-semibold text-gray-900">${(totalPrice * 0.15).toFixed(2)}</span>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-4 sm:p-5 my-4 sm:my-6 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-bold text-base sm:text-lg">Total Amount</span>
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                      ${(totalPrice + (totalPrice > 100 ? 0 : 10) + totalPrice * 0.15).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <Link
                  to="/checkout"
                  className="btn btn-primary w-full py-3 sm:py-4 text-sm sm:text-lg font-semibold block text-center rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  Proceed to Checkout
                </Link>
                
                <Link
                  to="/products"
                  className="btn btn-outline w-full py-3 sm:py-4 text-sm sm:text-lg font-semibold block text-center rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>

              {totalPrice < 100 && (
                <div className="p-3 sm:p-5 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200">
                  <p className="text-xs sm:text-sm text-blue-900 font-medium">
                    <span className="font-bold">🎉 Free shipping unlocked!</span> Add ${(100 - totalPrice).toFixed(2)} more.
                  </p>
                  <div className="mt-3 bg-white rounded-lg h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${(totalPrice / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {totalPrice >= 100 && (
                <div className="p-3 sm:p-5 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200">
                  <p className="text-xs sm:text-sm text-green-900 font-semibold">
                    ✓ You qualify for free shipping!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;