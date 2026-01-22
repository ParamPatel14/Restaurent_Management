import { useState, useEffect } from "react";
import api from "../api/client";
import { Trash2, Plus, LayoutGrid } from "lucide-react";

function AdminTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTable, setNewTable] = useState({
    table_number: "",
    capacity: "",
    location: "main_hall",
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await api.get("/tables/");
      setTables(res.data);
    } catch (err) {
      console.error("Error fetching tables:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tables/", {
        ...newTable,
        table_number: parseInt(newTable.table_number),
        capacity: parseInt(newTable.capacity),
      });
      setNewTable({ table_number: "", capacity: "", location: "main_hall" });
      fetchTables();
    } catch (err) {
      alert("Error creating table: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <LayoutGrid className="w-8 h-8" />
        Table Management
      </h1>

      {/* Create Table Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Table</h2>
        <form onSubmit={handleCreateTable} className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">Table Number</label>
            <input
              type="number"
              required
              value={newTable.table_number}
              onChange={(e) => setNewTable({ ...newTable, table_number: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Capacity</label>
            <input
              type="number"
              required
              value={newTable.capacity}
              onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <select
              value={newTable.location}
              onChange={(e) => setNewTable({ ...newTable, location: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            >
              <option value="main_hall">Main Hall</option>
              <option value="patio">Patio</option>
              <option value="bar">Bar</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Table
          </button>
        </form>
      </div>

      {/* Tables List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <div key={table.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex justify-between items-center">
            <div>
              <div className="text-lg font-bold">Table {table.table_number}</div>
              <div className="text-gray-500">Capacity: {table.capacity}</div>
              <div className="text-sm text-gray-400 capitalize">{table.location}</div>
            </div>
            <div className={`px-2 py-1 rounded text-xs ${table.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {table.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminTables;
