import React, { useState } from 'react';
import { useAppSelector } from '../store/hooks';

interface PaymentMethod {
  id: 'paypal' | 'stripe' | 'credit_card';
  name: string;
  icon: string;
  description: string;
}

interface OrderSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  items: Array<{
    _id: string;
    name: string;
    price: number;
    qty: number;
  }>;
}

type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

const EnhancedPayment: React.FC<{ orderSummary: OrderSummary; onPaymentSuccess: () => void }> = ({
  orderSummary,
  onPaymentSuccess,
}) => {
  const { user } = useAppSelector((state: any) => state.auth);
  const [selectedPayment, setSelectedPayment] = useState<'paypal' | 'stripe' | 'credit_card'>('credit_card');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  // Credit card form state
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'credit_card',
      name: 'Credit Card',
      icon: '💳',
      description: 'Pay securely with your credit or debit card',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '🅿️',
      description: 'Fast and secure payment with PayPal',
    },
    {
      id: 'stripe',
      name: 'Stripe',
      icon: '💰',
      description: 'Flexible payment processing with Stripe',
    },
  ];

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real application, you would call your payment API here
      const paymentData = {
        method: selectedPayment,
        amount: orderSummary.total,
        currency: 'USD',
        userId: user?.id,
        ...(selectedPayment === 'credit_card' && { cardData }),
      };

      console.log('Processing payment:', paymentData);

      setPaymentStatus('completed');
      setShowReceipt(true);
      setTimeout(() => {
        onPaymentSuccess();
      }, 2000);
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (showReceipt && paymentStatus === 'completed') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">Your order has been placed successfully</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Receipt</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-semibold text-gray-900">#{Math.random().toString(36).slice(2, 10)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold text-gray-900 capitalize">
                {selectedPayment.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <h4 className="font-semibold text-gray-900 mb-3">Items</h4>
          <div className="space-y-2 mb-6">
            {orderSummary.items.map((item) => (
              <div key={item._id} className="flex justify-between">
                <span className="text-gray-600">{item.name} x {item.qty}</span>
                <span className="text-gray-900">{formatCurrency(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div className="border-t-2 pt-4">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(orderSummary.total)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setShowReceipt(false);
            setPaymentStatus('pending');
          }}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Download Receipt
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Methods */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Payment Method</h2>

          <div className="grid grid-cols-1 gap-4 mb-8">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPayment === method.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{method.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                  {selectedPayment === method.id && (
                    <span className="text-blue-600 font-bold">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Credit Card Form */}
          {selectedPayment === 'credit_card' && (
            <form onSubmit={handlePaymentSubmit} className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Details</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.cardNumber}
                  onChange={(e) =>
                    setCardData({ ...cardData, cardNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Holder Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardData.cardHolder}
                  onChange={(e) =>
                    setCardData({ ...cardData, cardHolder: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month
                  </label>
                  <input
                    type="number"
                    placeholder="MM"
                    min="1"
                    max="12"
                    value={cardData.expiryMonth}
                    onChange={(e) =>
                      setCardData({ ...cardData, expiryMonth: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    placeholder="YY"
                    min="24"
                    max="99"
                    value={cardData.expiryYear}
                    onChange={(e) =>
                      setCardData({ ...cardData, expiryYear: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={(e) =>
                      setCardData({ ...cardData, cvv: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Pay ${formatCurrency(orderSummary.total)}`}
              </button>
            </form>
          )}

          {/* PayPal Button Placeholder */}
          {selectedPayment === 'paypal' && (
            <button
              onClick={handlePaymentSubmit}
              disabled={isProcessing}
              className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Continue with PayPal'}
            </button>
          )}

          {/* Stripe Button Placeholder */}
          {selectedPayment === 'stripe' && (
            <button
              onClick={handlePaymentSubmit}
              disabled={isProcessing}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Continue with Stripe'}
            </button>
          )}

          {/* Payment Status */}
          {paymentStatus !== 'pending' && paymentStatus !== 'completed' && (
            <div className={`mt-4 p-4 rounded-lg ${getStatusColor(paymentStatus)}`}>
              <p className="font-semibold capitalize">
                {paymentStatus === 'failed'
                  ? '❌ Payment failed. Please try again.'
                  : 'Processing your payment...'}
              </p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

            <div className="space-y-3 mb-6 pb-6 border-b">
              {orderSummary.items.map((item) => (
                <div key={item._id} className="flex justify-between">
                  <span className="text-gray-600">{item.name} x {item.qty}</span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(orderSummary.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">{formatCurrency(orderSummary.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">{formatCurrency(orderSummary.shipping)}</span>
              </div>
            </div>

            <div className="border-t-2 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-green-600">{formatCurrency(orderSummary.total)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                ✅ Your payment is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPayment;
