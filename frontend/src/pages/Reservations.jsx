import { useState } from "react";
import api from "../api/client";
import { Calendar, Users, Clock, CheckCircle } from "lucide-react";

function Reservations() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    party_size: 2,
    customer_name: "",
    customer_phone: "",
  });
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Combine date and time
      const reservationTime = `${formData.date}T${formData.time}:00`;
      const res = await api.get("/tables/available", {
        params: {
          reservation_time: reservationTime,
          duration_minutes: 90 // Default duration
        }
      });
      
      // Filter by capacity
      const suitable = res.data.filter(t => t.capacity >= formData.party_size);
      setAvailableTables(suitable);
      setStep(2);
    } catch (err) {
      alert("Error searching tables: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const reservationTime = `${formData.date}T${formData.time}:00`;
      await api.post("/reservations/", {
        table_id: selectedTable.id,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        reservation_time: reservationTime,
        party_size: formData.party_size,
        duration_minutes: 90
      });
      setSuccess(true);
      setStep(3);
    } catch (err) {
      alert("Error booking table: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-10 text-center p-8 bg-white rounded-lg shadow-lg">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Reservation Confirmed!</h2>
        <p className="text-gray-600 mb-6">
          We look forward to seeing you, {formData.customer_name}.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700"
        >
          Make Another Reservation
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Reserve a Table</h1>

      {step === 1 && (
        <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-semibold mb-4">Find a Table</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="pl-10 w-full p-2 border rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                  className="pl-10 w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Party Size</label>
            <div className="relative">
              <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="number"
                min="1"
                max="20"
                required
                value={formData.party_size}
                onChange={e => setFormData({...formData, party_size: parseInt(e.target.value)})}
                className="pl-10 w-full p-2 border rounded-md"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Checking availability..." : "Find Tables"}
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Select a Table</h2>
            <button 
              onClick={() => setStep(1)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Change Search
            </button>
          </div>

          {availableTables.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No tables available for this time and party size.</p>
              <p className="text-sm text-gray-500 mt-2">Try a different time or smaller party size.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableTables.map(table => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    selectedTable?.id === table.id 
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200" 
                      : "hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-bold">Table {table.table_number}</div>
                  <div className="text-sm text-gray-600">{table.location}</div>
                  <div className="text-xs text-gray-500 mt-1">Capacity: {table.capacity}</div>
                </button>
              ))}
            </div>
          )}

          {selectedTable && (
            <form onSubmit={handleBook} className="bg-white p-6 rounded-lg shadow-md mt-6 animate-fade-in">
              <h3 className="font-semibold mb-4">Confirm Reservation</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={e => setFormData({...formData, customer_name: e.target.value})}
                    className="mt-1 w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.customer_phone}
                    onChange={e => setFormData({...formData, customer_phone: e.target.value})}
                    className="mt-1 w-full p-2 border rounded-md"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-medium"
                >
                  {loading ? "Confirming..." : "Complete Reservation"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default Reservations;
