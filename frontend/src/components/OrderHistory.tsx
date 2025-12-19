import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { FiPackage, FiArrowRight, FiCheck, FiClock } from 'react-icons/fi';

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
        <div className="text-center px-4">
          <div className="inline-block mb-6">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-gray-200 border-t-black"></div>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 font-semibold">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="p-4 sm:p-6 rounded-xl bg-red-50 border-2 border-red-200">
            <p className="text-red-700 font-semibold text-base sm:text-lg">⚠️ {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-50 rounded-full -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gray-50 rounded-full -ml-36 -mb-36 pointer-events-none" />
      
      <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative">
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center gap-3 mb-4">
            <FiPackage className="text-black" size={32} />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">Order History</h1>
          </div>
          <p className="text-base sm:text-lg text-gray-600">Track and manage all your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 sm:py-20 px-4">
            <div className="text-6xl sm:text-8xl mb-6">📦</div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">No orders yet</h3>
            <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 max-w-md mx-auto">You haven't placed any orders. Start shopping to see your orders here.</p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold bg-black text-white hover:bg-gray-900 active:scale-95 transition-all duration-200 group shadow-lg hover:shadow-xl"
            >
              Start Shopping
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="p-4 sm:p-6 lg:p-8 rounded-xl lg:rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 hover:border-gray-300"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8 items-start lg:items-center">
                  {/* Order Number */}
                  <div className="col-span-1">
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-widest mb-1">Order ID</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">#{order.orderNumber}</p>
                  </div>

                  {/* Date */}
                  <div className="col-span-1">
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-widest mb-1">Date</p>
                    <p className="text-base sm:text-lg lg:text-lg font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                  </div>

                  {/* Total */}
                  <div className="col-span-1">
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-widest mb-1">Total</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">${order.totalPrice.toFixed(2)}</p>
                  </div>

                  {/* Payment Status - Hidden on mobile, shown on sm+ */}
                  <div className="hidden sm:block col-span-1">
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-widest mb-1">Payment</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm ${
                      order.isPaid
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.isPaid ? (
                        <>
                          <FiCheck size={16} />
                          Paid
                        </>
                      ) : (
                        <>
                          <FiClock size={16} />
                          Pending
                        </>
                      )}
                    </span>
                  </div>

                  {/* Order Status - Hidden on mobile, shown on lg+ */}
                  <div className="hidden lg:block col-span-1">
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-widest mb-1">Status</p>
                    <span className={`inline-flex px-4 py-2 rounded-full font-bold text-sm ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 sm:col-span-1 flex flex-col sm:flex-row gap-2">
                    <Link
                      to={`/order/${order._id}`}
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2 rounded-lg font-bold text-xs sm:text-sm bg-white border-2 border-gray-300 text-gray-900 hover:border-gray-400 active:scale-95 transition-all duration-200 order-2 sm:order-1"
                    >
                      <span className="hidden sm:inline">View</span>
                      <FiArrowRight size={16} />
                    </Link>
                    {!order.isPaid && (
                      <Link
                        to={`/order/${order._id}/pay`}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2 rounded-lg font-bold text-xs sm:text-sm bg-black text-white hover:bg-gray-900 active:scale-95 transition-all duration-200 order-1 sm:order-2 shadow-md hover:shadow-lg"
                      >
                        <span className="hidden sm:inline">Pay</span>
                        <span className="sm:hidden">Pay Now</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Mobile Status Row */}
                <div className="grid grid-cols-2 gap-4 mt-4 sm:hidden border-t border-gray-200 pt-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-widest mb-1">Payment</p>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${
                      order.isPaid
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.isPaid ? '✓ Paid' : '⏳ Pending'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-widest mb-1">Status</p>
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
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