import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, ShoppingCart, DollarSign, Package } from 'lucide-react';
import api from '../services/api';

const AdminMetrics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const [statsRes, revenueRes] = await Promise.all([
        api.get('/api/admin/dashboard'),
        api.get('/api/admin/revenue-trends?days=30')
      ]);

      setStats(statsRes.data.data);
      setRevenue(revenueRes.data.data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <Icon className="w-10 h-10 text-gray-300" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue?.toLocaleString()}`}
          icon={DollarSign}
          color="border-blue-500"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders?.toLocaleString()}
          icon={ShoppingCart}
          color="border-green-500"
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString()}
          icon={Users}
          color="border-purple-500"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts?.toLocaleString()}
          icon={Package}
          color="border-orange-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Key Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Avg Order Value</span>
              <span className="font-bold text-gray-800">${stats?.averageOrderValue}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-bold text-green-600">{stats?.conversionRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Paid Orders</span>
              <span className="font-bold text-blue-600">{stats?.paidOrders}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMetrics;
