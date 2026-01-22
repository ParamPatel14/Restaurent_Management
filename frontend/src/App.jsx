import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet } from "react-router-dom";
import Menu from "./pages/Menu";
import AdminMenu from "./pages/AdminMenu";
import Reservations from "./pages/Reservations";
import AdminTables from "./pages/AdminTables";
import AdminReservations from "./pages/AdminReservations";
import CartDrawer from "./components/CartDrawer";
import KitchenDisplay from "./pages/KitchenDisplay";
import Billing from "./pages/Billing";
import AdminAnalytics from "./pages/AdminAnalytics";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LogOut, User } from "lucide-react";

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

// Navbar Component to handle conditional rendering
const Navbar = () => {
  const { isAdmin, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-orange-600 tracking-tight">
            RestoManager
          </Link>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-gray-700 font-medium hover:text-orange-600 transition-colors">Menu</Link>
              <Link to="/reservations" className="text-gray-700 font-medium hover:text-orange-600 transition-colors">Book Table</Link>
            </div>
            
            <div className="h-6 w-px bg-gray-200"></div>
            
            {isAdmin ? (
              <div className="flex items-center gap-4 text-sm font-medium">
                <Link to="/kitchen" className="text-gray-500 hover:text-orange-600 transition-colors">Kitchen</Link>
                <Link to="/billing" className="text-gray-500 hover:text-green-600 transition-colors">Cashier</Link>
                <Link to="/admin/analytics" className="text-blue-600 hover:text-blue-700 transition-colors">Analytics</Link>
                <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <Link to="/admin/menu" className="text-gray-600 hover:text-gray-900 transition-colors">Menu</Link>
                  <span className="text-gray-300">|</span>
                  <Link to="/admin/tables" className="text-gray-600 hover:text-gray-900 transition-colors">Tables</Link>
                  <span className="text-gray-300">|</span>
                  <Link to="/admin/reservations" className="text-gray-600 hover:text-gray-900 transition-colors">Reservations</Link>
                </div>
                <button 
                  onClick={logout}
                  className="ml-2 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
              >
                <User size={18} />
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Navbar />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Menu />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/kitchen" element={<KitchenDisplay />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/admin" element={<Navigate to="/admin/analytics" replace />} /> 
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/menu" element={<AdminMenu />} />
              <Route path="/admin/tables" element={<AdminTables />} />
              <Route path="/admin/reservations" element={<AdminReservations />} />
            </Route>
          </Routes>

          <CartDrawer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
