import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, Briefcase, CheckCircle, Clock, Trash2, PlusCircle, ShieldAlert, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [providers, setProviders] = useState([]);
    
    // Categories state
    const [categoryName, setCategoryName] = useState('');
    const [categoryIcon, setCategoryIcon] = useState('');

    useEffect(() => {
        if (token && user?.role === 'admin') {
            fetchStats();
            fetchProviders();
        }
    }, [token, user]);

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchProviders = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/providers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProviders(res.data.providers);
        } catch (error) {
            console.error("Error fetching providers:", error);
        }
    };

    const handleVerifyToggle = async (profileId, currentStatus) => {
        try {
            await axios.patch(`http://localhost:5000/api/admin/providers/${profileId}/verify`, 
                { is_verified: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Update UI immediately
            setProviders(providers.map(p => 
                p.profile_id === profileId ? { ...p, is_verified: !currentStatus ? 1 : 0 } : p
            ));
        } catch (error) {
            console.error("Error updating verification:", error);
            alert("Failed to update verification status.");
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/admin/categories', 
                { name: categoryName, icon_url: categoryIcon },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Category added successfully!");
            setCategoryName('');
            setCategoryIcon('');
            // Optional: Re-fetch categories if displayed here
        } catch (error) {
            console.error("Error adding category:", error);
            alert("Failed to add category.");
        }
    };

    if (!stats) return <div className="p-10 text-center font-bold">Loading Admin Dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-semibold">Total Customers</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.customers}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-semibold">Total Providers</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.providers}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-semibold">Completed Bookings</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.bookings.completed || 0}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-semibold">Pending Bookings</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.bookings.pending || 0}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Provider Verification Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Provider Verification</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                    <th className="pb-3 font-semibold">Provider</th>
                                    <th className="pb-3 font-semibold">Category</th>
                                    <th className="pb-3 font-semibold">Rate</th>
                                    <th className="pb-3 font-semibold">Status</th>
                                    <th className="pb-3 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {providers.map(p => (
                                    <tr key={p.profile_id} className="border-b border-gray-50 last:border-0">
                                        <td className="py-4">
                                            <p className="font-bold text-gray-900">{p.name}</p>
                                            <p className="text-xs text-gray-500">{p.email}</p>
                                        </td>
                                        <td className="py-4 text-sm font-medium text-gray-700">{p.category_name}</td>
                                        <td className="py-4 text-sm font-bold text-gray-900">Rs. {p.hourly_rate}</td>
                                        <td className="py-4">
                                            {p.is_verified ? (
                                                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                                                    <ShieldCheck size={14} /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">
                                                    <ShieldAlert size={14} /> Unverified
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 text-right">
                                            <button 
                                                onClick={() => handleVerifyToggle(p.profile_id, !!p.is_verified)}
                                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${p.is_verified ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                            >
                                                {p.is_verified ? 'Revoke' : 'Approve'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Manage Categories */}
                <div className="bg-white rounded-3xl shadow-sm border p-8 h-fit">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Category</h2>
                    <form onSubmit={handleAddCategory} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name</label>
                            <input 
                                type="text" 
                                required
                                value={categoryName}
                                onChange={e => setCategoryName(e.target.value)}
                                className="w-full border-gray-200 border-2 py-2 px-3 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" 
                                placeholder="e.g., Cleaner"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Icon URL (Optional)</label>
                            <input 
                                type="text" 
                                value={categoryIcon}
                                onChange={e => setCategoryIcon(e.target.value)}
                                className="w-full border-gray-200 border-2 py-2 px-3 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" 
                                placeholder="/assets/icons/cleaner.png"
                            />
                        </div>
                        <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition">
                            <PlusCircle size={18} /> Add Category
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
