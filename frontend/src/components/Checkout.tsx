import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCart } from '../store/slices/cartSlice';
import { Spinner } from './Loading';
import api from '../services/api';
import { FiMapPin, FiCreditCard, FiCheck, FiArrowLeft, FiArrowRight, FiLoader } from 'react-icons/fi';

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface OrderData {
  orderItems: Array<{
    product: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state: any) => state.cart);
  const { user } = useAppSelector((state: any) => state.auth);

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate prices
  const itemsPrice = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [user, items, navigate]);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shippingAddress.address && shippingAddress.city && shippingAddress.postalCode && shippingAddress.country) {
      setCurrentStep(2);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    
    try {
      const orderData: OrderData = {
        orderItems: items.map((item: any) => ({
          product: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
      };

      const response = await api.post('/orders', orderData);
      dispatch(clearCart());
      navigate(`/order/${response.data.data._id}`);
    } catch (error: any) {
      console.error('Order creation error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to create order';
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between mb-12 sm:mb-16 lg:mb-20 px-2">
      {[
        { num: 1, label: 'Shipping', icon: FiMapPin },
        { num: 2, label: 'Payment', icon: FiCreditCard },
        { num: 3, label: 'Review', icon: FiCheck }
      ].map((step, idx) => {
        const Icon = step.icon;
        return (
          <div key={step.num} className="flex-1 relative">
            {/* Connector line */}
            {idx < 2 && (
              <div
                className={`absolute top-6 sm:top-7 left-1/2 w-1/2 h-1 rounded-full transition-all duration-300 ${
                  currentStep > step.num ? 'bg-black' : 'bg-gray-200'
                }`}
              />
            )}
            
            {/* Step circle and label */}
            <div className="flex flex-col items-center relative">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  currentStep >= step.num
                    ? 'bg-black text-white shadow-lg scale-110'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Icon size={24} />
              </div>
              <p
                className={`text-sm font-semibold mt-3 text-center transition-colors duration-200 ${
                  currentStep >= step.num ? 'text-black' : 'text-gray-500'
                }`}
              >
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderShippingForm = () => (
    <form onSubmit={handleShippingSubmit} className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <FiMapPin className="text-black" size={28} />
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Shipping Address</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Street Address</label>
            <input
              type="text"
              value={shippingAddress.address}
              onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
              className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:border-black focus:outline-none transition-colors hover:border-gray-400 bg-white"
              placeholder="123 Main Street"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">City</label>
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:border-black focus:outline-none transition-colors hover:border-gray-400 bg-white"
                placeholder="New York"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Postal Code</label>
              <input
                type="text"
                value={shippingAddress.postalCode}
                onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:border-black focus:outline-none transition-colors hover:border-gray-400 bg-white"
                placeholder="10001"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Country</label>
            <input
              type="text"
              value={shippingAddress.country}
              onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
              className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl focus:border-black focus:outline-none transition-colors hover:border-gray-400 bg-white"
              placeholder="United States"
              required
            />
          </div>
        </div>
      </div>

      <button type="submit" className="w-full py-4 px-6 text-lg font-semibold rounded-xl bg-black text-white hover:bg-gray-900 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl">
        Continue to Payment
        <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
      </button>
    </form>
  );

  const renderPaymentForm = () => (
    <form onSubmit={handlePaymentSubmit} className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <FiCreditCard className="text-black" size={28} />
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Payment Method</h2>
        </div>
        
        <div className="space-y-4">
          {['PayPal', 'Stripe'].map((method) => (
            <label
              key={method}
              className={`flex items-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${
                paymentMethod === method
                  ? 'border-black bg-black/5 shadow-lg'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <input
                type="radio"
                value={method}
                checked={paymentMethod === method}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 cursor-pointer"
              />
              <span className="ml-4 font-semibold text-lg text-gray-900">{method}</span>
              {paymentMethod === method && (
                <FiCheck className="ml-auto text-black" size={24} />
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="flex-1 py-4 px-6 text-lg font-semibold rounded-xl bg-white border-2 border-gray-300 text-gray-900 hover:border-gray-400 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <FiArrowLeft size={20} />
          Back
        </button>
        <button
          type="submit"
          className="flex-1 py-4 px-6 text-lg font-semibold rounded-xl bg-black text-white hover:bg-gray-900 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl"
        >
          Continue to Review
          <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
        </button>
      </div>
    </form>
  );

  const renderOrderReview = () => (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <FiCheck className="text-black" size={28} />
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Review Your Order</h2>
      </div>
      
      {/* Order Items */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Items ({items.length})</h3>
        <div className="p-6 sm:p-8 space-y-4 rounded-2xl border-2 border-gray-200 bg-white">
          {items.map((item: any, index: number) => (
            <div key={item._id || `item-${index}`} className="flex items-start justify-between pb-4 border-b last:border-b-0 last:pb-0 gap-4">
              <div className="flex gap-4 flex-1 min-w-0">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0 shadow-md" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base text-gray-900 line-clamp-2">{item.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">Qty: <span className="font-semibold">{item.quantity}</span></p>
                </div>
              </div>
              <span className="font-bold text-lg text-gray-900 flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
        <div className="p-6 sm:p-8 rounded-2xl border-2 border-gray-200 bg-white">
          <p className="font-semibold text-base text-gray-900">{shippingAddress.address}</p>
          <p className="text-sm text-gray-700 mt-2">{shippingAddress.city}, {shippingAddress.postalCode}</p>
          <p className="text-sm text-gray-700">{shippingAddress.country}</p>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
        <div className="p-6 sm:p-8 rounded-2xl border-2 border-gray-200 bg-white">
          <p className="font-semibold text-base text-gray-900 flex items-center gap-2">
            <FiCreditCard size={20} />
            {paymentMethod}
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-base text-gray-700">
            <span>Subtotal</span>
            <span>${itemsPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base text-gray-700">
            <span>Shipping</span>
            <span className={shippingPrice === 0 ? 'text-green-600 font-semibold' : ''}>${shippingPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base text-gray-700 pb-4 border-b-2 border-gray-300">
            <span>Tax (15%)</span>
            <span>${taxPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-4">
            <span className="text-lg font-bold text-gray-900">Total Amount</span>
            <span className="text-4xl font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="flex-1 py-4 px-6 text-lg font-semibold rounded-xl bg-white border-2 border-gray-300 text-gray-900 hover:border-gray-400 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <FiArrowLeft size={20} />
          Back
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={isLoading}
          className="flex-1 py-4 px-6 text-lg font-semibold rounded-xl bg-black text-white hover:bg-gray-900 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <>
              <FiLoader className="animate-spin" size={20} />
              Placing Order...
            </>
          ) : (
            <>
              <FiCheck size={20} />
              Place Order
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (!user || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" message="Loading checkout..." />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-50 rounded-full -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gray-50 rounded-full -ml-36 -mb-36 pointer-events-none" />
      
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <Spinner size="lg" message="Processing your order..." />
          </div>
        </div>
      )}
      <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative">
        <div className="max-w-3xl mx-auto">
          {renderStepIndicator()}
          
          <div className="px-4 sm:px-6 lg:px-8 p-8 sm:p-10 rounded-2xl bg-white border border-gray-200 shadow-sm">
            {currentStep === 1 && renderShippingForm()}
            {currentStep === 2 && renderPaymentForm()}
            {currentStep === 3 && renderOrderReview()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;