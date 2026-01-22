import { useState, useEffect } from "react";
import api from "../api/client";
import { CalendarDays, Phone, User, Clock } from "lucide-react";

function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await api.get("/reservations/");
      setReservations(res.data);
    } catch (err) {
      console.error("Error fetching reservations:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <CalendarDays className="w-8 h-8" />
        Reservation List
      </h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((res) => (
              <tr key={res.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {formatDate(res.reservation_time)}
                  </div>
                  <div className="text-xs text-gray-500 ml-6">Duration: {res.duration_minutes}m</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{res.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-6 text-sm text-gray-500">
                    <Phone className="w-3 h-3" />
                    {res.customer_phone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Table {res.table_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {res.party_size} people
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${res.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {res.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminReservations;
