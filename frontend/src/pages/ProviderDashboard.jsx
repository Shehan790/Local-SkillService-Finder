import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, AlertCircle, XCircle, MapPin, DollarSign, AlertTriangle } from 'lucide-react';

const ProviderDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [emergencies, setEmergencies] = useState([]);
    
    // Profile State
    const [isAvailable, setIsAvailable] = useState(true);
    const [hourlyRate, setHourlyRate] = useState('');
    const [updatingProfile, setUpdatingProfile] = useState(false);
    
    const [otpInputs, setOtpInputs] = useState({});

    const fetchBookings = async () => {
        try {
            const res = await axios.get('/api/bookings/my-bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(res.data.bookings);
        } catch (error) {
            console.error("Error fetching bookings", error);
        }
    };

    useEffect(() => {
        if (token && user?.role === 'provider') fetchBookings();
    }, [token, user]);

    useEffect(() => {
        let interval;
        if (token && user?.role === 'provider' && isAvailable) {
            const fetchEmergencies = async () => {
                try {
                    const res = await axios.get('/api/emergency/nearby', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setEmergencies(res.data.requests || []);
                } catch (error) {
                    // Ignore errors silently for polling
                }
            };
            fetchEmergencies(); // initial fetch
            interval = setInterval(fetchEmergencies, 5000);
        }
        return () => clearInterval(interval);
    }, [token, user, isAvailable]);

    const handleProfileUpdate = async (updateData) => {
        setUpdatingProfile(true);
        try {
            await axios.put('/api/providers/profile', 
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Profile updated successfully!");
        } catch (error) {
            alert("Failed to update profile");
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleToggleAvailability = () => {
        const newStatus = !isAvailable;
        setIsAvailable(newStatus);
        handleProfileUpdate({ is_available: newStatus });
    };

    const handleUpdateRate = () => {
        if (!hourlyRate) return;
        handleProfileUpdate({ hourly_rate: parseFloat(hourlyRate) });
    };

    const handleUpdateLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                handleProfileUpdate({ 
                    lat: position.coords.latitude, 
                    lng: position.coords.longitude 
                });
            },
            () => alert("Unable to retrieve your location")
        );
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await axios.patch(`/api/bookings/${id}/status`, 
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchBookings();
        } catch (error) {
            alert("Failed to update booking status");
        }
    };

    const handleComplete = async (id) => {
        try {
            // Note: backend requires the key `completion_otp` according to DB schema, but check if controller expects `otp` or `completion_otp`
            await axios.post(`/api/bookings/${id}/complete`, 
                { completion_otp: otpInputs[id], otp: otpInputs[id] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Job Verified and Completed!");
            fetchBookings();
        } catch (error) {
            alert(error.response?.data?.message || "Invalid OTP");
        }
    };

    const handleAcceptEmergency = async (emergencyId) => {
        try {
            await axios.post(`/api/emergency/${emergencyId}/accept`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Emergency Job Accepted! The booking is now active.");
            setEmergencies(emergencies.filter(e => e.id !== emergencyId));
            fetchBookings(); // Refresh bookings to see the new accepted job
        } catch (error) {
            alert(error.response?.data?.message || "Failed to accept emergency.");
            // If conflict, remove it from list
            if (error.response?.status === 409) {
                setEmergencies(emergencies.filter(e => e.id !== emergencyId));
            }
        }
    };

    if (!user || user.role !== 'provider') {
        return (
            <div className="max-w-5xl mx-auto px-6 py-32 text-center">
                <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                <h1 className="text-3xl font-extrabold text-gray-900">Access Denied</h1>
                <p className="text-gray-500 text-lg mt-2">This dashboard is strictly for service providers.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            {/* Profile Management Bar */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 hover:shadow-md transition">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Provider Dashboard</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage your availability and incoming jobs</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 bg-gray-50 p-4 rounded-2xl w-full xl:w-auto border border-gray-100">
                    {/* Availability Toggle */}
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-700">{isAvailable ? 'Online (Available)' : 'Busy (Hidden)'}</span>
                        <button 
                            onClick={handleToggleAvailability}
                            className={`w-14 h-8 rounded-full p-1 transition-colors shadow-inner ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${isAvailable ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                    
                    <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>

                    {/* Hourly Rate */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input 
                                type="number" 
                                placeholder="Rate/hr"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(e.target.value)}
                                className="pl-8 pr-3 py-2.5 w-32 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-bold text-gray-900 transition"
                            />
                        </div>
                        <button onClick={handleUpdateRate} disabled={updatingProfile} className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold px-5 py-2.5 rounded-xl transition">Save</button>
                    </div>

                    <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>

                    {/* Location Update */}
                    <button 
                        onClick={handleUpdateLocation} disabled={updatingProfile}
                        className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md w-full sm:w-auto"
                    >
                        <MapPin size={18} /> Update Work Location
                    </button>
                </div>
            </div>

            {/* LIVE EMERGENCY ALERT SECTION */}
            {emergencies.length > 0 && (
                <div className="mb-10 bg-red-50 border-2 border-red-500 rounded-3xl p-6 shadow-xl animate-in slide-in-from-top-4">
                    <h2 className="text-xl font-extrabold text-red-700 flex items-center gap-2 mb-4">
                        <AlertTriangle size={28} className="animate-pulse" /> 🚨 LIVE EMERGENCY REQUESTS NEAR YOU
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {emergencies.map(em => (
                            <div key={em.id} className="bg-white rounded-2xl p-5 border border-red-200 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900 text-lg">Urgent SOS</h3>
                                        <span className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded text-xs">{parseFloat(em.distance).toFixed(1)} km away</span>
                                    </div>
                                    <p className="text-gray-700 font-medium mb-4 bg-gray-50 p-3 rounded-lg text-sm">{em.description}</p>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-gray-500 text-sm">Customer: <span className="font-bold text-gray-900">{em.customer_name}</span></span>
                                        <span className="text-green-700 font-extrabold bg-green-50 px-2 py-1 rounded border border-green-200">
                                            Offer: Rs. {em.offered_price}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleAcceptEmergency(em.id)}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition shadow-md flex justify-center items-center gap-2"
                                >
                                    <AlertTriangle size={18} /> Accept Urgent Job Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Jobs List */}
            <div className="grid gap-6">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Job Requests</h2>
                {bookings.map(b => (
                    <div key={b.id} className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition">
                        <div className="flex-1 w-full">
                            <div className="flex items-center flex-wrap gap-4 mb-4">
                                <h3 className="font-extrabold text-2xl text-gray-900">{b.customer_name}</h3>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm
                                    ${b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                    b.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 
                                    b.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {b.status}
                                </span>
                            </div>
                            <p className="text-gray-700 mb-5 bg-gray-50 p-4 rounded-xl border border-gray-100 text-base leading-relaxed">{b.problem_description}</p>
                            <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-700">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100">📅 {new Date(b.service_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                {b.agreed_price && <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">💰 Rs. {b.agreed_price} Agreed Price</span>}
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-3 min-w-[300px] w-full md:w-auto mt-4 md:mt-0">
                            {b.status === 'pending' && (
                                <div className="flex gap-3">
                                    <button onClick={() => handleStatusUpdate(b.id, 'accepted')} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-md text-lg">
                                        <CheckCircle size={20} /> Accept
                                    </button>
                                    <button onClick={() => handleStatusUpdate(b.id, 'cancelled')} className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-700 font-bold py-3.5 rounded-xl hover:bg-red-100 transition border border-red-200 text-lg">
                                        <XCircle size={20} /> Decline
                                    </button>
                                </div>
                            )}

                            {b.status === 'accepted' && (
                                <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-2xl shadow-sm text-center">
                                    <label className="block text-xs font-black uppercase tracking-widest text-blue-800 mb-4">Enter Customer's OTP</label>
                                    <div className="flex gap-3">
                                        <input 
                                            type="text" 
                                            maxLength="4" 
                                            placeholder="XXXX"
                                            className="w-24 text-center font-mono font-black text-3xl border-2 border-blue-300 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-200 text-gray-900"
                                            value={otpInputs[b.id] || ''}
                                            onChange={(e) => setOtpInputs({...otpInputs, [b.id]: e.target.value})}
                                        />
                                        <button 
                                            onClick={() => handleComplete(b.id)}
                                            className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition shadow-md flex items-center justify-center text-sm"
                                        >
                                            <CheckCircle size={18} className="mr-1"/> Verify & Complete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {bookings.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-4">
                        <CheckCircle size={56} className="mx-auto text-green-300 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">You're all caught up!</h3>
                        <p className="text-gray-500 text-lg">No incoming job requests at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderDashboard;
