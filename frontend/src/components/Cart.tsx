import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight, FiTruck, FiCheckCircle } from 'react-icons/fi';

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
      <div className="min-h-screen bg-white flex flex-col">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-50 rounded-full -mr-48 -mt-48 pointer-events-none" />
        
        <div className="container px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32 relative flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center shadow-lg">
                <FiShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-base sm:text-lg text-gray-600 mb-10">Start exploring our collection and add items to your cart.</p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl bg-black text-white hover:bg-gray-900 active:scale-95 transition-all duration-200 group"
            >
              Explore Products
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-50 rounded-full -mr-48 -mt-48 pointer-events-none" />
      
      <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 sm:mb-16 lg:mb-20 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-base sm:text-lg text-gray-600 mt-3">{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
          </div>
          <button
            onClick={handleClearCart}
            className="flex items-center justify-center sm:justify-start gap-2 text-red-600 hover:text-red-700 font-semibold text-base px-6 py-3 rounded-xl hover:bg-red-50 transition-colors w-full sm:w-auto"
          >
            <FiTrash2 size={20} />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, idx) => (
              <div 
                key={item.id} 
                className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-8 hover:shadow-xl transition-all duration-300 group rounded-2xl border border-gray-200 bg-white hover:border-gray-300"
              >
                {/* Product Image */}
                <div className="relative flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 sm:h-28 lg:h-32 w-24 sm:w-28 lg:w-32 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow"
                  />
                  <div className="absolute -top-3 -right-3 bg-black text-white text-sm font-bold h-8 w-8 rounded-full flex items-center justify-center shadow-lg">
                    {idx + 1}
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 group-hover:text-black transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                    <div className="flex items-baseline gap-3 mb-3">
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">${item.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500 font-medium">per item</p>
                    </div>
                    <p className={`text-sm font-semibold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${item.countInStock > 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                      {item.countInStock > 0 ? (
                        <>
                          <FiCheckCircle size={16} />
                          {item.countInStock} in stock
                        </>
                      ) : (
                        '✗ Out of stock'
                      )}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-6 sm:mt-0 sm:gap-6">
                    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1.5 flex-shrink-0 shadow-sm">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-2 sm:p-3 hover:bg-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-gray-700 hover:text-black"
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus size={18} />
                      </button>
                      
                      <span className="w-10 sm:w-14 text-center font-bold text-gray-900 text-base sm:text-lg">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-2 sm:p-3 hover:bg-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-gray-700 hover:text-black"
                        disabled={item.quantity >= item.countInStock}
                      >
                        <FiPlus size={18} />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-gray-600 text-sm font-medium mb-1">Subtotal</p>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFromCart(item.id)}
                  className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex-shrink-0 font-semibold"
                >
                  <FiTrash2 size={24} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary - Sticky on Desktop */}
          <div className="lg:col-span-1">
            <div className="p-8 lg:sticky lg:top-24 shadow-xl rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Order Summary</h2>
              
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center py-3 border-b border-gray-300">
                  <span className="text-gray-700 font-semibold text-base">Subtotal ({totalItems} items)</span>
                  <span className="text-xl font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-300">
                  <span className="text-gray-700 font-semibold text-base flex items-center gap-2">
                    <FiTruck size={18} />
                    Shipping
                  </span>
                  {totalPrice > 100 ? (
                    <span className="text-xl font-bold text-green-600">FREE</span>
                  ) : (
                    <span className="text-xl font-bold text-gray-900">$10.00</span>
                  )}
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-300">
                  <span className="text-gray-700 font-semibold text-base">Tax (15%)</span>
                  <span className="text-xl font-bold text-gray-900">${(totalPrice * 0.15).toFixed(2)}</span>
                </div>
                
                <div className="bg-white rounded-xl p-6 my-6 border-2 border-black">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-bold text-base">Total Amount</span>
                    <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                      ${(totalPrice + (totalPrice > 100 ? 0 : 10) + totalPrice * 0.15).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <Link
                  to="/checkout"
                  className="w-full py-4 text-lg font-semibold block text-center rounded-xl bg-black text-white hover:bg-gray-900 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl"
                >
                  Proceed to Checkout
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
                
                <Link
                  to="/products"
                  className="w-full py-4 text-lg font-semibold block text-center rounded-xl bg-white border-2 border-gray-300 text-gray-900 hover:border-gray-400 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>

              {totalPrice < 100 && (
                <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200">
                  <p className="text-sm text-blue-900 font-semibold mb-3">
                    🎉 Free shipping unlocked! Add ${(100 - totalPrice).toFixed(2)} more.
                  </p>
                  <div className="bg-white rounded-lg h-3 overflow-hidden border border-blue-300">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
                      style={{ width: `${(totalPrice / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {totalPrice >= 100 && (
                <div className="p-5 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200">
                  <p className="text-sm text-green-900 font-semibold flex items-center gap-2">
                    <FiCheckCircle size={18} />
                    You qualify for free shipping!
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