import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';

interface PayPalButtonProps {
  amount: number;
  orderId: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
}

declare global {
  interface Window {
    paypal: any;
  }
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ amount, orderId, onSuccess, onError }) => {
  const { user } = useAppSelector((state: any) => state.auth);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const addPayPalScript = async () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&currency=USD`;
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
        createOrder: (data: any, actions: any) => {
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
        onApprove: async (data: any, actions: any) => {
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

// Stripe Payment Component
interface StripeButtonProps {
  amount: number;
  orderId: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: any) => void;
}

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
          amount: Math.round(amount * 100), // Convert to cents
          orderId
        })
      });

      if (response.ok) {
        const { clientSecret } = await response.json();
        
        // In a real app, you would use Stripe Elements here
        // For demo purposes, we'll simulate a successful payment
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
        `Pay $${amount.toFixed(2)} with Stripe`
      )}
    </button>
  );
};

// Main Payment Component
interface PaymentProps {
  orderId: string;
  amount: number;
  paymentMethod: string;
  onPaymentSuccess: () => void;
}

const Payment: React.FC<PaymentProps> = ({ orderId, amount, paymentMethod, onPaymentSuccess }) => {
  const handleSuccess = (details: any) => {
    console.log('Payment successful:', details);
    alert('Payment completed successfully!');
    onPaymentSuccess();
  };

  const handleError = (error: any) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error.message || error}`);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Complete Payment</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Amount to pay:</p>
        <p className="text-2xl font-bold text-gray-900">${amount.toFixed(2)}</p>
      </div>
      
      {paymentMethod === 'PayPal' ? (
        <PayPalButton
          amount={amount}
          orderId={orderId}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      ) : paymentMethod === 'Stripe' ? (
        <StripeButton
          amount={amount}
          orderId={orderId}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-600">Unsupported payment method: {paymentMethod}</p>
        </div>
      )}
    </div>
  );
};

export default Payment;