import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Menu from "./pages/Menu";
import AdminMenu from "./pages/AdminMenu";
import Reservations from "./pages/Reservations";
import AdminTables from "./pages/AdminTables";
import AdminReservations from "./pages/AdminReservations";
import CartDrawer from "./components/CartDrawer";
import KitchenDisplay from "./pages/KitchenDisplay";
import Billing from "./pages/Billing";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="bg-white shadow-sm p-4 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-orange-600">
              RestoManager
            </Link>
            
            <div className="flex gap-4 items-center">
              <div className="flex gap-4 border-r pr-4 mr-2">
                <Link to="/" className="font-medium hover:text-orange-600">Menu</Link>
                <Link to="/reservations" className="font-medium hover:text-orange-600">Book Table</Link>
              </div>
              
              <div className="flex gap-4 text-sm text-gray-600">
                <Link to="/kitchen" className="hover:text-orange-600 font-medium text-orange-700">Kitchen View</Link>
                <Link to="/billing" className="hover:text-orange-600 font-medium text-green-700">Cashier</Link>
                <Link to="/admin/menu" className="hover:text-orange-600">Admin Menu</Link>
                <Link to="/admin/tables" className="hover:text-orange-600">Tables</Link>
                <Link to="/admin/reservations" className="hover:text-orange-600">Reservations</Link>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/kitchen" element={<KitchenDisplay />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/admin" element={<AdminMenu />} /> 
          <Route path="/admin/menu" element={<AdminMenu />} />
          <Route path="/admin/tables" element={<AdminTables />} />
          <Route path="/admin/reservations" element={<AdminReservations />} />
        </Routes>

        <CartDrawer />
      </div>
    </Router>
  );
}

export default App;
