import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Star, MapPin, Phone, Mail, UserCheck, CheckCircle } from 'lucide-react';

const ProviderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Booking Form State
    const [serviceDate, setServiceDate] = useState('');
    const [problemDesc, setProblemDesc] = useState('');
    const [agreedPrice, setAgreedPrice] = useState('');

    useEffect(() => {
        const fetchProvider = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/providers/${id}`);
                setProvider(res.data.provider);
                setAgreedPrice(res.data.provider.hourly_rate); // Default to provider's hourly rate
            } catch (error) {
                console.error("Failed to load provider", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProvider();
    }, [id]);

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await axios.post('http://localhost:5000/api/bookings', 
                { 
                    provider_id: provider.user_id, 
                    service_date: serviceDate, 
                    problem_description: problemDesc,
                    agreed_price: agreedPrice 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Booking request sent successfully!");
            setShowModal(false);
            navigate('/dashboard'); // This resolves to /customer-dashboard logic in our App.jsx
        } catch (error) {
            console.error("Booking error:", error);
            alert(error.response?.data?.message || "Failed to create booking.");
        }
    };

    if (loading) return <div className="text-center py-20 text-xl font-bold text-gray-500 animate-pulse">Loading Profile...</div>;
    if (!provider) return <div className="text-center py-20 text-xl font-bold text-red-500">Provider not found</div>;

    const isCustomer = user && user.role === 'customer';

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="bg-white rounded-3xl shadow-sm border p-8 mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                            {provider.name} 
                            {provider.is_verified ? (
                                <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full ml-2"><CheckCircle size={18} /> Verified</span>
                            ) : null}
                        </h1>
                        <p className="text-blue-600 font-bold mt-1 text-lg bg-blue-50 inline-block px-3 py-1 rounded-lg">{provider.category_name}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-extrabold text-gray-900">Rs. {provider.hourly_rate}<span className="text-base font-normal text-gray-500">/hr</span></div>
                        <div className="flex justify-end items-center gap-1 text-amber-500 font-bold mt-2">
                            <Star size={20} fill="currentColor" /> {provider.average_rating}
                        </div>
                    </div>
                </div>

                <p className="text-gray-700 text-lg leading-relaxed mb-8">{provider.bio}</p>

                <div className="flex flex-col md:flex-row gap-6 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 text-gray-800 font-semibold">
                        <Phone size={20} className="text-blue-500" /> {provider.phone || 'Phone not provided'}
                    </div>
                    <div className="flex items-center gap-3 text-gray-800 font-semibold">
                        <Mail size={20} className="text-blue-500" /> {provider.email}
                    </div>
                    <div className="flex items-center gap-3 text-gray-800 font-semibold">
                        <MapPin size={20} className="text-red-500" /> Available in your area
                    </div>
                </div>

                {isCustomer ? (
                    <button 
                        onClick={() => setShowModal(true)}
                        className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:shadow-xl hover:bg-blue-700 transition"
                    >
                        Book Service
                    </button>
                ) : (
                    <div className="text-center p-4 bg-yellow-50 text-yellow-700 font-semibold rounded-xl border border-yellow-200">
                        {user ? "You must be a customer to book services." : "Please log in as a customer to book this provider."}
                    </div>
                )}
            </div>

            {/* Reviews Section */}
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Recent Customer Reviews</h2>
            <div className="space-y-4">
                {provider.reviews && provider.reviews.length > 0 ? (
                    provider.reviews.map(r => (
                        <div key={r.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between mb-3">
                                <span className="font-bold text-gray-900 text-lg">{r.customer_name}</span>
                                <div className="flex gap-1 text-amber-400">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < r.rating ? "currentColor" : "none"} />)}
                                </div>
                            </div>
                            <p className="text-gray-600 leading-relaxed text-base">{r.comment}</p>
                            <div className="text-xs font-semibold text-gray-400 mt-4 uppercase tracking-wider">{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl text-gray-500 font-medium border border-gray-100">
                        No reviews yet for this provider.
                    </div>
                )}
            </div>

            {/* Tailwind Booking Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
                        <div className="mb-6 border-b pb-4">
                            <h2 className="text-2xl font-extrabold text-gray-900">Book {provider.name}</h2>
                            <p className="text-gray-500 font-medium mt-1">Fill out the details below to request a service.</p>
                        </div>

                        <form onSubmit={handleBookingSubmit}>
                            <div className="mb-5">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Service Date & Time</label>
                                <input 
                                    type="datetime-local" required
                                    value={serviceDate} onChange={e => setServiceDate(e.target.value)}
                                    className="w-full border-gray-300 border-2 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition bg-gray-50 focus:bg-white"
                                />
                            </div>
                            
                            <div className="mb-5">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Problem Description</label>
                                <textarea 
                                    required rows="3"
                                    value={problemDesc} onChange={e => setProblemDesc(e.target.value)}
                                    placeholder="Describe what needs to be fixed..."
                                    className="w-full border-gray-300 border-2 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition resize-none bg-gray-50 focus:bg-white"
                                ></textarea>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Agreed Price (Rs.)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none font-bold text-gray-500">Rs.</div>
                                    <input 
                                        type="number" step="0.01" required
                                        value={agreedPrice} onChange={e => setAgreedPrice(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border-gray-300 border-2 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition font-bold"
                                    />
                                </div>
                                <p className="text-xs font-medium text-gray-500 mt-2">Defaults to the provider's hourly rate.</p>
                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-800 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition">Submit Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderDetails;
