import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2, Calendar, Users, DollarSign, X, CheckCircle } from 'lucide-react';

const CouponsPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountAmount: '',
        minOrderAmount: '0',
        expiryDate: '',
        usageLimit: '100',
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/coupons/admin/all', {
                credentials: 'include',
            });
            const data = await res.json();
            setCoupons(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/coupons/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    discountAmount: Number(formData.discountAmount),
                    minOrderAmount: Number(formData.minOrderAmount),
                    usageLimit: Number(formData.usageLimit),
                }),
                credentials: 'include',
            });
            if (res.ok) {
                alert('Coupon created successfully!');
                setShowForm(false);
                setFormData({
                    code: '',
                    discountType: 'percentage',
                    discountAmount: '',
                    minOrderAmount: '0',
                    expiryDate: '',
                    usageLimit: '100',
                });
                fetchCoupons();
            } else {
                const data = await res.json();
                alert(data.msg || 'Failed to create coupon');
            }
        } catch (error) {
            console.error('Error creating coupon:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/coupons/admin/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (res.ok) {
                fetchCoupons();
            }
        } catch (error) {
            console.error('Error deleting coupon:', error);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-gray-400 font-body">Loading coupons...</div>
        </div>
    );

    return (
        <div className="space-y-6 font-body">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-aero-text font-heading">Coupons Management</h1>
                    <p className="text-gray-500 mt-1">Create and manage discount codes for your customers</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-[#0F1720] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#2a3441] transition-all shadow-md active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    New Coupon
                </button>
            </div>

            {/* Create Coupon Form Overlay */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold font-heading">Create New Coupon</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold mb-1 opacity-70">Coupon Code</label>
                                    <input
                                        name="code"
                                        required
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#0F1720] focus:ring-0 uppercase font-mono font-bold"
                                        placeholder="SAVE20"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 opacity-70">Discount Type</label>
                                    <select
                                        name="discountType"
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#0F1720]"
                                        value={formData.discountType}
                                        onChange={handleInputChange}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 opacity-70">Discount Value</label>
                                    <input
                                        name="discountAmount"
                                        type="number"
                                        required
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#0F1720]"
                                        placeholder={formData.discountType === 'percentage' ? '20' : '500'}
                                        value={formData.discountAmount}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 opacity-70">Min Order Amount (₹)</label>
                                    <input
                                        name="minOrderAmount"
                                        type="number"
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#0F1720]"
                                        value={formData.minOrderAmount}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 opacity-70">Expiry Date</label>
                                    <input
                                        name="expiryDate"
                                        type="date"
                                        required
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#0F1720]"
                                        value={formData.expiryDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold mb-1 opacity-70">Usage Limit</label>
                                    <input
                                        name="usageLimit"
                                        type="number"
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#0F1720]"
                                        value={formData.usageLimit}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full h-12 bg-[#0F1720] text-white rounded-xl font-bold mt-4 hover:shadow-lg transition-all">
                                CREATE COUPON
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Coupons List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((coupon) => (
                    <div key={coupon._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        {/* Status Stripe */}
                        <div className={`absolute top-0 left-0 right-0 h-1 ${new Date(coupon.expiryDate) < new Date() ? 'bg-red-400' : 'bg-green-400'}`} />
                        
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                                    <Ticket className="w-6 h-6 text-aero-primary" />
                                </div>
                                <button onClick={() => handleDelete(coupon._id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h3 className="text-xl font-black font-mono tracking-tighter text-[#0F1720] mb-2">{coupon.code}</h3>
                            
                            <div className="flex items-center gap-2 mb-6">
                                <span className="bg-blue-600 text-white text-xs font-black px-2 py-1 rounded">
                                    {coupon.discountType === 'percentage' ? `${coupon.discountAmount}% OFF` : `₹${coupon.discountAmount} OFF`}
                                </span>
                                <span className="text-xs font-bold text-gray-400 uppercase">
                                    Min: ₹{coupon.minOrderAmount}
                                </span>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                                        <Calendar className="w-4 h-4" />
                                        Expires
                                    </div>
                                    <span className={`font-bold ${new Date(coupon.expiryDate) < new Date() ? 'text-red-500' : 'text-[#0F1720]'}`}>
                                        {new Date(coupon.expiryDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                                        <Users className="w-4 h-4" />
                                        Usage
                                    </div>
                                    <span className="font-bold text-[#0F1720]">
                                        {coupon.usedCount} / {coupon.usageLimit}
                                    </span>
                                </div>
                            </div>

                            {/* Progress bar for usage */}
                            <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-600 transition-all duration-1000" 
                                    style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {coupons.length === 0 && (
                <div className="bg-gray-50 rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
                    <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-600">No coupons active</h2>
                    <p className="text-gray-400 mb-8 max-w-xs mx-auto text-sm">Start by creating your first promotional code to boost sales!</p>
                </div>
            )}
        </div>
    );
};

export default CouponsPage;
