import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCart } from '../store/slices/cartSlice';
import { Spinner } from './Loading';

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

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        dispatch(clearCart());
        navigate(`/order/${result.data._id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      alert('Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between mb-8 sm:mb-12 px-2">
      {[
        { num: 1, label: 'Shipping' },
        { num: 2, label: 'Payment' },
        { num: 3, label: 'Review' }
      ].map((step, idx) => (
        <div key={step.num} className="flex-1 relative">
          {/* Connector line */}
          {idx < 2 && (
            <div
              className={`absolute top-4 sm:top-5 left-1/2 w-1/2 h-0.5 ${
                currentStep > step.num ? 'bg-black' : 'bg-gray-200'
              }`}
            />
          )}
          
          {/* Step circle and label */}
          <div className="flex flex-col items-center relative">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                currentStep >= step.num
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {step.num}
            </div>
            <p
              className={`text-xs font-medium mt-2 ${
                currentStep >= step.num ? 'text-black' : 'text-gray-500'
              }`}
            >
              {step.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderShippingForm = () => (
    <form onSubmit={handleShippingSubmit} className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Shipping Address</h2>
        
        <div className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">Address</label>
            <input
              type="text"
              value={shippingAddress.address}
              onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
              className="input w-full text-sm sm:text-base"
              placeholder="123 Main Street"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">City</label>
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                className="input w-full text-sm sm:text-base"
                placeholder="New York"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">Postal Code</label>
              <input
                type="text"
                value={shippingAddress.postalCode}
                onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                className="input w-full text-sm sm:text-base"
                placeholder="10001"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">Country</label>
            <input
              type="text"
              value={shippingAddress.country}
              onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
              className="input w-full text-sm sm:text-base"
              placeholder="United States"
              required
            />
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary w-full py-3 text-sm sm:text-base font-medium rounded-lg">
        Continue to Payment
      </button>
    </form>
  );

  const renderPaymentForm = () => (
    <form onSubmit={handlePaymentSubmit} className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Payment Method</h2>
        
        <div className="space-y-2 sm:space-y-3">
          {['PayPal', 'Stripe'].map((method) => (
            <label
              key={method}
              className={`flex items-center p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                paymentMethod === method
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                value={method}
                checked={paymentMethod === method}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4"
              />
              <span className="ml-3 font-medium text-sm sm:text-base text-gray-900">{method}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="flex-1 btn btn-outline py-3 text-xs sm:text-base font-medium rounded-lg"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 btn btn-primary py-3 text-xs sm:text-base font-medium rounded-lg"
        >
          Continue to Review
        </button>
      </div>
    </form>
  );

  const renderOrderReview = () => (
    <div className="space-y-6 sm:space-y-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Review Your Order</h2>
      
      {/* Order Items */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Items</h3>
        <div className="surface p-4 sm:p-6 space-y-3 sm:space-y-4 rounded-lg">
          {items.map((item: any) => (
            <div key={item._id} className="flex items-start justify-between pb-3 sm:pb-4 border-b last:border-b-0 last:pb-0 gap-3">
              <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
                <img src={item.image} alt={item.name} className="w-12 sm:w-16 h-12 sm:h-16 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{item.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="font-semibold text-sm sm:text-base text-gray-900 flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Shipping Address</h3>
        <div className="surface p-4 sm:p-6 rounded-lg">
          <p className="font-medium text-sm sm:text-base text-gray-900">{shippingAddress.address}</p>
          <p className="text-xs sm:text-sm text-gray-600">{shippingAddress.city}, {shippingAddress.postalCode}</p>
          <p className="text-xs sm:text-sm text-gray-600">{shippingAddress.country}</p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="surface p-4 sm:p-6 rounded-lg">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Order Summary</h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between text-xs sm:text-sm text-gray-600">
            <span>Subtotal</span>
            <span>${itemsPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm text-gray-600">
            <span>Shipping</span>
            <span>${shippingPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm text-gray-600 pb-2 sm:pb-3 border-b">
            <span>Tax (15%)</span>
            <span>${taxPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 sm:pt-3">
            <span className="text-sm sm:text-lg font-bold text-gray-900">Total</span>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="flex-1 btn btn-outline py-3 text-xs sm:text-base font-medium rounded-lg"
        >
          Back
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={isLoading}
          className="flex-1 btn btn-primary py-3 text-xs sm:text-base font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Placing Order...' : 'Place Order'}
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
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-40">
          <Spinner size="lg" message="Processing your order..." />
        </div>
      )}
      <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-2xl mx-auto">
          {renderStepIndicator()}
          
          <div className="px-0 sm:px-4">
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