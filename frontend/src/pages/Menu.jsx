import { useEffect, useState } from "react";
import api from "../api/client";

function Menu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-8 text-center">Loading menu...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Our Menu</h1>
      
      {categories.map((category) => {
        const categoryItems = items.filter(
          (item) => item.category_id === category.id && item.is_active
        );

        if (categoryItems.length === 0) return null;

        return (
          <div key={category.id} className="mb-12">
            <h2 className="text-2xl font-semibold border-b-2 border-orange-500 mb-4 pb-2">
              {category.name}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {categoryItems.map((item) => (
                <div key={item.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-medium">{item.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                    </div>
                    <span className="text-lg font-bold text-orange-600">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  {item.image_url && (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-48 object-cover mt-4 rounded-md"
                    />
                  )}
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
