import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { AlertTriangle, MapPin, DollarSign, X } from 'lucide-react';

const EmergencyModal = ({ isOpen, onClose }) => {
    const { token, user } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        category_id: '',
        description: '',
        offered_price: '',
        lat: null,
        lng: null
    });
    const [locating, setLocating] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && categories.length === 0) {
            axios.get('/api/providers/categories').then(res => {
                setCategories(res.data.categories);
            }).catch(console.error);
        }
    }, [isOpen, categories.length]);

    const handleDetectLocation = () => {
        setLocating(true);
        if (!navigator.geolocation) {
            alert("Geolocation not supported");
            setLocating(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setFormData({ ...formData, lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocating(false);
            },
            (err) => {
                alert("Failed to detect location. Please allow location permissions.");
                setLocating(false);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || user.role !== 'customer') {
            alert("Only customers can post emergencies.");
            return;
        }
        if (!formData.lat || !formData.lng) {
            alert("Please detect your exact location first so nearby providers can find you.");
            return;
        }
        setSubmitting(true);
        try {
            await axios.post('/api/emergency', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Emergency SOS Broadcasted successfully! Nearby providers are being notified.");
            setFormData({ category_id: '', description: '', offered_price: '', lat: null, lng: null });
            onClose();
        } catch (error) {
            console.error("SOS Error:", error);
            alert("Failed to broadcast SOS.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-[100] animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border-2 border-red-500">
                <div className="bg-red-600 p-6 flex justify-between items-center text-white">
                    <h2 className="text-2xl font-extrabold flex items-center gap-2">
                        <AlertTriangle size={28} className="animate-pulse" /> Post Emergency SOS
                    </h2>
                    <button onClick={onClose} className="text-white hover:bg-red-700 p-1 rounded-lg transition"><X size={24} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="mb-5">
                        <label className="block text-sm font-bold text-gray-700 mb-2">What service do you urgently need?</label>
                        <select 
                            required
                            value={formData.category_id} 
                            onChange={e => setFormData({...formData, category_id: e.target.value})}
                            className="w-full border-gray-300 border-2 rounded-xl px-4 py-3.5 font-bold text-lg focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition"
                        >
                            <option value="">Select Service Category...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Emergency Description</label>
                        <textarea 
                            required rows="3" 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="e.g. Main water pipe burst! Need help NOW!"
                            className="w-full border-gray-300 border-2 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition resize-none"
                        ></textarea>
                    </div>

                    <div className="mb-6 flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Offered Price (Rs.)</label>
                            <div className="relative">
                                <DollarSign size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input 
                                    type="number" required min="1"
                                    value={formData.offered_price}
                                    onChange={e => setFormData({...formData, offered_price: e.target.value})}
                                    placeholder="e.g. 150"
                                    className="w-full pl-10 pr-4 py-3.5 border-gray-300 border-2 rounded-xl font-bold text-lg focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition"
                                />
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-end">
                            <button 
                                type="button" onClick={handleDetectLocation}
                                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition border-2 ${formData.lat ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}
                            >
                                <MapPin size={20} />
                                {locating ? 'Locating...' : formData.lat ? 'Location Set!' : 'Auto Detect GPS'}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" disabled={submitting}
                        className="w-full bg-red-600 text-white font-extrabold py-4 rounded-xl hover:bg-red-700 transition shadow-lg flex justify-center items-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <AlertTriangle size={24} />
                        {submitting ? 'Broadcasting...' : 'Broadcast SOS Now!'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EmergencyModal;
