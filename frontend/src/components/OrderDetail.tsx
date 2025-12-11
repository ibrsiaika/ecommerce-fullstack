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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </span>
            {order.trackingNumber && (
              <p className="text-sm text-gray-600 mt-2">
                Tracking: {order.trackingNumber}
              </p>
            )}
          </div>
        </div>

        {/* Payment and Delivery Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Payment Status</h3>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${order.isPaid ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={order.isPaid ? 'text-green-600' : 'text-red-600'}>
                {order.isPaid ? `Paid on ${formatDate(order.paidAt!)}` : 'Not Paid'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Method: {order.paymentMethod}</p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Delivery Status</h3>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${order.isDelivered ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className={order.isDelivered ? 'text-green-600' : 'text-yellow-600'}>
                {order.isDelivered ? `Delivered on ${formatDate(order.deliveredAt!)}` : 'Not Delivered'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 border-b pb-4">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-gray-600">Price: ${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary and Details */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
            <div className="text-gray-600">
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Items:</span>
                <span className="font-medium">${order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium">${order.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">${order.taxPrice.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Result */}
          {order.paymentResult && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Details</h2>
              <div className="text-gray-600 space-y-1">
                <p><span className="font-medium">Transaction ID:</span> {order.paymentResult.id}</p>
                <p><span className="font-medium">Status:</span> {order.paymentResult.status}</p>
                <p><span className="font-medium">Updated:</span> {formatDate(order.paymentResult.update_time)}</p>
                {order.paymentResult.email_address && (
                  <p><span className="font-medium">Email:</span> {order.paymentResult.email_address}</p>
                )}
              </div>
            </div>
          )}

          {/* Payment Section for Unpaid Orders */}
          {!order.isPaid && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <Payment
                orderId={order._id}
                amount={order.totalPrice}
                paymentMethod={order.paymentMethod}
                onPaymentSuccess={() => {
                  // Refresh the page or refetch order data
                  window.location.reload();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;