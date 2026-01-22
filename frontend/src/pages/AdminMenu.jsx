import { useEffect, useState } from "react";
import api from "../api/client";
import { Trash2, Edit, Plus, Save, X } from "lucide-react";

function AdminMenu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    is_active: true,
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        api.get("/menu/categories"),
        api.get("/menu/items"),
      ]);
      setCategories(catRes.data);
      setItems(itemRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await api.delete(`/menu/items/${id}`);
      fetchData();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/menu/items/${editingItem.id}`, editingItem);
      } else {
        await api.post("/menu/items", newItem);
      }
      setEditingItem(null);
      setIsAdding(false);
      setNewItem({
        name: "",
        description: "",
        price: "",
        category_id: "",
        is_active: true,
      });
      fetchData();
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} /> Add Item
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {(isAdding || editingItem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? "Edit Item" : "Add New Item"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  required
                  className="w-full border p-2 rounded"
                  value={editingItem ? editingItem.name : newItem.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    editingItem
                      ? setEditingItem({ ...editingItem, name: val })
                      : setNewItem({ ...newItem, name: val });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  className="w-full border p-2 rounded"
                  value={editingItem ? editingItem.description || "" : newItem.description}
                  onChange={(e) => {
                    const val = e.target.value;
                    editingItem
                      ? setEditingItem({ ...editingItem, description: val })
                      : setNewItem({ ...newItem, description: val });
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full border p-2 rounded"
                    value={editingItem ? editingItem.price : newItem.price}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      editingItem
                        ? setEditingItem({ ...editingItem, price: val })
                        : setNewItem({ ...newItem, price: val });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Category</label>
                  <select
                    required
                    className="w-full border p-2 rounded"
                    value={editingItem ? editingItem.category_id : newItem.category_id}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      editingItem
                        ? setEditingItem({ ...editingItem, category_id: val })
                        : setNewItem({ ...newItem, category_id: val });
                    }}
                  >
                    <option value="">Select...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setIsAdding(false);
                  }}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <Save size={18} /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {item.description}
                  </div>
                </td>
                <td className="p-4">{item.category_name}</td>
                <td className="p-4">${item.price.toFixed(2)}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      item.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminMenu;
