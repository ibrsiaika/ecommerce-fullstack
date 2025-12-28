import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CheckoutPage.css';

/**
 * CheckoutPage Component
 * Complete payment processing flow with:
 * - Order review and cart management
 * - Real-time fraud detection
 * - Geographic risk assessment
 * - Payment method selection
 * - Billing and shipping address forms
 * - Payment processing with Stripe/PayPal
 * - Order confirmation
 */

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface FraudCheckResult {
  isSuspicious: boolean;
  riskScore: number;
  alerts: string[];
  reasons: string[];
}

interface GeoRiskResult {
  country: string;
  riskScore: number;
  isVpn: boolean;
  isProxy: boolean;
  impossibleTravel: boolean;
}

export const CheckoutPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [billingAddress, setBillingAddress] = useState({
    fullName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [shippingAddress, setShippingAddress] = useState({ ...billingAddress });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fraudCheckResult, setFraudCheckResult] = useState<FraudCheckResult | null>(null);
  const [geoRiskResult, setGeoRiskResult] = useState<GeoRiskResult | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<any>(null);
  const [showFraudWarning, setShowFraudWarning] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(response.data.items || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateTax = () => {
    return calculateTotal() * 0.08; // 8% tax
  };

  const calculateShipping = () => {
    const total = calculateTotal();
    return total > 100 ? 0 : 10;
  };

  const getGrandTotal = () => {
    return calculateTotal() + calculateTax() + calculateShipping();
  };

  const runFraudCheck = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        '/api/phase3/fraud/check-transaction',
        {
          amount: getGrandTotal(),
          billingAddress,
          shippingAddress: sameAsBilling ? billingAddress : shippingAddress,
          paymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFraudCheckResult(response.data);
      if (response.data.isSuspicious) {
        setShowFraudWarning(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fraud check failed');
    } finally {
      setLoading(false);
    }
  };

  const runGeoCheck = async () => {
    try {
      const response = await axios.post(
        '/api/phase4/geo/assess-risk',
        {
          country: billingAddress.country,
          shippingCountry: sameAsBilling ? billingAddress.country : shippingAddress.country,
          amount: getGrandTotal(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setGeoRiskResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Geographic check failed');
    }
  };

  const validateForm = () => {
    if (!billingAddress.fullName || !billingAddress.email) {
      setError('Please fill in all required billing information');
      return false;
    }
    if (!sameAsBilling && (!shippingAddress.fullName || !shippingAddress.street)) {
      setError('Please fill in all required shipping information');
      return false;
    }
    if (paymentMethod === 'stripe' && (!cardDetails.cardNumber || !cardDetails.cvc)) {
      setError('Please fill in all card details');
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    try {
      setProcessingPayment(true);
      setError('');

      // Run fraud and geo checks
      await runFraudCheck();
      await runGeoCheck();

      // If high fraud risk, ask for confirmation
      if (fraudCheckResult?.isSuspicious && fraudCheckResult.riskScore > 75) {
        // User sees warning and can choose to continue
        return;
      }

      // Process payment
      const response = await axios.post(
        `/api/phase4/payments/charge`,
        {
          amount: getGrandTotal(),
          paymentMethod,
          cardDetails: paymentMethod === 'stripe' ? cardDetails : undefined,
          billingAddress,
          shippingAddress: sameAsBilling ? billingAddress : shippingAddress,
          items: cartItems,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrderConfirmation(response.data);
      setCartItems([]; // Clear cart
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Show order confirmation
  if (orderConfirmation) {
    return (
      <div className="checkout-container">
        <div className="confirmation-card">
          <div className="confirmation-success">
            <div className="success-icon">✓</div>
            <h1>Order Confirmed!</h1>
            <p className="confirmation-number">Order #{orderConfirmation.orderId}</p>
          </div>

          <div className="confirmation-details">
            <div className="detail-section">
              <h3>Order Summary</h3>
              <p><strong>Amount:</strong> ${getGrandTotal().toFixed(2)}</p>
              <p><strong>Payment Method:</strong> {paymentMethod === 'stripe' ? 'Credit Card' : 'PayPal'}</p>
              <p><strong>Status:</strong> <span className="badge-success">Paid</span></p>
            </div>

            <div className="detail-section">
              <h3>Shipping Address</h3>
              <p>{billingAddress.fullName}</p>
              <p>{billingAddress.street}</p>
              <p>{billingAddress.city}, {billingAddress.state} {billingAddress.zipCode}</p>
              <p>{billingAddress.country}</p>
            </div>

            <div className="detail-section">
              <h3>Delivery Timeline</h3>
              <p>📦 Processing: 1-2 business days</p>
              <p>✈️ Shipping: 3-5 business days</p>
              <p>🚚 Estimated Delivery: 4-7 business days</p>
            </div>
          </div>

          <div className="confirmation-actions">
            <button className="btn-primary" onClick={() => window.location.href = '/orders'}>
              View Order
            </button>
            <button className="btn-secondary" onClick={() => window.location.href = '/'}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>🛒 Checkout</h1>
          <p>Complete your purchase securely</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="checkout-layout">
          {/* Main Checkout Form */}
          <div className="checkout-form">
            {/* Cart Summary Section */}
            <div className="checkout-section">
              <h2>Order Summary</h2>
              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item._id} className="cart-item">
                      {item.image && <img src={item.image} alt={item.name} />}
                      <div className="item-details">
                        <p className="item-name">{item.name}</p>
                        <p className="item-qty">Qty: {item.quantity}</p>
                      </div>
                      <div className="item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Billing Address Section */}
            <div className="checkout-section">
              <h2>Billing Address</h2>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={billingAddress.fullName}
                  onChange={(e) => setBillingAddress({ ...billingAddress, fullName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={billingAddress.email}
                  onChange={(e) => setBillingAddress({ ...billingAddress, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  value={billingAddress.street}
                  onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={billingAddress.city}
                    onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                    placeholder="New York"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={billingAddress.state}
                    onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input
                    type="text"
                    value={billingAddress.zipCode}
                    onChange={(e) => setBillingAddress({ ...billingAddress, zipCode: e.target.value })}
                    placeholder="10001"
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={billingAddress.country}
                    onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address Section */}
            <div className="checkout-section">
              <h2>Shipping Address</h2>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="sameAsBilling"
                  checked={sameAsBilling}
                  onChange={(e) => setSameAsBilling(e.target.checked)}
                />
                <label htmlFor="sameAsBilling">Same as billing address</label>
              </div>

              {!sameAsBilling && (
                <div className="form-fields">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="form-group">
                    <label>Street Address</label>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        placeholder="New York"
                      />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        placeholder="United States"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="checkout-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <label className={`payment-option ${paymentMethod === 'stripe' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'stripe' | 'paypal')}
                  />
                  <span className="payment-label">💳 Credit Card (Stripe)</span>
                </label>

                <label className={`payment-option ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'stripe' | 'paypal')}
                  />
                  <span className="payment-label">🅿️ PayPal</span>
                </label>
              </div>

              {paymentMethod === 'stripe' && (
                <div className="card-form">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      value={cardDetails.cardNumber}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                      placeholder="4242 4242 4242 4242"
                      maxLength="16"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        value={cardDetails.expiryDate}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                    <div className="form-group">
                      <label>CVC</label>
                      <input
                        type="text"
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        placeholder="123"
                        maxLength="4"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="order-summary">
            <h2>Order Total</h2>

            <div className="summary-line">
              <span>Subtotal:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>

            <div className="summary-line">
              <span>Tax (8%):</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>

            <div className="summary-line">
              <span>Shipping:</span>
              <span className={calculateShipping() === 0 ? 'free' : ''}>
                {calculateShipping() === 0 ? 'FREE' : `$${calculateShipping().toFixed(2)}`}
              </span>
            </div>

            <div className="summary-total">
              <strong>Total:</strong>
              <strong>${getGrandTotal().toFixed(2)}</strong>
            </div>

            {/* Fraud Check Status */}
            {fraudCheckResult && (
              <div className={`fraud-status ${fraudCheckResult.isSuspicious ? 'suspicious' : 'safe'}`}>
                <p>
                  {fraudCheckResult.isSuspicious ? '⚠️ Fraud Check' : '✓ Fraud Check'}
                </p>
                <p className="status-text">
                  Risk Score: {fraudCheckResult.riskScore}
                </p>
              </div>
            )}

            {/* Geo Risk Status */}
            {geoRiskResult && (
              <div className={`geo-status ${geoRiskResult.riskScore > 50 ? 'high-risk' : 'low-risk'}`}>
                <p>Geographic Check</p>
                <p className="status-text">
                  {geoRiskResult.country} - Risk: {geoRiskResult.riskScore}
                </p>
              </div>
            )}

            <button
              className="btn-checkout"
              onClick={handleCheckout}
              disabled={processingPayment || loading}
            >
              {processingPayment ? 'Processing...' : `Complete Purchase`}
            </button>
          </div>
        </div>

        {/* Fraud Warning Modal */}
        {showFraudWarning && fraudCheckResult?.isSuspicious && (
          <div className="modal-overlay" onClick={() => setShowFraudWarning(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="warning-header">
                <h2>⚠️ Fraud Detection Alert</h2>
              </div>
              <div className="warning-body">
                <p className="warning-message">
                  Our fraud detection system identified some unusual activity in your transaction.
                </p>

                <div className="risk-details">
                  <p><strong>Risk Score:</strong> {fraudCheckResult.riskScore}/100</p>
                  <div className="alerts">
                    {fraudCheckResult.alerts.map((alert, index) => (
                      <p key={index} className="alert-item">⚠️ {alert}</p>
                    ))}
                  </div>
                </div>

                <p className="warning-footer">
                  This doesn't mean your transaction will be declined, but we wanted to flag it for your review.
                </p>
              </div>

              <div className="modal-actions">
                <button
                  className="btn-primary"
                  onClick={() => {
                    setShowFraudWarning(false);
                    handleCheckout();
                  }}
                >
                  Continue Anyway
                </button>
                <button className="btn-secondary" onClick={() => setShowFraudWarning(false)}>
                  Review Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
