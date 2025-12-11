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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <div className="text-sm text-gray-600">
          Total Orders: {orders.length}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                      {order.trackingNumber && (
                        <div className="text-xs text-gray-500">Track: {order.trackingNumber}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                      <div className="text-sm text-gray-500">{order.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.isPaid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                    {order.isPaid && order.paidAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(order.paidAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}
                    >
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                    {order.isDelivered && order.deliveredAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Delivered: {formatDate(order.deliveredAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="space-y-1">
                      <Link
                        to={`/order/${order._id}`}
                        className="text-blue-600 hover:text-blue-900 block"
                      >
                        View Details
                      </Link>
                      
                      {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                        <div className="space-y-1">
                          {order.orderStatus === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order._id, 'processing')}
                              disabled={updatingOrder === order._id}
                              className="text-blue-600 hover:text-blue-900 block disabled:opacity-50"
                            >
                              Mark Processing
                            </button>
                          )}
                          
                          {order.orderStatus === 'processing' && (
                            <button
                              onClick={() => {
                                const trackingNumber = prompt('Enter tracking number (optional):');
                                updateOrderStatus(order._id, 'shipped', trackingNumber || undefined);
                              }}
                              disabled={updatingOrder === order._id}
                              className="text-purple-600 hover:text-purple-900 block disabled:opacity-50"
                            >
                              Mark Shipped
                            </button>
                          )}
                          
                          {order.orderStatus === 'shipped' && (
                            <button
                              onClick={() => markAsDelivered(order._id)}
                              disabled={updatingOrder === order._id}
                              className="text-green-600 hover:text-green-900 block disabled:opacity-50"
                            >
                              Mark Delivered
                            </button>
                          )}
                          
                          <button
                            onClick={() => updateOrderStatus(order._id, 'cancelled')}
                            disabled={updatingOrder === order._id}
                            className="text-red-600 hover:text-red-900 block disabled:opacity-50"
                          >
                            Cancel Order
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

      {orders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600">Orders will appear here once customers start placing them.</p>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;