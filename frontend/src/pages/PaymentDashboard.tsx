import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PaymentDashboard.css';

/**
 * PaymentDashboard Page
 * Complete payment management UI with:
 * - Payment method management (add, edit, delete)
 * - Transaction history
 * - Fraud detection integration
 * - Geographic risk assessment
 */

interface PaymentMethod {
  _id: string;
  paymentType: string;
  cardLastFour?: string;
  cardBrand?: string;
  paypalEmail?: string;
  isDefault: boolean;
  riskLevel: string;
  lastUsedAt: string;
  createdAt: string;
}

interface Transaction {
  _id: string;
  orderId: string;
  amount: number;
  currency: string;
  processor: string;
  status: string;
  geoRiskScore: number;
  fraudScore: number;
  stripeChargeId?: string;
  paypalTransactionId?: string;
  failureReason?: string;
  createdAt: string;
}

interface GeoAnalysis {
  ipAddress: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  geoRiskScore: number;
  impossibleTravel: boolean;
  vpnDetected: boolean;
  timezone: string;
}

export const PaymentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'methods' | 'transactions' | 'geoanalysis'>('methods');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [geoAnalysis, setGeoAnalysis] = useState<GeoAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Fetch data on mount and tab change
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (activeTab === 'methods') {
      fetchPaymentMethods(token);
    } else if (activeTab === 'transactions') {
      fetchTransactions(token);
    } else if (activeTab === 'geoanalysis') {
      analyzeGeoRisk(token);
    }
  }, [activeTab]);

  const fetchPaymentMethods = async (token: string | null) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/phase4/payments/methods', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentMethods(response.data.methods);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payment methods');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (token: string | null) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/phase4/payments/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(response.data.transactions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const analyzeGeoRisk = async (token: string | null) => {
    try {
      setLoading(true);
      // Get user's IP
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      const ipAddress = ipResponse.data.ip;

      const response = await axios.post(
        '/api/phase4/geo/analyze',
        { ipAddress },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGeoAnalysis(response.data.analysis);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to analyze geographic risk');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/phase4/payments/methods/${methodId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Payment method deleted');
      fetchPaymentMethods(token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete payment method');
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/phase4/payments/methods/${methodId}/set-default`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('Default payment method updated');
      fetchPaymentMethods(token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update default method');
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 40) return '#27ae60'; // Green
    if (score < 60) return '#f39c12'; // Orange
    if (score < 80) return '#e74c3c'; // Red
    return '#8b0000'; // Dark red
  };

  return (
    <div className="payment-dashboard">
      <div className="dashboard-header">
        <h1>💳 Payment Dashboard</h1>
        <p>Manage payments, view transactions, and monitor geographic risk</p>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'methods' ? 'active' : ''}`}
          onClick={() => setActiveTab('methods')}
        >
          💳 Payment Methods
        </button>
        <button
          className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          📊 Transactions
        </button>
        <button
          className={`tab-button ${activeTab === 'geoanalysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('geoanalysis')}
        >
          🌍 Geographic Risk
        </button>
      </div>

      {/* Alert Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'methods' && !loading && (
        <div className="tab-content">
          <div className="methods-header">
            <h2>Your Payment Methods</h2>
            <button className="btn-primary" onClick={() => setShowAddMethod(!showAddMethod)}>
              + Add Payment Method
            </button>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="empty-state">
              <p>No payment methods added yet</p>
              <button className="btn-primary" onClick={() => setShowAddMethod(true)}>
                Add Your First Payment Method
              </button>
            </div>
          ) : (
            <div className="methods-grid">
              {paymentMethods.map((method) => (
                <div key={method._id} className="method-card">
                  <div className="method-header">
                    <span className="method-type">{method.paymentType.toUpperCase()}</span>
                    {method.isDefault && <span className="badge-default">DEFAULT</span>}
                  </div>

                  <div className="method-info">
                    {method.paymentType === 'credit_card' || method.paymentType === 'debit_card' ? (
                      <>
                        <p className="method-number">
                          {method.cardBrand?.toUpperCase()} •••• {method.cardLastFour}
                        </p>
                      </>
                    ) : (
                      <p className="method-email">{method.paypalEmail}</p>
                    )}
                  </div>

                  <div className="method-risk">
                    <span className="risk-label">Risk Level:</span>
                    <span
                      className="risk-badge"
                      style={{ backgroundColor: getRiskColor(method.riskLevel === 'low' ? 20 : 60) }}
                    >
                      {method.riskLevel.toUpperCase()}
                    </span>
                  </div>

                  <div className="method-meta">
                    <small>Last used: {new Date(method.lastUsedAt).toLocaleDateString()}</small>
                  </div>

                  <div className="method-actions">
                    {!method.isDefault && (
                      <button
                        className="btn-secondary"
                        onClick={() => handleSetDefault(method._id)}
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      className="btn-danger"
                      onClick={() => handleDeletePaymentMethod(method._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && !loading && (
        <div className="tab-content">
          <h2>Transaction History</h2>

          {transactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="transactions-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Amount</th>
                    <th>Processor</th>
                    <th>Status</th>
                    <th>Fraud Score</th>
                    <th>Geo Risk</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn._id} className={`status-${txn.status}`}>
                      <td>{txn.orderId}</td>
                      <td>${(txn.amount / 100).toFixed(2)}</td>
                      <td>{txn.processor.toUpperCase()}</td>
                      <td>
                        <span className={`status-badge status-${txn.status}`}>
                          {txn.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div
                          className="risk-bar"
                          style={{
                            width: `${txn.fraudScore}%`,
                            backgroundColor: getRiskColor(txn.fraudScore),
                          }}
                        >
                          {txn.fraudScore}
                        </div>
                      </td>
                      <td>
                        <div
                          className="risk-bar"
                          style={{
                            width: `${txn.geoRiskScore}%`,
                            backgroundColor: getRiskColor(txn.geoRiskScore),
                          }}
                        >
                          {txn.geoRiskScore}
                        </div>
                      </td>
                      <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn-secondary btn-small"
                          onClick={() => setSelectedTransaction(txn)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Geographic Risk Analysis Tab */}
      {activeTab === 'geoanalysis' && !loading && geoAnalysis && (
        <div className="tab-content">
          <h2>Geographic Risk Analysis</h2>

          <div className="geo-analysis-grid">
            {/* Current Location Card */}
            <div className="geo-card">
              <h3>📍 Current Location</h3>
              <div className="geo-info">
                <p>
                  <strong>Country:</strong> {geoAnalysis.country}
                </p>
                <p>
                  <strong>City:</strong> {geoAnalysis.city}
                </p>
                <p>
                  <strong>IP Address:</strong> {geoAnalysis.ipAddress}
                </p>
                <p>
                  <strong>Timezone:</strong> {geoAnalysis.timezone}
                </p>
                <p>
                  <strong>Coordinates:</strong> {geoAnalysis.latitude.toFixed(2)}, {geoAnalysis.longitude.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Risk Assessment Card */}
            <div className="geo-card">
              <h3>⚠️ Risk Assessment</h3>
              <div className="risk-score-large">
                <div
                  className="risk-circle"
                  style={{
                    background: `conic-gradient(${getRiskColor(geoAnalysis.geoRiskScore)} ${geoAnalysis.geoRiskScore}%, #e0e0e0 0%)`,
                  }}
                >
                  <span>{geoAnalysis.geoRiskScore}</span>
                </div>
                <p>Geographic Risk Score</p>
              </div>

              {geoAnalysis.impossibleTravel && (
                <div className="alert alert-warning">
                  ⚡ Impossible travel detected! Order location differs from your profile.
                </div>
              )}

              {geoAnalysis.vpnDetected && (
                <div className="alert alert-warning">
                  🔒 VPN detected. Your true location may be hidden.
                </div>
              )}
            </div>

            {/* Restrictions Card */}
            <div className="geo-card">
              <h3>🚫 Shipping Restrictions</h3>
              <p>
                Orders to <strong>{geoAnalysis.country}</strong> may face:
              </p>
              <ul>
                <li>Higher payment processor fees</li>
                <li>Longer processing times</li>
                <li>Additional verification requirements</li>
                <li>Restricted product categories</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="modal-overlay" onClick={() => setSelectedTransaction(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transaction Details</h2>
              <button className="btn-close" onClick={() => setSelectedTransaction(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-group">
                <label>Order ID</label>
                <p>{selectedTransaction.orderId}</p>
              </div>

              <div className="detail-group">
                <label>Amount</label>
                <p>${(selectedTransaction.amount / 100).toFixed(2)} {selectedTransaction.currency}</p>
              </div>

              <div className="detail-group">
                <label>Processor</label>
                <p>{selectedTransaction.processor.toUpperCase()}</p>
              </div>

              <div className="detail-group">
                <label>Status</label>
                <p>
                  <span className={`status-badge status-${selectedTransaction.status}`}>
                    {selectedTransaction.status.toUpperCase()}
                  </span>
                </p>
              </div>

              <div className="detail-group">
                <label>Fraud Score</label>
                <div
                  className="risk-bar"
                  style={{
                    width: `${selectedTransaction.fraudScore}%`,
                    backgroundColor: getRiskColor(selectedTransaction.fraudScore),
                  }}
                >
                  {selectedTransaction.fraudScore}
                </div>
              </div>

              <div className="detail-group">
                <label>Geographic Risk</label>
                <div
                  className="risk-bar"
                  style={{
                    width: `${selectedTransaction.geoRiskScore}%`,
                    backgroundColor: getRiskColor(selectedTransaction.geoRiskScore),
                  }}
                >
                  {selectedTransaction.geoRiskScore}
                </div>
              </div>

              {selectedTransaction.failureReason && (
                <div className="detail-group alert alert-error">
                  <label>Failure Reason</label>
                  <p>{selectedTransaction.failureReason}</p>
                </div>
              )}

              <div className="detail-group">
                <label>Date</label>
                <p>{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
              </div>

              {selectedTransaction.stripeChargeId && (
                <div className="detail-group">
                  <label>Stripe Charge ID</label>
                  <p className="code">{selectedTransaction.stripeChargeId}</p>
                </div>
              )}

              {selectedTransaction.paypalTransactionId && (
                <div className="detail-group">
                  <label>PayPal Transaction ID</label>
                  <p className="code">{selectedTransaction.paypalTransactionId}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDashboard;
