import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  orderStatus: string;
  trackingNumber?: string;
}

const AdminOrders: React.FC = () => {
  const { user } = useAppSelector((state: any) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || user.role !== 'admin') return;

      try {
        const response = await fetch('/api/orders', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          setOrders(result.data || []);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch orders');
        }
      } catch (err) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const updateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    setUpdatingOrder(orderId);
    
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ 
          status,
          trackingNumber: trackingNumber || undefined
        })
      });

      if (response.ok) {
        const result = await response.json();
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, ...result.data } : order
        ));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update order status');
      }
    } catch (err) {
      alert('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const markAsDelivered = async (orderId: string) => {
    setUpdatingOrder(orderId);
    
    try {
      const response = await fetch(`/api/orders/${orderId}/deliver`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setOrders(orders.map(order => 
          order._id === orderId ? result.data : order
        ));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to mark order as delivered');
      }
    } catch (err) {
      alert('Failed to mark order as delivered');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black"></div>
          </div>
          <p className="text-xl text-gray-600 font-semibold">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container py-16">
          <div className="p-6 rounded-xl bg-red-50 border-2 border-red-200">
            <p className="text-red-700 font-semibold text-lg">⚠️ {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-16 lg:py-20">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3">📦 Order Management</h1>
              <p className="text-xl text-gray-600">Manage all customer orders and update statuses</p>
            </div>
            <div className="surface rounded-xl p-6 border border-gray-200">
              <p className="text-sm text-gray-600 font-semibold uppercase tracking-widest mb-2">Total Orders</p>
              <p className="text-4xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-8">📦</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No Orders Yet</h3>
            <p className="text-xl text-gray-600 mb-10">Orders will appear here once customers start placing them.</p>
          </div>
        ) : (
          <div className="surface rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-widest text-gray-700">Order</th>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-widest text-gray-700">Customer</th>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-widest text-gray-700">Date</th>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-widest text-gray-700">Amount</th>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-widest text-gray-700">Payment</th>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-widest text-gray-700">Status</th>
                    <th className="px-8 py-4 text-left text-sm font-bold uppercase tracking-widest text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-8 py-6">
                        <div>
                          <p className="text-lg font-bold text-gray-900">#{order.orderNumber}</p>
                          {order.trackingNumber && (
                            <p className="text-sm text-gray-600 mt-1">📍 {order.trackingNumber}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <p className="font-bold text-gray-900">{order.user.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-gray-900 font-semibold">{formatDate(order.createdAt)}</td>
                      <td className="px-8 py-6">
                        <p className="text-2xl font-bold text-gray-900">${order.totalPrice.toFixed(2)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex px-4 py-2 rounded-full font-bold text-sm ${
                          order.isPaid
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.isPaid ? '✓ Paid' : '⏳ Pending'}
                        </span>
                        {order.isPaid && order.paidAt && (
                          <p className="text-xs text-gray-600 mt-2">{formatDate(order.paidAt)}</p>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex px-4 py-2 rounded-full font-bold text-sm ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                        {order.isDelivered && order.deliveredAt && (
                          <p className="text-xs text-gray-600 mt-2">📦 {formatDate(order.deliveredAt)}</p>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <Link
                            to={`/order/${order._id}`}
                            className="btn btn-outline text-sm px-4 py-2 rounded-lg font-bold w-full text-center hover:bg-gray-50 transition-colors"
                          >
                            View
                          </Link>
                          
                          {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                            <div className="space-y-2">
                              {order.orderStatus === 'pending' && (
                                <button
                                  onClick={() => updateOrderStatus(order._id, 'processing')}
                                  disabled={updatingOrder === order._id}
                                  className="text-sm px-4 py-2 rounded-lg font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 w-full transition-colors disabled:opacity-50"
                                >
                                  ⚙️ Process
                                </button>
                              )}
                              
                              {order.orderStatus === 'processing' && (
                                <button
                                  onClick={() => {
                                    const trackingNumber = prompt('Enter tracking number (optional):');
                                    updateOrderStatus(order._id, 'shipped', trackingNumber || undefined);
                                  }}
                                  disabled={updatingOrder === order._id}
                                  className="text-sm px-4 py-2 rounded-lg font-bold bg-purple-50 text-purple-600 hover:bg-purple-100 w-full transition-colors disabled:opacity-50"
                                >
                                  🚚 Ship
                                </button>
                              )}
                              
                              {order.orderStatus === 'shipped' && (
                                <button
                                  onClick={() => markAsDelivered(order._id)}
                                  disabled={updatingOrder === order._id}
                                  className="text-sm px-4 py-2 rounded-lg font-bold bg-green-50 text-green-600 hover:bg-green-100 w-full transition-colors disabled:opacity-50"
                                >
                                  ✓ Deliver
                                </button>
                              )}
                              
                              <button
                                onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                disabled={updatingOrder === order._id}
                                className="text-sm px-4 py-2 rounded-lg font-bold bg-red-50 text-red-600 hover:bg-red-100 w-full transition-colors disabled:opacity-50"
                              >
                                ✕ Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;