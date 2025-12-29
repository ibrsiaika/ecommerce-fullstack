import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GeographicDashboard.css';

/**
 * GeographicDashboard Page
 * Geographic Intelligence & Risk Analysis UI with:
 * - Geographic heat map visualization
 * - Country-level risk scoring
 * - Impossible travel detection
 * - VPN/Proxy detection alerts
 * - Shipping restrictions by region
 * - Travel history timeline
 */

interface GeoLocation {
  _id: string;
  country: string;
  countryCode: string;
  city: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  lastSeen: Date;
  accessCount: number;
  isVpn: boolean;
  isProxy: boolean;
}

interface CountryRisk {
  country: string;
  countryCode: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  fraudCaseCount: number;
  lastIncident?: Date;
}

interface ImpossibleTravel {
  _id: string;
  fromCountry: string;
  toCountry: string;
  fromTime: Date;
  toTime: Date;
  hoursElapsed: number;
  distanceKm: number;
  requiredSpeedKmh: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'flagged' | 'verified' | 'ignored';
}

interface ShippingRestriction {
  _id: string;
  country: string;
  countryCode: string;
  restricted: boolean;
  restrictionReason?: string;
  allowedShippingMethods?: string[];
  averageDeliveryDays?: number;
}

export const GeographicDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'locations' | 'countries' | 'travel' | 'shipping' | 'analytics'>('locations');
  const [locations, setLocations] = useState<GeoLocation[]>([]);
  const [countries, setCountries] = useState<CountryRisk[]>([]);
  const [impossibleTravels, setImpossibleTravels] = useState<ImpossibleTravel[]>([]);
  const [shippingRestrictions, setShippingRestrictions] = useState<ShippingRestriction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (activeTab === 'locations') {
      fetchLocations();
    } else if (activeTab === 'countries') {
      fetchCountries();
    } else if (activeTab === 'travel') {
      fetchImpossibleTravels();
    } else if (activeTab === 'shipping') {
      fetchShippingRestrictions();
    }
  }, [activeTab]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/phase4/geo/locations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations(response.data.locations);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/phase4/geo/countries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCountries(response.data.countries);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch countries');
    } finally {
      setLoading(false);
    }
  };

  const fetchImpossibleTravels = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/phase4/geo/impossible-travels', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setImpossibleTravels(response.data.travels);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch impossible travels');
    } finally {
      setLoading(false);
    }
  };

  const fetchShippingRestrictions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/phase4/geo/shipping-restrictions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShippingRestrictions(response.data.restrictions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch shipping restrictions');
    } finally {
      setLoading(false);
    }
  };

  const updateTravelStatus = async (travelId: string, status: string) => {
    try {
      await axios.put(
        `/api/phase4/geo/impossible-travels/${travelId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('Travel status updated');
      fetchImpossibleTravels();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update travel status');
    }
  };

  const getRiskColor = (risk: number | string) => {
    if (typeof risk === 'string') {
      switch (risk) {
        case 'low':
          return '#27ae60';
        case 'medium':
          return '#f39c12';
        case 'high':
          return '#e74c3c';
        case 'critical':
          return '#8b0000';
        default:
          return '#3498db';
      }
    }
    if (risk < 25) return '#27ae60';
    if (risk < 50) return '#f39c12';
    if (risk < 75) return '#e74c3c';
    return '#8b0000';
  };

  return (
    <div className="geographic-dashboard">
      <div className="dashboard-header">
        <h1>🌍 Geographic Intelligence</h1>
        <p>Monitor global activity, detect risks, and manage geographic restrictions</p>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveTab('locations')}
        >
          📍 Locations
          {locations.some((l) => l.riskScore > 50) && (
            <span className="alert-badge">{locations.filter((l) => l.riskScore > 50).length}</span>
          )}
        </button>
        <button
          className={`tab-button ${activeTab === 'countries' ? 'active' : ''}`}
          onClick={() => setActiveTab('countries')}
        >
          🗺️ Countries
        </button>
        <button
          className={`tab-button ${activeTab === 'travel' ? 'active' : ''}`}
          onClick={() => setActiveTab('travel')}
        >
          ✈️ Impossible Travel
          {impossibleTravels.filter((t) => t.status === 'flagged').length > 0 && (
            <span className="alert-badge">{impossibleTravels.filter((t) => t.status === 'flagged').length}</span>
          )}
        </button>
        <button
          className={`tab-button ${activeTab === 'shipping' ? 'active' : ''}`}
          onClick={() => setActiveTab('shipping')}
        >
          📦 Shipping Restrictions
        </button>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      {/* Alert Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading geographic data...</p>
        </div>
      )}

      {/* Locations Tab */}
      {activeTab === 'locations' && !loading && (
        <div className="tab-content">
          <h2>Access Locations</h2>

          {locations.length === 0 ? (
            <div className="empty-state">
              <p>No location data available</p>
            </div>
          ) : (
            <div className="locations-grid">
              {locations.map((loc) => (
                <div
                  key={loc._id}
                  className="location-card"
                  onClick={() => setSelectedLocation(loc)}
                  style={{ borderLeftColor: getRiskColor(loc.riskScore) }}
                >
                  <div className="location-header">
                    <div>
                      <h3>{loc.city}, {loc.country}</h3>
                      <p className="location-code">{loc.countryCode}</p>
                    </div>
                    <div className="location-risk">
                      <div
                        className="risk-circle"
                        style={{ backgroundColor: getRiskColor(loc.riskScore) }}
                      >
                        {Math.round(loc.riskScore)}
                      </div>
                    </div>
                  </div>

                  <div className="location-details">
                    <div className="detail-item">
                      <span className="detail-label">Coordinates:</span>
                      <span className="detail-value">
                        {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Access Count:</span>
                      <span className="detail-value">{loc.accessCount}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Last Seen:</span>
                      <span className="detail-value">{new Date(loc.lastSeen).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="location-flags">
                    {loc.isVpn && <span className="flag-badge flag-vpn">🔐 VPN</span>}
                    {loc.isProxy && <span className="flag-badge flag-proxy">🔗 Proxy</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Countries Tab */}
      {activeTab === 'countries' && !loading && (
        <div className="tab-content">
          <h2>Country Risk Assessment</h2>

          {countries.length === 0 ? (
            <div className="empty-state">
              <p>No country risk data</p>
            </div>
          ) : (
            <div className="countries-table">
              <table>
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Risk Level</th>
                    <th>Risk Score</th>
                    <th>Fraud Cases</th>
                    <th>Last Incident</th>
                  </tr>
                </thead>
                <tbody>
                  {countries.map((country) => (
                    <tr key={country.country}>
                      <td>
                        <span className="country-flag">{country.countryCode}</span>
                        {country.country}
                      </td>
                      <td>
                        <span
                          className="risk-level-badge"
                          style={{ backgroundColor: getRiskColor(country.riskLevel) }}
                        >
                          {country.riskLevel.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="risk-bar">
                          <div
                            className="risk-fill"
                            style={{
                              width: `${country.riskScore}%`,
                              backgroundColor: getRiskColor(country.riskScore),
                            }}
                          ></div>
                        </div>
                        <span className="risk-value">{country.riskScore}</span>
                      </td>
                      <td>{country.fraudCaseCount}</td>
                      <td>
                        {country.lastIncident
                          ? new Date(country.lastIncident).toLocaleDateString()
                          : 'No incidents'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Impossible Travel Tab */}
      {activeTab === 'travel' && !loading && (
        <div className="tab-content">
          <h2>Impossible Travel Detection</h2>

          {impossibleTravels.length === 0 ? (
            <div className="empty-state">
              <p>No impossible travel events detected</p>
            </div>
          ) : (
            <div className="travel-list">
              {impossibleTravels.map((travel) => (
                <div
                  key={travel._id}
                  className={`travel-card status-${travel.status}`}
                  style={{ borderLeftColor: getRiskColor(travel.riskLevel) }}
                >
                  <div className="travel-header">
                    <div className="travel-route">
                      <h3>{travel.fromCountry} → {travel.toCountry}</h3>
                      <p className="travel-distance">{travel.distanceKm} km</p>
                    </div>
                    <div className="travel-risk">
                      <span
                        className="risk-badge"
                        style={{ backgroundColor: getRiskColor(travel.riskLevel) }}
                      >
                        {travel.riskLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="travel-details">
                    <div className="detail-item">
                      <span className="detail-label">From:</span>
                      <span className="detail-value">{new Date(travel.fromTime).toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">To:</span>
                      <span className="detail-value">{new Date(travel.toTime).toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Hours Elapsed:</span>
                      <span className="detail-value">{travel.hoursElapsed}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Required Speed:</span>
                      <span className="detail-value">{Math.round(travel.requiredSpeedKmh)} km/h</span>
                    </div>
                  </div>

                  {travel.status === 'flagged' && (
                    <div className="travel-actions">
                      <button
                        className="btn-primary"
                        onClick={() => updateTravelStatus(travel._id, 'verified')}
                      >
                        ✓ Mark as Verified
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => updateTravelStatus(travel._id, 'ignored')}
                      >
                        ✕ Ignore
                      </button>
                    </div>
                  )}
                  {travel.status !== 'flagged' && (
                    <div className="travel-status">
                      <span className="status-badge" style={{ backgroundColor: getRiskColor(travel.riskLevel) }}>
                        {travel.status.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Shipping Restrictions Tab */}
      {activeTab === 'shipping' && !loading && (
        <div className="tab-content">
          <h2>Shipping Restrictions by Country</h2>

          {shippingRestrictions.length === 0 ? (
            <div className="empty-state">
              <p>No shipping restrictions</p>
            </div>
          ) : (
            <div className="shipping-grid">
              {shippingRestrictions.map((restriction) => (
                <div
                  key={restriction._id}
                  className={`shipping-card ${restriction.restricted ? 'restricted' : 'allowed'}`}
                >
                  <div className="shipping-header">
                    <h3>{restriction.country}</h3>
                    <span className="country-code">{restriction.countryCode}</span>
                  </div>

                  <div className="shipping-status">
                    {restriction.restricted ? (
                      <div className="status-restricted">
                        <span className="status-icon">🚫</span>
                        <span className="status-text">RESTRICTED</span>
                      </div>
                    ) : (
                      <div className="status-allowed">
                        <span className="status-icon">✓</span>
                        <span className="status-text">ALLOWED</span>
                      </div>
                    )}
                  </div>

                  {restriction.restricted && restriction.restrictionReason && (
                    <div className="restriction-reason">
                      <p>{restriction.restrictionReason}</p>
                    </div>
                  )}

                  {!restriction.restricted && (
                    <div className="shipping-methods">
                      <label>Allowed Methods:</label>
                      <div className="methods-list">
                        {restriction.allowedShippingMethods?.map((method) => (
                          <span key={method} className="method-tag">
                            {method}
                          </span>
                        ))}
                      </div>
                      {restriction.averageDeliveryDays && (
                        <p className="delivery-time">
                          ⏱️ Average delivery: {restriction.averageDeliveryDays} days
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && !loading && (
        <div className="tab-content">
          <h2>Geographic Analytics</h2>

          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Total Locations</h3>
              <div className="analytics-number">{locations.length}</div>
              <p className="analytics-label">Unique locations tracked</p>
            </div>

            <div className="analytics-card">
              <h3>High-Risk Locations</h3>
              <div className="analytics-number">
                {locations.filter((l) => l.riskScore > 75).length}
              </div>
              <p className="analytics-label">Locations with critical risk</p>
            </div>

            <div className="analytics-card">
              <h3>VPN/Proxy Usage</h3>
              <div className="analytics-number">
                {locations.filter((l) => l.isVpn || l.isProxy).length}
              </div>
              <p className="analytics-label">Anonymous access attempts</p>
            </div>

            <div className="analytics-card">
              <h3>Flagged Travels</h3>
              <div className="analytics-number">
                {impossibleTravels.filter((t) => t.status === 'flagged').length}
              </div>
              <p className="analytics-label">Impossible travel events</p>
            </div>

            <div className="analytics-card">
              <h3>Restricted Countries</h3>
              <div className="analytics-number">
                {shippingRestrictions.filter((s) => s.restricted).length}
              </div>
              <p className="analytics-label">Countries with shipping restrictions</p>
            </div>

            <div className="analytics-card">
              <h3>Average Risk Score</h3>
              <div className="analytics-number">
                {locations.length > 0
                  ? Math.round(locations.reduce((sum, l) => sum + l.riskScore, 0) / locations.length)
                  : 0}
              </div>
              <p className="analytics-label">Across all locations</p>
            </div>
          </div>

          {/* Top Countries by Risk */}
          <div className="top-risks">
            <h3>Top 10 Countries by Risk Score</h3>
            <div className="risk-list">
              {countries
                .sort((a, b) => b.riskScore - a.riskScore)
                .slice(0, 10)
                .map((country) => (
                  <div key={country.country} className="risk-item">
                    <span className="country-name">{country.country}</span>
                    <div className="risk-bar">
                      <div
                        className="risk-fill"
                        style={{
                          width: `${country.riskScore}%`,
                          backgroundColor: getRiskColor(country.riskScore),
                        }}
                      ></div>
                    </div>
                    <span className="risk-score">{country.riskScore}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Location Detail Modal */}
      {selectedLocation && (
        <div className="modal-overlay" onClick={() => setSelectedLocation(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedLocation.city}, {selectedLocation.country}</h2>
              <button className="btn-close" onClick={() => setSelectedLocation(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-group">
                  <label>Country Code</label>
                  <p>{selectedLocation.countryCode}</p>
                </div>

                <div className="detail-group">
                  <label>Risk Score</label>
                  <p>
                    <span
                      className="risk-circle-large"
                      style={{ backgroundColor: getRiskColor(selectedLocation.riskScore) }}
                    >
                      {Math.round(selectedLocation.riskScore)}
                    </span>
                  </p>
                </div>

                <div className="detail-group">
                  <label>Coordinates</label>
                  <p>
                    {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                  </p>
                </div>

                <div className="detail-group">
                  <label>Access Count</label>
                  <p>{selectedLocation.accessCount}</p>
                </div>

                <div className="detail-group">
                  <label>Last Seen</label>
                  <p>{new Date(selectedLocation.lastSeen).toLocaleString()}</p>
                </div>

                <div className="detail-group">
                  <label>VPN/Proxy Status</label>
                  <p>
                    {selectedLocation.isVpn && <span className="flag-badge flag-vpn">🔐 VPN</span>}
                    {selectedLocation.isProxy && <span className="flag-badge flag-proxy">🔗 Proxy</span>}
                    {!selectedLocation.isVpn && !selectedLocation.isProxy && <span>Direct Connection</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeographicDashboard;
