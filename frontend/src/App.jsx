import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProviderDetails from './pages/ProviderDetails';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';

const DashboardRouter = () => {
    const { user } = useContext(AuthContext);
    if (!user) return <Navigate to="/login" />;
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" />;
    return user.role === 'provider' ? <Navigate to="/provider-dashboard" /> : <Navigate to="/customer-dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50/50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/provider/:id" element={<ProviderDetails />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/provider-dashboard" element={<ProviderDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            {/* Dashboard and Login routes can be added here */}
            <Route path="*" element={<div className="p-10 text-center text-xl font-bold">404 - Page Not Found</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
