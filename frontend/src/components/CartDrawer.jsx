import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { ShoppingCart, X, Minus, Plus, Utensils } from "lucide-react";
import api from "../api/client";

function CartDrawer() {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    cartTotal, 
    cartCount, 
    clearCart,
    tableId,
    setTableId 
  } = useCart();
  
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    // Fetch active tables for selection
    const fetchTables = async () => {
      try {
        const res = await api.get("/tables/");
        setTables(res.data.filter(t => t.is_active));
      } catch (err) {
        console.error("Error fetching tables", err);
      }
    };
    if (isOpen) fetchTables();
  }, [isOpen]);

  const handlePlaceOrder = async () => {
    if (!tableId) {
      alert("Please select a table number");
      return;
    }
    
    setLoading(true);
    try {
      const orderData = {
        table_id: parseInt(tableId),
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          notes: item.notes
        }))
      };
      
      await api.post("/orders/", orderData);
      clearCart();
      setOrderPlaced(true);
      setTimeout(() => {
        setOrderPlaced(false);
        setIsOpen(false);
      }, 3000);
    } catch (err) {
      alert("Error placing order: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (cartCount === 0 && !isOpen) return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-transform transform hover:scale-105 z-50 flex items-center gap-2"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="font-bold">{cartCount}</span>
        </button>
      )}

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-xl flex flex-col animate-slide-in">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Utensils className="w-5 h-5" /> Your Order
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {orderPlaced ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-green-600">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Utensils className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Order Placed!</h3>
                  <p className="text-gray-600">Your food is being prepared.</p>
                </div>
              ) : cart.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex gap-4 border-b pb-4">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold">{item.name}</h4>
                          <button 
                            onClick={() => removeFromCart(item.id, item.notes)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500">${item.price}</p>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border rounded">
                            <button 
                              onClick={() => updateQuantity(item.id, item.notes, -1)}
                              className="p-1 hover:bg-gray-100"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.notes, 1)}
                              className="p-1 hover:bg-gray-100"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex-1 text-right font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Table Selection */}
                  <div className="mt-6 pt-4 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Table</label>
                    <select 
                      value={tableId || ""} 
                      onChange={(e) => setTableId(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">-- Choose Table --</option>
                      {tables.map(t => (
                        <option key={t.id} value={t.id}>Table {t.table_number} ({t.location})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!orderPlaced && cart.length > 0 && (
              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-4 text-lg font-bold">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || !tableId}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default CartDrawer;
