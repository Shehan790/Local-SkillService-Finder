import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapPin, Search, Star, Phone, CheckCircle, AlertTriangle } from 'lucide-react';
import ServiceMap from '../components/ServiceMap';
import EmergencyModal from '../components/EmergencyModal';

const Home = () => {
    const [providers, setProviders] = useState([]);
    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);
    const [radius, setRadius] = useState(10);
    const [categoryId, setCategoryId] = useState('');
    const [minRating, setMinRating] = useState(0);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);

    const detectLocation = () => {
        setLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLat(position.coords.latitude);
                    setLng(position.coords.longitude);
                    setLoadingLocation(false);
                },
                (error) => {
                    console.error("Error detecting location", error);
                    alert("Could not detect location. Please enable location permissions.");
                    setLoadingLocation(false);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
            setLoadingLocation(false);
        }
    };

    const fetchProviders = async () => {
        if (!lat || !lng) {
            alert("Please click 'Detect My Location' first.");
            return;
        }
        
        setLoadingSearch(true);
        try {
            const params = { lat, lng, radius, min_rating: minRating };
            if (categoryId) params.category_id = categoryId;
            
            const response = await axios.get('/api/providers/search', { params });
            setProviders(response.data.providers || []);
        } catch (error) {
            console.error("Error fetching providers:", error);
            alert("Failed to fetch providers.");
        } finally {
            setLoadingSearch(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-16">
            <EmergencyModal isOpen={showEmergencyModal} onClose={() => setShowEmergencyModal(false)} />
            {/* Header section */}
            <div className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-6 tracking-tight leading-tight">
                    Find the Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Local Professionals</span>
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
                    Connect with highly rated plumbers, electricians, tutors, and carpenters right in your neighborhood. Book instantly.
                </p>
                
                <button 
                    onClick={() => setShowEmergencyModal(true)}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-pulse border-4 border-red-200"
                >
                    <AlertTriangle size={24} /> 🚨 Post Emergency SOS
                </button>
            </div>

            {/* Filters Section (Glassmorphism & Clean Borders) */}
            <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-sm border mb-12 flex flex-col md:flex-row gap-6 items-end">
                <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Location</label>
                    <button 
                        onClick={detectLocation}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl transition ${lat ? 'bg-green-50 hover:bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                    >
                        <MapPin size={18} className={loadingLocation ? "animate-bounce" : ""} />
                        {lat && lng ? `Detected (${lat.toFixed(2)}, ${lng.toFixed(2)})` : 'Detect My Location'}
                    </button>
                </div>
                
                <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Service Category</label>
                    <select 
                        value={categoryId} 
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full border-gray-200 border-2 py-3.5 px-4 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    >
                        <option value="">All Categories</option>
                        <option value="1">Plumber</option>
                        <option value="2">Electrician</option>
                        <option value="3">Tutor</option>
                        <option value="4">Carpenter</option>
                    </select>
                </div>

                <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Radius: {radius} km</label>
                    <input 
                        type="range" min="1" max="50" 
                        value={radius} onChange={(e) => setRadius(e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min Rating</label>
                    <select 
                        value={minRating} onChange={(e) => setMinRating(e.target.value)}
                        className="w-full border-gray-200 border-2 py-3.5 px-4 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    >
                        <option value="0">Any Rating</option>
                        <option value="3">3+ Stars</option>
                        <option value="4">4+ Stars</option>
                        <option value="4.5">4.5+ Stars</option>
                    </select>
                </div>

                <button 
                    onClick={fetchProviders}
                    disabled={loadingSearch}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-10 py-3.5 rounded-2xl font-bold flex justify-center items-center gap-2 transition shadow-md hover:shadow-lg"
                >
                    {loadingSearch ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Search size={18} />} 
                    Search
                </button>
            </div>

            {/* Results & Map Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Providers List */}
                <div className="order-2 lg:order-1 h-[550px] overflow-y-auto pr-4 space-y-6 scrollbar-hide">
                    {providers.map(p => (
                        <div key={p.provider_id} className="bg-white/80 backdrop-blur-md rounded-3xl p-7 shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex justify-between items-start mb-5">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        {p.name} 
                                        {p.is_verified ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ml-1"><CheckCircle size={14} /> Verified</span>
                                        ) : null}
                                    </h3>
                                    <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mt-2">
                                        {p.category_name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-amber-600 font-bold">
                                    <Star size={16} fill="currentColor" /> {p.average_rating}
                                </div>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">{p.bio}</p>
                            
                            <div className="flex justify-between items-center text-sm mb-6 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                                <span className="font-bold text-gray-900 text-lg">Rs. {p.hourly_rate}<span className="text-sm font-normal text-gray-500">/hr</span></span>
                                <span className="text-gray-500 flex items-center gap-1 font-medium">
                                    <MapPin size={16} className="text-red-400" /> {parseFloat(p.distance).toFixed(1)} km
                                </span>
                            </div>
                            
                            <Link to={`/provider/${p.provider_id}`} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-md">
                                <Phone size={18} /> Contact & Book
                            </Link>
                        </div>
                    ))}
                    
                    {providers.length === 0 && !loadingSearch && lat && (
                        <div className="text-center py-20 bg-white/60 backdrop-blur-md rounded-3xl border border-gray-100 h-full flex flex-col items-center justify-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <Search className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No providers found</h3>
                            <p className="text-gray-500">Try expanding your search radius or changing the category.</p>
                        </div>
                    )}

                    {providers.length === 0 && !loadingSearch && !lat && (
                        <div className="text-center py-20 bg-white/60 backdrop-blur-md rounded-3xl border border-gray-100 h-full flex flex-col items-center justify-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-6 text-blue-500 shadow-inner">
                                <MapPin size={36} />
                            </div>
                            <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Discover Local Pros</h3>
                            <p className="text-gray-500 text-center max-w-sm px-6 font-medium">
                                Click <strong>"Detect My Location"</strong> and hit Search to instantly find highly-rated professionals around you.
                            </p>
                        </div>
                    )}
                </div>

                {/* Map View */}
                <div className="order-1 lg:order-2 sticky top-24 z-0 rounded-3xl overflow-hidden shadow-xl border border-gray-200">
                    <ServiceMap 
                        customerLocation={lat && lng ? { lat, lng } : null}
                        radius={radius}
                        providers={providers}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;
