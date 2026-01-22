import { useState, useEffect } from "react";
import api from "../api/client";
import { CheckCircle, Clock, ChefHat, RefreshCcw } from "lucide-react";

function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      // Fetch pending and preparing orders
      const res = await api.get("/orders/");
      // Filter for active kitchen orders
      const kitchenOrders = res.data.filter(o => 
        ['pending', 'preparing', 'ready'].includes(o.status)
      );
      setOrders(kitchenOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 border-yellow-300';
      case 'preparing': return 'bg-blue-100 border-blue-300';
      case 'ready': return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ChefHat className="w-10 h-10 text-orange-600" />
          Kitchen Display System
        </h1>
        <button 
          onClick={fetchOrders}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600"
        >
          <RefreshCcw className="w-5 h-5" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center p-12">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-lg shadow">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700">All Caught Up!</h2>
          <p className="text-gray-500">No active orders in the kitchen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className={`border-l-4 rounded-lg shadow-md p-4 bg-white ${getStatusColor(order.status)}`}
            >
              <div className="flex justify-between items-start mb-4 border-b pb-2">
                <div>
                  <h3 className="font-bold text-lg">Order #{order.id}</h3>
                  <div className="text-sm text-gray-600 font-medium">Table {order.table_id}</div>
                </div>
                <div className="text-right">
                  <span className="uppercase text-xs font-bold tracking-wider px-2 py-1 rounded bg-white bg-opacity-50">
                    {order.status}
                  </span>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start text-sm">
                    <div className="flex gap-2">
                      <span className="font-bold w-4">{item.quantity}x</span>
                      <span>{item.menu_item_name}</span>
                    </div>
                  </div>
                ))}
                {order.items.length === 0 && <div className="text-gray-400 text-sm italic">No items details</div>}
              </div>

              <div className="flex gap-2 mt-auto">
                {order.status === 'pending' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'preparing')}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm font-medium"
                  >
                    Start Prep
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'ready')}
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm font-medium"
                  >
                    Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'served')}
                    className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 text-sm font-medium"
                  >
                    Mark Served
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default KitchenDisplay;
