import { useState, useEffect, useRef } from "react";
import api from "../api/client";
import { CheckCircle, Clock, ChefHat, RefreshCcw, AlertCircle } from "lucide-react";

function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const ws = useRef(null);

  useEffect(() => {
    fetchOrders();
    connectWebSocket();

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const connectWebSocket = () => {
    // Determine WS URL (ws://localhost:8000/api/orders/ws)
    const wsUrl = "ws://localhost:8000/api/orders/ws";
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("Connected to Kitchen WS");
      setConnectionStatus("connected");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WS Message:", data);
      
      if (data.type === "new_order") {
        // Add new order to list if it matches active filters
        setOrders(prev => [data.order, ...prev]);
        // Optional: Play sound or show visual alert
      } else if (data.type === "status_update") {
        // Update local status
        setOrders(prev => prev.map(o => 
          o.id === data.order_id ? { ...o, status: data.new_status } : o
        ).filter(o => ['pending', 'preparing', 'ready'].includes(o.status))); 
        // Filter out if it became served/paid, or keep it for a moment?
        // Current logic filters out served orders in fetchOrders, so we should replicate that.
        // If status is served/paid/cancelled, we should remove it from view.
        if (['served', 'paid', 'cancelled'].includes(data.new_status)) {
           setOrders(prev => prev.filter(o => o.id !== data.order_id));
        }
      }
    };

    ws.current.onclose = () => {
      console.log("WS Disconnected");
      setConnectionStatus("disconnected");
      // Try reconnect after 5s
      setTimeout(connectWebSocket, 5000);
    };
    
    ws.current.onerror = (err) => {
      console.error("WS Error:", err);
      ws.current.close();
    };
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/");
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
      // We don't need to manually fetchOrders here because WS will tell us!
      // But for better UX (optimistic update), we could. 
      // Let's rely on WS for single source of truth verification.
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 border-yellow-400 ring-1 ring-yellow-200';
      case 'preparing': return 'bg-blue-50 border-blue-400 ring-1 ring-blue-200';
      case 'ready': return 'bg-green-50 border-green-400 ring-1 ring-green-200';
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
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            connectionStatus === 'connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-600 animate-pulse' : 'bg-red-600'
            }`} />
            {connectionStatus === 'connected' ? 'Live' : 'Disconnected'}
          </div>
          <button 
            onClick={fetchOrders}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600"
          >
            <RefreshCcw className="w-5 h-5" /> Refresh
          </button>
        </div>
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
              className={`border-l-8 rounded-lg shadow-md p-4 bg-white transition-all duration-300 animate-fade-in ${getStatusColor(order.status)}`}
            >
              <div className="flex justify-between items-start mb-4 border-b pb-2">
                <div>
                  <h3 className="font-bold text-lg">Order #{order.id}</h3>
                  <div className="text-sm text-gray-700 font-bold">Table {order.table_id}</div>
                </div>
                <div className="text-right">
                  <span className={`uppercase text-xs font-bold tracking-wider px-2 py-1 rounded 
                    ${order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
                      order.status === 'preparing' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>
                    {order.status}
                  </span>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-sm border-b border-dashed border-gray-200 pb-1 last:border-0">
                    <div className="flex gap-2">
                      <span className="font-bold w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">{item.quantity}</span>
                      <span className="font-medium">{item.name || item.menu_item_name}</span>
                    </div>
                    {item.notes && (
                      <div className="text-xs text-red-500 italic ml-8 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-auto">
                {order.status === 'pending' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'preparing')}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm font-bold shadow-sm"
                  >
                    Start Prep
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'ready')}
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm font-bold shadow-sm"
                  >
                    Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'served')}
                    className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 text-sm font-bold shadow-sm"
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
