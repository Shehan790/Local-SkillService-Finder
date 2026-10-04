import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, CheckCircle, AlertCircle, Star, AlertTriangle } from 'lucide-react';
import EmergencyModal from '../components/EmergencyModal';

const CustomerDashboard = () => {
    const { token, user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [rating, setRating] = useState('5');
    const [comment, setComment] = useState('');
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axios.get('/api/bookings/my-bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(res.data.bookings);
            } catch (error) {
                console.error("Error fetching bookings", error);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchBookings();
    }, [token]);

    const submitReview = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/reviews', 
                { booking_id: selectedBooking.id, rating: parseInt(rating), comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Review submitted successfully!");
            setShowReviewModal(false);
            // Re-fetch or manually update state to hide review button if desired
        } catch (error) {
            alert(error.response?.data?.message || "Failed to submit review");
        }
    };

    if (loading) return <div className="text-center py-20 text-xl font-bold text-gray-500 animate-pulse">Loading Dashboard...</div>;

    // Protection to ensure only customers view this component
    if (!user || user.role !== 'customer') {
        return (
            <div className="max-w-5xl mx-auto px-6 py-32 text-center">
                <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                <h1 className="text-3xl font-extrabold text-gray-900">Access Denied</h1>
                <p className="text-gray-500 text-lg mt-2">This dashboard is strictly for customer accounts.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">
            <EmergencyModal isOpen={showEmergencyModal} onClose={() => setShowEmergencyModal(false)} />
            
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Customer Dashboard</h1>
                    <p className="text-gray-500 text-lg mt-2">Manage your service requests and bookings.</p>
                </div>
                <button 
                    onClick={() => setShowEmergencyModal(true)}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all animate-pulse"
                >
                    <AlertTriangle size={20} /> Post Emergency SOS
                </button>
            </div>

            <div className="space-y-6">
                {bookings.map(b => (
                    <div key={b.id} className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start gap-6 hover:shadow-md transition">
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-extrabold text-2xl text-gray-900">{b.provider_name}</h3>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-sm
                                    ${b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                    b.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 
                                    b.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {b.status}
                                </span>
                            </div>
                            
                            <p className="text-gray-700 mb-5 text-base leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {b.problem_description}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-700">
                                <span className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100">
                                    <Calendar size={18} />
                                    {new Date(b.service_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                                {b.agreed_price && (
                                    <span className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-100">
                                        Agreed Price: Rs. {b.agreed_price}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end justify-center gap-4 min-w-[260px] w-full md:w-auto mt-4 md:mt-0">
                            {b.status === 'accepted' && (
                                <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-2xl text-center w-full shadow-sm">
                                    <div className="text-xs text-amber-700 uppercase font-black mb-2 tracking-widest flex items-center justify-center gap-1">
                                        <AlertCircle size={14}/> Completion OTP
                                    </div>
                                    <div className="text-4xl font-mono font-black tracking-widest text-gray-900 mb-3">{b.completion_otp}</div>
                                    <p className="text-xs text-amber-800 font-bold leading-tight px-2">
                                        Share this OTP with the provider <strong className="underline text-red-600">ONLY</strong> after the job is completed.
                                    </p>
                                </div>
                            )}

                            {b.status === 'completed' && (
                                <button 
                                    onClick={() => { setSelectedBooking(b); setShowReviewModal(true); }}
                                    className="bg-gray-900 text-white font-bold py-4 px-6 rounded-xl hover:bg-gray-800 transition shadow-lg w-full flex justify-center items-center gap-2 text-lg"
                                >
                                    <Star size={20} className="text-amber-400" fill="currentColor" /> Leave a Review
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                
                {bookings.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <Calendar size={56} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-500 text-lg">You haven't requested any services yet.</p>
                    </div>
                )}
            </div>

            {/* Tailwind Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
                        <div className="mb-6 border-b pb-4">
                            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                                Rate {selectedBooking?.provider_name} <CheckCircle size={24} className="text-green-500" />
                            </h2>
                            <p className="text-gray-500 font-medium mt-1">How was your experience with this service provider?</p>
                        </div>

                        <form onSubmit={submitReview}>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Star Rating</label>
                                <select 
                                    value={rating} onChange={e => setRating(e.target.value)} 
                                    className="w-full border-gray-300 border-2 rounded-xl px-4 py-4 font-bold text-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition bg-gray-50 focus:bg-white"
                                >
                                    <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
                                    <option value="4">⭐⭐⭐⭐ - Good</option>
                                    <option value="3">⭐⭐⭐ - Okay</option>
                                    <option value="2">⭐⭐ - Poor</option>
                                    <option value="1">⭐ - Terrible</option>
                                </select>
                            </div>
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Write a Comment</label>
                                <textarea 
                                    required rows="4" 
                                    value={comment} onChange={e => setComment(e.target.value)} 
                                    placeholder="They did a great job fixing the pipes..."
                                    className="w-full border-gray-300 border-2 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition resize-none bg-gray-50 focus:bg-white"
                                ></textarea>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowReviewModal(false)} className="flex-1 bg-gray-100 text-gray-800 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition">Submit Review</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;
