import { useEffect, useState } from "react";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import { Plus } from "lucide-react";

function Menu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, itemRes] = await Promise.all([
          api.get("/menu/categories"),
          api.get("/menu/items"),
        ]);
        setCategories(catRes.data);
        setItems(itemRes.data);
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading menu...</div>;

  const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-900">Our Menu</h1>
      
      {categories.map((category) => {
        const categoryItems = items.filter(
          (item) => item.category_id === category.id && item.is_active
        );

        if (categoryItems.length === 0) return null;

        return (
          <div key={category.id} className="mb-16">
            <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-orange-600 pl-4 mb-6">
              {category.name}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categoryItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full group">
                  <div className="h-48 overflow-hidden bg-gray-100 relative">
                     <img 
                       src={item.image_url || PLACEHOLDER_IMG} 
                       alt={item.name} 
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                       onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                     />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                      <span className="text-lg font-bold text-orange-600">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{item.description}</p>
                    
                    <button 
                      onClick={() => addToCart(item)}
                      className="mt-auto w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add to Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Menu;
