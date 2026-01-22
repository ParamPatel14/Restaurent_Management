import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

const Billing = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchOrders();
    // Optional: Poll for new served orders
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/?status=served');
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!selectedOrder) return;
    
    setProcessing(true);
    try {
      await api.post(`/orders/${selectedOrder.id}/pay`, {
        amount: selectedOrder.total_amount,
        payment_method: paymentMethod,
        transaction_id: paymentMethod === 'card' ? `TXN-${Date.now()}` : null
      });
      
      alert("Payment Successful! Order Closed.");
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      alert("Payment Failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Billing & Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order List */}
        <div className="md:col-span-1 bg-white rounded-lg shadow p-4 h-[calc(100vh-200px)] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Ready for Payment</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500 italic">No orders ready for checkout.</p>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div 
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedOrder?.id === order.id 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">Table {order.table_id}</h3>
                      <p className="text-sm text-gray-500">Order #{order.id}</p>
                    </div>
                    <span className="font-bold text-green-600">${order.total_amount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Details & Payment */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          {selectedOrder ? (
            <div className="h-full flex flex-col">
              <div className="border-b pb-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-bold">Table {selectedOrder.table_id}</h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-500">Order #{selectedOrder.id}</p>
              </div>

              <div className="flex-grow overflow-y-auto mb-6">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <tr>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Price</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedOrder.items.map(item => (
                      <tr key={item.id}>
                        <td className="py-3 px-3">
                          <p className="font-medium">{item.menu_item_name}</p>
                          {item.notes && <p className="text-xs text-gray-400">{item.notes}</p>}
                        </td>
                        <td className="py-3 px-3 text-center">{item.quantity}</td>
                        <td className="py-3 px-3 text-right">${item.unit_price.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right">${(item.unit_price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold mb-6">
                  <span>Total Due:</span>
                  <span>${selectedOrder.total_amount.toFixed(2)}</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Payment Method</h3>
                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex-1 py-2 px-4 rounded-md border ${
                        paymentMethod === 'cash' 
                          ? 'bg-green-600 text-white border-green-600' 
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      💵 Cash
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`flex-1 py-2 px-4 rounded-md border ${
                        paymentMethod === 'card' 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      💳 Card
                    </button>
                  </div>

                  <button
                    onClick={handlePay}
                    disabled={processing}
                    className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold text-lg hover:bg-gray-800 disabled:opacity-50"
                  >
                    {processing ? "Processing..." : `Accept Payment ($${selectedOrder.total_amount.toFixed(2)})`}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>Select an order to process payment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;
