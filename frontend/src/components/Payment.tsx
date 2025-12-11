import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';

// ============================================
// Types & Interfaces
// ============================================

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

interface CardData {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

// PayPal & Stripe types
interface PayPalButtonProps {
  amount: number;
  orderId: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
}

interface StripeButtonProps {
  amount: number;
  orderId: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: any) => void;
}

interface PaymentProps {
  orderId?: string;
  amount?: number;
  paymentMethod?: string;
  onPaymentSuccess: () => void;
  orderSummary?: OrderSummary;
}

declare global {
  interface Window {
    paypal: any;
  }
}

// ============================================
// PayPal Button Component
// ============================================

const PayPalButton: React.FC<PayPalButtonProps> = ({ amount, orderId, onSuccess, onError }) => {
  const { user } = useAppSelector((state: any) => state.auth);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const addPayPalScript = async () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;
      script.onload = () => {
        setSdkReady(true);
      };
      document.body.appendChild(script);
    };

    if (!window.paypal) {
      addPayPalScript();
    } else {
      setSdkReady(true);
    }
  }, []);

  useEffect(() => {
    if (sdkReady && window.paypal) {
      window.paypal.Buttons({
        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount.toFixed(2)
                }
              }
            ]
          });
        },
        onApprove: async (_data: any, actions: any) => {
          try {
            const details = await actions.order.capture();
            
            // Update order payment status
            const response = await fetch(`/api/orders/${orderId}/pay`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`
              },
              body: JSON.stringify({
                id: details.id,
                status: details.status,
                update_time: details.update_time,
                payer: details.payer
              })
            });

            if (response.ok) {
              onSuccess(details);
            } else {
              const errorData = await response.json();
              onError(errorData.error || 'Payment update failed');
            }
          } catch (error) {
            onError(error);
          }
        },
        onError: (error: any) => {
          onError(error);
        }
      }).render('#paypal-button-container');
    }
  }, [sdkReady, amount, orderId, user, onSuccess, onError]);

  return (
    <div>
      {!sdkReady ? (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading PayPal...</span>
        </div>
      ) : (
        <div id="paypal-button-container"></div>
      )}
    </div>
  );
};

// ============================================
// Stripe Button Component
// ============================================

const StripeButton: React.FC<StripeButtonProps> = ({ amount, orderId, onSuccess, onError }) => {
  const { user } = useAppSelector((state: any) => state.auth);
  const [loading, setLoading] = useState(false);

  const handleStripePayment = async () => {
    setLoading(true);
    
    try {
      // Create payment intent
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          orderId
        })
      });

      if (response.ok) {
        await response.json();
        
        // Simulate successful payment
        setTimeout(() => {
          const mockPaymentIntent = {
            id: `pi_${Date.now()}`,
            status: 'succeeded',
            amount: Math.round(amount * 100),
            created: Math.floor(Date.now() / 1000)
          };
          
          // Update order payment status
          fetch(`/api/orders/${orderId}/pay`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`
            },
            body: JSON.stringify({
              id: mockPaymentIntent.id,
              status: mockPaymentIntent.status,
              update_time: new Date().toISOString()
            })
          }).then(res => {
            if (res.ok) {
              onSuccess(mockPaymentIntent);
            } else {
              onError('Payment update failed');
            }
          });
          
          setLoading(false);
        }, 2000);
      } else {
        const errorData = await response.json();
        onError(errorData.error || 'Payment failed');
        setLoading(false);
      }
    } catch (error) {
      onError(error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStripePayment}
      disabled={loading}
      className="w-full bg-purple-600 text-white py-3 px-4 rounded-md font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Processing Payment...
        </div>
      ) : (
        `Continue with Stripe`
      )}
    </button>
  );
};

// ============================================
// Main Payment Component
// ============================================

const Payment: React.FC<PaymentProps> = ({
  orderId = '',
  amount = 0,
  paymentMethod = 'credit_card',
  onPaymentSuccess,
  orderSummary
}) => {
  const { user } = useAppSelector((state: any) => state.auth);
  
  // State management
  const [selectedPayment, setSelectedPayment] = useState<'paypal' | 'stripe' | 'credit_card'>(
    (paymentMethod as any) || 'credit_card'
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  // Credit card form state
  const [cardData, setCardData] = useState<CardData>({
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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
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

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const paymentData = {
        method: selectedPayment,
        amount: orderSummary?.total || amount,
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

  const handleSuccess = (details: any) => {
    console.log('Payment successful:', details);
    setPaymentStatus('completed');
    setShowReceipt(true);
    setTimeout(() => {
      onPaymentSuccess();
    }, 2000);
  };

  const handleError = (error: any) => {
    console.error('Payment error:', error);
    setPaymentStatus('failed');
  };

  // Show receipt if payment completed
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

          {orderSummary && (
            <>
              <h4 className="font-semibold text-gray-900 mb-3">Items</h4>
              <div className="space-y-2 mb-6">
                {orderSummary.items.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <span className="text-gray-600">{item.name} x {item.qty}</span>
                    <span className="text-gray-900">{formatCurrency(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="border-t-2 pt-4">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(orderSummary?.total || amount)}</span>
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

  // Render payment form
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
                {isProcessing ? 'Processing...' : `Pay ${formatCurrency(orderSummary?.total || amount)}`}
              </button>
            </form>
          )}

          {/* PayPal Payment */}
          {selectedPayment === 'paypal' && orderId && (
            <PayPalButton
              amount={orderSummary?.total || amount}
              orderId={orderId}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          )}

          {selectedPayment === 'paypal' && !orderId && (
            <button
              onClick={handlePaymentSubmit}
              disabled={isProcessing}
              className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Continue with PayPal'}
            </button>
          )}

          {/* Stripe Payment */}
          {selectedPayment === 'stripe' && orderId && (
            <StripeButton
              amount={orderSummary?.total || amount}
              orderId={orderId}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          )}

          {selectedPayment === 'stripe' && !orderId && (
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
                  : '⏳ Processing your payment...'}
              </p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        {orderSummary && (
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
        )}

        {/* Simplified view without OrderSummary */}
        {!orderSummary && (
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
              <div className="bg-white p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-2">Amount to pay:</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(amount)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  ✅ Your payment is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;