import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Phone, Briefcase } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', role: 'customer', category_id: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.post('/api/auth/register', formData);
            alert("Registration successful! Please sign in.");
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 py-12">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100 w-full max-w-xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Create an Account</h1>
                    <p className="text-gray-500">Join SkillFinder as a Customer or Service Provider</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><User size={18} /></div>
                                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition" placeholder="John Doe" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Phone size={18} /></div>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition" placeholder="(555) 123-4567" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Mail size={18} /></div>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition" placeholder="you@example.com" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
                            <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition" placeholder="••••••••" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <label className="block text-sm font-bold text-gray-700 mb-3">I want to register as a:</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-2xl cursor-pointer transition ${formData.role === 'customer' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="role" value="customer" checked={formData.role === 'customer'} onChange={handleChange} className="hidden" />
                                <User size={24} />
                                <span className="font-bold">Customer</span>
                            </label>
                            <label className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-2xl cursor-pointer transition ${formData.role === 'provider' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="role" value="provider" checked={formData.role === 'provider'} onChange={handleChange} className="hidden" />
                                <Briefcase size={24} />
                                <span className="font-bold">Service Provider</span>
                            </label>
                        </div>
                    </div>

                    {formData.role === 'provider' && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                            <label className="block text-sm font-bold text-gray-700 mb-2">My Service Category</label>
                            <select 
                                name="category_id" required={formData.role === 'provider'} 
                                value={formData.category_id} onChange={handleChange}
                                className="w-full border-gray-200 border-2 py-3 px-4 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition"
                            >
                                <option value="">Select a profession</option>
                                <option value="1">Plumber</option>
                                <option value="2">Electrician</option>
                                <option value="3">Tutor</option>
                                <option value="4">Carpenter</option>
                            </select>
                        </div>
                    )}

                    <button 
                        type="submit" disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition mt-4 shadow-md hover:shadow-lg disabled:opacity-70"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center mt-8 text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
