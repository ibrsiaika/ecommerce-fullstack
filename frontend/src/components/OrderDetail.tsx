import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import Payment from './Payment';

interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address?: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  orderStatus: string;
  trackingNumber?: string;
  createdAt: string;
}

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state: any) => state.auth);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !id) return;

      try {
        const response = await fetch(`/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          setOrder(result.data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch order');
        }
      } catch (err) {
        setError('Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user]);

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
      month: 'long',
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
          <p className="text-xl text-gray-600 font-semibold">Loading order details...</p>
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

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Order Not Found</h1>
          <p className="text-xl text-gray-600">We couldn't find the order you're looking for.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-16 lg:py-20">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3">Order #{order.orderNumber}</h1>
              <p className="text-xl text-gray-600">📅 Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-6 py-3 rounded-full text-lg font-bold ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
              </span>
              {order.trackingNumber && (
                <p className="text-lg text-gray-600 mt-3 font-semibold">
                  📦 Tracking: {order.trackingNumber}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="surface rounded-2xl p-8 border-2 border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className={`text-4xl ${order.isPaid ? '✓' : '⏳'}`}></div>
              <h3 className="text-2xl font-bold text-gray-900">Payment Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${order.isPaid ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className={`text-lg font-bold ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.isPaid ? `✓ Paid on ${formatDate(order.paidAt!)}` : '⏳ Payment Pending'}
                </span>
              </div>
              <p className="text-gray-600 text-lg">💳 Method: <span className="font-semibold text-gray-900">{order.paymentMethod}</span></p>
            </div>
          </div>

          <div className="surface rounded-2xl p-8 border-2 border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className={`text-4xl ${order.isDelivered ? '📦' : '🚚'}`}></div>
              <h3 className="text-2xl font-bold text-gray-900">Delivery Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${order.isDelivered ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <span className={`text-lg font-bold ${order.isDelivered ? 'text-green-600' : 'text-blue-600'}`}>
                  {order.isDelivered ? `✓ Delivered on ${formatDate(order.deliveredAt!)}` : '🚚 In Transit'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="surface rounded-2xl p-8 border border-gray-200 mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-8">📦 Order Items</h2>
              <div className="space-y-6">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex gap-6 pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-2xl shadow-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.name}</h3>
                      <div className="space-y-2 text-lg text-gray-600">
                        <p><span className="font-semibold text-gray-900">Qty:</span> {item.quantity}</p>
                        <p><span className="font-semibold text-gray-900">Price:</span> ${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="surface rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                📍 Shipping Address
              </h2>
              <div className="space-y-3 text-lg text-gray-700 leading-relaxed">
                <p className="font-semibold">{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                <p className="font-semibold">{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="surface rounded-2xl p-8 border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                💰 Order Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600 font-semibold">Items:</span>
                  <span className="font-bold text-gray-900">${order.itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600 font-semibold">Shipping:</span>
                  <span className="font-bold text-gray-900">${order.shippingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600 font-semibold">Tax:</span>
                  <span className="font-bold text-gray-900">${order.taxPrice.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-gray-300 pt-4">
                  <div className="flex justify-between text-3xl font-bold">
                    <span>Total:</span>
                    <span className="text-gray-900">${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Result */}
            {order.paymentResult && (
              <div className="surface rounded-2xl p-8 border border-green-200 bg-green-50">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  ✓ Payment Details
                </h2>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold uppercase tracking-widest">Transaction ID</p>
                    <p className="text-lg font-bold text-gray-900 mt-1 break-all">{order.paymentResult.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold uppercase tracking-widest">Status</p>
                    <p className="text-lg font-bold text-green-700 mt-1">{order.paymentResult.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold uppercase tracking-widest">Updated</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{formatDate(order.paymentResult.update_time)}</p>
                  </div>
                  {order.paymentResult.email_address && (
                    <div>
                      <p className="text-sm text-gray-600 font-semibold uppercase tracking-widest">Email</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">{order.paymentResult.email_address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Section for Unpaid Orders */}
            {!order.isPaid && (
              <div className="surface rounded-2xl p-8 border-2 border-yellow-200 bg-yellow-50">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">⏳ Complete Payment</h2>
                <Payment
                  orderId={order._id}
                  amount={order.totalPrice}
                  paymentMethod={order.paymentMethod}
                  onPaymentSuccess={() => {
                    window.location.reload();
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;