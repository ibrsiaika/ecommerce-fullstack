import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  orderStatus: string;
}

const OrderHistory: React.FC = () => {
  const { user } = useAppSelector((state: any) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/orders/myorders', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          setOrders(result.data);
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
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black"></div>
          </div>
          <p className="text-xl text-gray-600 font-semibold">Loading your orders...</p>
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
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Order History</h1>
          <p className="text-xl text-gray-600">Track and manage all your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-8">📦</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No orders yet</h3>
            <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">You haven't placed any orders. Start shopping to see your orders here.</p>
            <Link
              to="/products"
              className="btn btn-primary inline-block px-12 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-shadow"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="surface rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-gray-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-8 items-center">
                  {/* Order Number */}
                  <div>
                    <p className="text-sm text-gray-600 font-semibold uppercase tracking-widest">Order ID</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">#{order.orderNumber}</p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-sm text-gray-600 font-semibold uppercase tracking-widest">Date</p>
                    <p className="text-lg font-semibold text-gray-900 mt-2">{formatDate(order.createdAt)}</p>
                  </div>

                  {/* Total */}
                  <div>
                    <p className="text-sm text-gray-600 font-semibold uppercase tracking-widest">Total</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">${order.totalPrice.toFixed(2)}</p>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <p className="text-sm text-gray-600 font-semibold uppercase tracking-widest">Payment</p>
                    <span className={`inline-flex px-4 py-2 rounded-full font-bold text-sm mt-2 ${
                      order.isPaid
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.isPaid ? '✓ Paid' : '⏳ Pending'}
                    </span>
                  </div>

                  {/* Order Status */}
                  <div>
                    <p className="text-sm text-gray-600 font-semibold uppercase tracking-widest">Status</p>
                    <span className={`inline-flex px-4 py-2 rounded-full font-bold text-sm mt-2 ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      to={`/order/${order._id}`}
                      className="btn btn-outline px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors flex-1"
                    >
                      View Details
                    </Link>
                    {!order.isPaid && (
                      <Link
                        to={`/order/${order._id}/pay`}
                        className="btn btn-primary px-4 py-2 rounded-lg font-bold text-sm hover:shadow-lg transition-shadow flex-1"
                      >
                        Pay Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;