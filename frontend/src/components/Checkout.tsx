import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCart } from '../store/slices/cartSlice';

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
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= step
                ? 'bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            {step}
          </div>
          <div
            className={`ml-2 ${
              currentStep >= step ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            {step === 1 ? 'Shipping' : step === 2 ? 'Payment' : 'Review'}
          </div>
          {step < 3 && (
            <div
              className={`w-8 h-0.5 mx-4 ${
                currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderShippingForm = () => (
    <form onSubmit={handleShippingSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Shipping Address</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <input
          type="text"
          value={shippingAddress.address}
          onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            value={shippingAddress.city}
            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
          </label>
          <input
            type="text"
            value={shippingAddress.postalCode}
            onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Country
        </label>
        <input
          type="text"
          value={shippingAddress.country}
          onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Continue to Payment
      </button>
    </form>
  );

  const renderPaymentForm = () => (
    <form onSubmit={handlePaymentSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
      
      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="radio"
            value="PayPal"
            checked={paymentMethod === 'PayPal'}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="mr-2"
          />
          PayPal or Credit Card
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            value="Stripe"
            checked={paymentMethod === 'Stripe'}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="mr-2"
          />
          Stripe
        </label>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue to Review
        </button>
      </div>
    </form>
  );

  const renderOrderReview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Order Review</h2>
      
      {/* Order Items */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Order Items</h3>
        <div className="space-y-2">
          {items.map((item: any) => (
            <div key={item._id} className="flex justify-between items-center py-2 border-b">
              <div className="flex items-center space-x-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-gray-600">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
        <div className="bg-gray-50 p-3 rounded-md">
          <p>{shippingAddress.address}</p>
          <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
          <p>{shippingAddress.country}</p>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
        <div className="bg-gray-50 p-3 rounded-md">
          <p>{paymentMethod}</p>
        </div>
      </div>

      {/* Order Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
        <div className="bg-gray-50 p-4 rounded-md space-y-2">
          <div className="flex justify-between">
            <span>Items:</span>
            <span>${itemsPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>${shippingPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>${taxPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={isLoading}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );

  if (!user || items.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {renderStepIndicator()}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {currentStep === 1 && renderShippingForm()}
        {currentStep === 2 && renderPaymentForm()}
        {currentStep === 3 && renderOrderReview()}
      </div>
    </div>
  );
};

export default Checkout;