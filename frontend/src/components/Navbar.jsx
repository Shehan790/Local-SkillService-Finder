import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="bg-white/70 backdrop-blur-xl shadow-sm border-b border-gray-200/60 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
            <Link to="/" className="text-2xl font-extrabold text-blue-600 tracking-tight flex items-center gap-2">
                SkillFinder
            </Link>
            
            <div className="flex items-center space-x-6">
                {!user ? (
                    <>
                        <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition">Login</Link>
                        <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition">Sign Up</Link>
                    </>
                ) : (
                    <>
                        <Link to={user.role === 'admin' ? '/admin-dashboard' : (user.role === 'provider' ? '/provider-dashboard' : '/customer-dashboard')} className="text-gray-600 hover:text-blue-600 font-medium flex items-center gap-2 transition">
                            <User size={18} /> {user.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                        </Link>
                        <button 
                            onClick={logout} 
                            className="text-red-500 hover:text-red-700 font-medium flex items-center gap-2 transition"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
