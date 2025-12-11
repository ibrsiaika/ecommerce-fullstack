import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';
import api from '../../services/api';

const SellerDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerDashboard();
  }, []);

  const fetchSellerDashboard = async () => {
    try {
      const [dashRes, earnRes] = await Promise.all([
        api.get('/api/seller/dashboard'),
        api.get('/api/seller/earnings')
      ]);

      setDashboard(dashRes.data.data);
      setEarnings(earnRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Store Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {dashboard?.store?.name}
        </h1>
        <p className="text-gray-600">{dashboard?.store?.description}</p>
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Rating</p>
            <p className="text-lg font-bold">⭐ {dashboard?.storeStats?.rating}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Followers</p>
            <p className="text-lg font-bold">{dashboard?.storeStats?.followers}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Products</p>
            <p className="text-lg font-bold">{dashboard?.totalProducts}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Reviews</p>
            <p className="text-lg font-bold">{dashboard?.storeStats?.totalReviews}</p>
          </div>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-blue-600">
            ${earnings?.totalRevenue?.toFixed(2)}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Net Earnings</p>
          <p className="text-2xl font-bold text-green-600">
            ${earnings?.netEarnings?.toFixed(2)}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Platform Fee ({earnings?.platformCommission}%)</p>
          <p className="text-2xl font-bold text-orange-600">
            ${earnings?.platformFee?.toFixed(2)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Total Orders</p>
          <p className="text-2xl font-bold text-purple-600">
            {earnings?.totalOrders}
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Order ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.recentOrders?.map((order: any) => (
                <tr key={order._id} className="border-t">
                  <td className="px-4 py-2 text-sm text-gray-800">{order._id.slice(-8)}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-800">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Top Products</h3>
        <div className="space-y-2">
          {dashboard?.topProducts?.map((product: any) => (
            <div key={product._id} className="flex justify-between items-center pb-2 border-b">
              <div>
                <p className="font-medium text-gray-800">{product.name}</p>
                <p className="text-sm text-gray-600">⭐ {product.rating?.toFixed(1)} ({product.numReviews} reviews)</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">${product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">{product.countInStock} in stock</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
