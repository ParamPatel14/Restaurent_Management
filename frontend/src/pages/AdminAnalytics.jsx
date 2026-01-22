import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

const AdminAnalytics = () => {
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [sumRes, revRes, topRes, statusRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/revenue-chart'),
        api.get('/analytics/top-items'),
        api.get('/analytics/order-status')
      ]);
      
      setSummary(sumRes.data);
      setRevenueData(revRes.data);
      setTopItems(topRes.data);
      setStatusData(statusRes.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Performance Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-800">${summary?.total_revenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-medium">Completed Orders</p>
          <p className="text-3xl font-bold text-gray-800">{summary?.total_orders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm font-medium">Avg Order Value</p>
          <p className="text-3xl font-bold text-gray-800">${summary?.average_order_value.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <p className="text-gray-500 text-sm font-medium">Active Orders</p>
          <p className="text-3xl font-bold text-gray-800">{summary?.active_orders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Revenue Trend (Last 30 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Top 5 Popular Items</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#3B82F6" name="Quantity Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Order Status Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Insights Text */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-700">System Insights</h2>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded text-sm text-blue-800">
              <strong>💡 Insight:</strong> Your top selling item represents {topItems.length > 0 ? ((topItems[0].quantity / summary?.total_orders) * 100).toFixed(1) : 0}% of order volume.
            </div>
            <div className="p-3 bg-green-50 rounded text-sm text-green-800">
              <strong>📈 Growth:</strong> Revenue tracking is active. Monitor the daily trend to identify peak business days.
            </div>
            <div className="p-3 bg-purple-50 rounded text-sm text-purple-800">
              <strong>⚡ Efficiency:</strong> You have {summary?.active_orders} active orders currently in the pipeline.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
