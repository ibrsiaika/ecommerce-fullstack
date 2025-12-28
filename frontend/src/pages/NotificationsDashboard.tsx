import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NotificationsDashboard.css';

/**
 * NotificationsDashboard Page
 * Real-time alerts and notifications UI with:
 * - Notification center
 * - Delivery channels (Email, SMS, Push, In-App, Webhook)
 * - User preferences
 * - Notification history
 * - Alert templates
 */

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'fraud_alert' | 'payment_confirmation' | 'order_update' | 'account_security' | 'promotional';
  priority: 'low' | 'medium' | 'high' | 'critical';
  channels: Array<'email' | 'sms' | 'push' | 'in_app' | 'webhook'>;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  readAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

interface NotificationPreference {
  _id: string;
  channel: 'email' | 'sms' | 'push' | 'in_app' | 'webhook';
  enabled: boolean;
  frequency: 'immediate' | 'hourly_digest' | 'daily_digest' | 'weekly_digest';
  quietHours?: {
    enabled: boolean;
    startHour: number;
    endHour: number;
  };
  categories?: string[];
}

interface NotificationStats {
  totalReceived: number;
  totalRead: number;
  totalFailed: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byType: {
    [key: string]: number;
  };
}

export const NotificationsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'center' | 'preferences' | 'history' | 'stats'>('center');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (activeTab === 'center') {
      fetchNotifications();
    } else if (activeTab === 'preferences') {
      fetchPreferences();
    } else if (activeTab === 'history') {
      fetchNotificationHistory();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/phase4/notifications/active', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.notifications);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/phase4/notifications/preferences', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPreferences(response.data.preferences);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch preferences');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/phase4/notifications/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.notifications);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/phase4/notifications/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.stats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.put(
        `/api/phase4/notifications/${notificationId}/mark-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchNotifications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark as read');
    }
  };

  const updatePreference = async (preferenceId: string, data: any) => {
    try {
      await axios.put(
        `/api/phase4/notifications/preferences/${preferenceId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('Preference updated');
      fetchPreferences();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update preference');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#8b0000';
      case 'high':
        return '#e74c3c';
      case 'medium':
        return '#f39c12';
      case 'low':
        return '#27ae60';
      default:
        return '#3498db';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fraud_alert':
        return '🚨';
      case 'payment_confirmation':
        return '💳';
      case 'order_update':
        return '📦';
      case 'account_security':
        return '🔒';
      case 'promotional':
        return '🎁';
      default:
        return '📬';
    }
  };

  return (
    <div className="notifications-dashboard">
      <div className="dashboard-header">
        <h1>🔔 Notifications & Alerts</h1>
        <p>Stay informed about your account activity and important updates</p>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'center' ? 'active' : ''}`}
          onClick={() => setActiveTab('center')}
        >
          📬 Notification Center
          {notifications.filter((n) => !n.readAt).length > 0 && (
            <span className="badge">{notifications.filter((n) => !n.readAt).length}</span>
          )}
        </button>
        <button
          className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          ⚙️ Preferences
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📋 History
        </button>
        <button
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistics
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

      {/* Notification Center Tab */}
      {activeTab === 'center' && !loading && (
        <div className="tab-content">
          <h2>Active Notifications</h2>

          {notifications.length === 0 ? (
            <div className="empty-state">
              <p>No active notifications</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notification-item ${notif.readAt ? 'read' : 'unread'}`}
                  onClick={() => setSelectedNotification(notif)}
                >
                  <div className="notification-icon">{getTypeIcon(notif.type)}</div>

                  <div className="notification-content">
                    <div className="notification-title">
                      <h3>{notif.title}</h3>
                      <span
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(notif.priority) }}
                      >
                        {notif.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="notification-message">{notif.message}</p>

                    <div className="notification-meta">
                      <span className="time">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                      {notif.status && (
                        <span className={`status status-${notif.status}`}>
                          {notif.status.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="notification-channels">
                      {notif.channels.map((channel) => (
                        <span key={channel} className="channel-badge">
                          {channel === 'email' && '✉️ Email'}
                          {channel === 'sms' && '📱 SMS'}
                          {channel === 'push' && '🔔 Push'}
                          {channel === 'in_app' && '💬 In-App'}
                          {channel === 'webhook' && '🔗 Webhook'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="notification-actions">
                    {!notif.readAt && (
                      <button
                        className="btn-secondary btn-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif._id);
                        }}
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && !loading && (
        <div className="tab-content">
          <h2>Notification Preferences</h2>

          <div className="preferences-grid">
            {preferences.map((pref) => (
              <div key={pref._id} className="preference-card">
                <h3>
                  {pref.channel === 'email' && '✉️ Email'}
                  {pref.channel === 'sms' && '📱 SMS'}
                  {pref.channel === 'push' && '🔔 Push Notifications'}
                  {pref.channel === 'in_app' && '💬 In-App Messages'}
                  {pref.channel === 'webhook' && '🔗 Webhooks'}
                </h3>

                <div className="preference-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={pref.enabled}
                      onChange={(e) =>
                        updatePreference(pref._id, { enabled: e.target.checked })
                      }
                    />
                    Enabled
                  </label>
                </div>

                <div className="preference-item">
                  <label htmlFor={`freq-${pref._id}`}>Frequency:</label>
                  <select
                    id={`freq-${pref._id}`}
                    value={pref.frequency}
                    onChange={(e) => updatePreference(pref._id, { frequency: e.target.value })}
                  >
                    <option value="immediate">Immediate</option>
                    <option value="hourly_digest">Hourly Digest</option>
                    <option value="daily_digest">Daily Digest</option>
                    <option value="weekly_digest">Weekly Digest</option>
                  </select>
                </div>

                {pref.quietHours && (
                  <div className="preference-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={pref.quietHours.enabled}
                        onChange={(e) =>
                          updatePreference(pref._id, {
                            quietHours: {
                              ...pref.quietHours,
                              enabled: e.target.checked,
                            },
                          })
                        }
                      />
                      Quiet Hours
                    </label>
                    {pref.quietHours.enabled && (
                      <div className="quiet-hours">
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={pref.quietHours.startHour}
                          onChange={(e) =>
                            updatePreference(pref._id, {
                              quietHours: {
                                ...pref.quietHours,
                                startHour: parseInt(e.target.value),
                              },
                            })
                          }
                        />
                        <span>to</span>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={pref.quietHours.endHour}
                          onChange={(e) =>
                            updatePreference(pref._id, {
                              quietHours: {
                                ...pref.quietHours,
                                endHour: parseInt(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && !loading && (
        <div className="tab-content">
          <h2>Notification History</h2>

          {notifications.length === 0 ? (
            <div className="empty-state">
              <p>No notification history</p>
            </div>
          ) : (
            <div className="history-list">
              {notifications.map((notif) => (
                <div key={notif._id} className="history-item">
                  <div className="history-icon">{getTypeIcon(notif.type)}</div>
                  <div className="history-content">
                    <p className="history-title">{notif.title}</p>
                    <p className="history-time">{new Date(notif.createdAt).toLocaleString()}</p>
                  </div>
                  <span
                    className="history-status"
                    style={{ backgroundColor: getPriorityColor(notif.priority) }}
                  >
                    {notif.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && !loading && stats && (
        <div className="tab-content">
          <h2>Notification Statistics</h2>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalReceived}</div>
              <div className="stat-label">Total Received</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">{stats.totalRead}</div>
              <div className="stat-label">Total Read</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">{stats.totalFailed}</div>
              <div className="stat-label">Delivery Failed</div>
            </div>

            <div className="stat-card">
              <div className="stat-percent">
                {((stats.totalRead / stats.totalReceived) * 100).toFixed(0)}%
              </div>
              <div className="stat-label">Read Rate</div>
            </div>
          </div>

          <div className="stats-breakdown">
            <div className="breakdown-section">
              <h3>By Priority</h3>
              <div className="priority-breakdown">
                {Object.entries(stats.byPriority).map(([priority, count]) => (
                  <div key={priority} className="breakdown-item">
                    <span className="breakdown-label">{priority.toUpperCase()}</span>
                    <div className="breakdown-bar">
                      <div
                        className="breakdown-fill"
                        style={{
                          width: `${(count / stats.totalReceived) * 100}%`,
                          backgroundColor: getPriorityColor(priority),
                        }}
                      ></div>
                    </div>
                    <span className="breakdown-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="breakdown-section">
              <h3>By Type</h3>
              <div className="type-breakdown">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="breakdown-item">
                    <span className="breakdown-label">{type}</span>
                    <div className="breakdown-bar">
                      <div
                        className="breakdown-fill"
                        style={{
                          width: `${(count / stats.totalReceived) * 100}%`,
                          backgroundColor: '#3498db',
                        }}
                      ></div>
                    </div>
                    <span className="breakdown-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="modal-overlay" onClick={() => setSelectedNotification(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedNotification.title}</h2>
              <button className="btn-close" onClick={() => setSelectedNotification(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-group">
                <label>Type</label>
                <p>{selectedNotification.type}</p>
              </div>

              <div className="detail-group">
                <label>Priority</label>
                <p>
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(selectedNotification.priority) }}
                  >
                    {selectedNotification.priority.toUpperCase()}
                  </span>
                </p>
              </div>

              <div className="detail-group">
                <label>Message</label>
                <p>{selectedNotification.message}</p>
              </div>

              <div className="detail-group">
                <label>Delivery Channels</label>
                <p>
                  {selectedNotification.channels.map((ch) => (
                    <span key={ch} className="channel-badge">
                      {ch}
                    </span>
                  ))}
                </p>
              </div>

              <div className="detail-group">
                <label>Status</label>
                <p>{selectedNotification.status}</p>
              </div>

              <div className="detail-group">
                <label>Sent At</label>
                <p>{new Date(selectedNotification.createdAt).toLocaleString()}</p>
              </div>

              {selectedNotification.deliveredAt && (
                <div className="detail-group">
                  <label>Delivered At</label>
                  <p>{new Date(selectedNotification.deliveredAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDashboard;
