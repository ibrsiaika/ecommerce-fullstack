import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * PaymentCheckout Component
 * Main payment processing component with Stripe and PayPal integration
 */
export const PaymentCheckout: React.FC<{
  orderId: string;
  amount: number;
  currency: string;
  onSuccess: (transaction: any) => void;
  onError: (error: string) => void;
}> = ({ orderId, amount, currency, onSuccess, onError }) => {
  const [processor, setProcessor] = useState<'stripe' | 'paypal'>('stripe');
  const [loading, setLoading] = useState(false);
  const [savedMethods, setSavedMethods] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [billingAddress, setBillingAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });
  const [geoAnalysis, setGeoAnalysis] = useState<any>(null);

  // Fetch saved payment methods on mount
  useEffect(() => {
    fetchPaymentMethods();
    analyzeGeoRisk();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get('/api/payments/methods', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSavedMethods(response.data.methods);
      if (response.data.methods.length > 0) {
        setSelectedMethodId(response.data.methods[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    }
  };

  const analyzeGeoRisk = async () => {
    try {
      // Get user's IP address (simplified - in production use server-side)
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      const ipAddress = ipResponse.data.ip;

      const analysis = await axios.post(
        '/api/phase4/geo/assess-risk',
        {
          ipAddress,
          countryCode: billingAddress.country,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      setGeoAnalysis(analysis.data.assessment);

      if (analysis.data.assessment.geoRiskScore > 70) {
        onError('High risk location detected. Additional verification required.');
      }
    } catch (error) {
      console.error('Geo analysis failed:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethodId) {
      onError('Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');

      const response = await axios.post(
        '/api/phase4/payments/charge',
        {
          orderId,
          amount,
          currency,
          paymentMethodId: selectedMethodId,
          processor,
          ipAddress: ipResponse.data.ip,
          billingAddress,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      onSuccess(response.data.transaction);
    } catch (error: any) {
      onError(error.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>

      {/* Order Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <p className="text-gray-600">Order Amount</p>
        <p className="text-2xl font-bold">
          {amount.toFixed(2)} {currency}
        </p>
      </div>

      {/* Geo Risk Alert */}
      {geoAnalysis && geoAnalysis.geoRiskScore > 50 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            ⚠️ Geographic risk detected: {geoAnalysis.geoRiskScore}/100
          </p>
          {geoAnalysis.reasons.length > 0 && (
            <ul className="mt-2 text-xs text-yellow-700">
              {geoAnalysis.reasons.map((reason: string, idx: number) => (
                <li key={idx}>• {reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Processor Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Payment Method</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="stripe"
              checked={processor === 'stripe'}
              onChange={(e) => setProcessor(e.target.value as any)}
              className="mr-2"
            />
            <span>Credit/Debit Card (Stripe)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="paypal"
              checked={processor === 'paypal'}
              onChange={(e) => setProcessor(e.target.value as any)}
              className="mr-2"
            />
            <span>PayPal</span>
          </label>
        </div>
      </div>

      {/* Saved Payment Methods */}
      {savedMethods.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Saved Payment Methods</label>
          <select
            value={selectedMethodId}
            onChange={(e) => setSelectedMethodId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a payment method</option>
            {savedMethods.map((method: any) => (
              <option key={method.id} value={method.id}>
                {method.displayName} - {method.last4}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Billing Address */}
      <div className="mb-6 space-y-3">
        <h3 className="font-medium">Billing Address</h3>
        <input
          type="text"
          placeholder="Street"
          value={billingAddress.street}
          onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="City"
            value={billingAddress.city}
            onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="State"
            value={billingAddress.state}
            onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
            className="p-2 border rounded"
          />
        </div>
        <input
          type="text"
          placeholder="Postal Code"
          value={billingAddress.postalCode}
          onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <select
          value={billingAddress.country}
          onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="GB">United Kingdom</option>
          <option value="AU">Australia</option>
          <option value="DE">Germany</option>
          <option value="FR">France</option>
        </select>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : `Pay ${amount.toFixed(2)} ${currency}`}
      </button>
    </div>
  );
};

/**
 * NotificationCenter Component
 * Display user notifications with delivery status
 */
export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/phase4/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.put(
        `/api/phase4/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'fraud_alert':
        return '⚠️';
      case 'payment_succeeded':
        return '✅';
      case 'payment_failed':
        return '❌';
      case 'refund_issued':
        return '💰';
      case 'order_status':
        return '📦';
      case 'account_security':
        return '🔒';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Notifications</h2>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
            {unreadCount} new
          </span>
        )}
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg ${
                notification.readAt ? 'bg-white' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div>
                      {notification.subject && (
                        <p className="font-semibold">{notification.subject}</p>
                      )}
                      <p className="text-sm text-gray-600">{notification.channel}</p>
                    </div>
                  </div>
                  <p className="text-gray-800">{notification.body}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.readAt && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="ml-4 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * GeoRiskAssessment Component
 * Display geographic risk analysis for transactions
 */
export const GeoRiskAssessment: React.FC<{ ipAddress: string; countryCode: string }> = ({
  ipAddress,
  countryCode,
}) => {
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    analyzeRisk();
  }, [ipAddress, countryCode]);

  const analyzeRisk = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        '/api/phase4/geo/assess-risk',
        { ipAddress, countryCode },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setAssessment(response.data.assessment);
    } catch (error) {
      console.error('Risk analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Analyzing...</p>;
  if (!assessment) return null;

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return 'Low Risk';
    if (score < 60) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div className="p-4 bg-white border rounded-lg">
      <h3 className="font-bold mb-4">Geographic Risk Assessment</h3>

      <div className={`mb-4 p-3 rounded ${getRiskColor(assessment.geoRiskScore)} bg-opacity-10`}>
        <p className="text-lg font-bold">
          {assessment.geoRiskScore}/100 - {getRiskLevel(assessment.geoRiskScore)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Location</p>
          <p className="font-semibold">
            {assessment.location.city}, {assessment.location.country}
          </p>
          <p className="text-xs text-gray-500">{assessment.location.timezone}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Country Risk</p>
          <p className="font-semibold">{assessment.countryRisk.countryName}</p>
          <p className="text-xs text-gray-500">
            Risk Score: {assessment.countryRisk.riskScore}/100
          </p>
        </div>
      </div>

      {assessment.vpnDetected && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">⚠️ VPN/Proxy detected</p>
        </div>
      )}

      {assessment.impossibleTravel && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">⚠️ Impossible travel detected</p>
        </div>
      )}

      {assessment.reasons.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm font-semibold text-yellow-800 mb-2">Risk Factors:</p>
          <ul className="text-xs text-yellow-700 space-y-1">
            {assessment.reasons.map((reason: string, idx: number) => (
              <li key={idx}>• {reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * PaymentMethodManager Component
 * Manage saved payment methods
 */
export const PaymentMethodManager: React.FC = () => {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/payments/methods', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMethods(response.data.methods);
    } catch (error) {
      console.error('Failed to fetch methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMethod = async (methodId: string) => {
    try {
      await axios.delete(`/api/payments/methods/${methodId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchMethods();
    } catch (error) {
      console.error('Failed to delete method:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Payment Methods</h2>

      {loading && <p>Loading...</p>}

      {methods.length === 0 ? (
        <p className="text-gray-500">No saved payment methods</p>
      ) : (
        <div className="space-y-3">
          {methods.map((method) => (
            <div key={method.id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{method.displayName}</p>
                  <p className="text-sm text-gray-600">•••• •••• •••• {method.last4}</p>
                  {method.isDefault && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteMethod(method.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
