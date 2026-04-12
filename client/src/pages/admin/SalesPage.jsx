import React, { useState, useEffect } from 'react';
import { Percent, Plus, Trash2, Calendar, X, ShoppingBag } from 'lucide-react';

const SalesPage = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        discountPercentage: '',
        category: 'All',
        startDate: '',
        endDate: '',
        isActive: true
    });

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            // Reusing admin route logic for sales (creating a new one actually)
            const res = await fetch('http://localhost:5000/api/admin/sales', {
                credentials: 'include',
            });
            const data = await res.json();
            setSales(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching sales:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/admin/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    discountPercentage: Number(formData.discountPercentage)
                }),
                credentials: 'include',
            });
            if (res.ok) {
                alert('Sale created successfully!');
                setShowForm(false);
                fetchSales();
            }
        } catch (error) {
            console.error('Error creating sale:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this sale?')) return;
        try {
            await fetch(`http://localhost:5000/api/admin/sales/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            fetchSales();
        } catch (error) {
            console.error('Error deleting sale:', error);
        }
    };

    if (loading) return <div className="p-8">Loading sales...</div>;

    return (
        <div className="space-y-6 font-body">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-aero-text font-heading">Festival Sales</h1>
                    <p className="text-gray-500">Manage store-wide or category-specific discounts</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-[#0F1720] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> New Sale
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                        <div className="flex justify-between mb-4 border-b pb-4">
                            <h2 className="text-xl font-bold">Create Sale</h2>
                            <button onClick={() => setShowForm(false)}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="name" required placeholder="Sale Name (e.g. Diwali Dhamaka)" className="w-full h-12 px-4 rounded-xl border border-gray-200" value={formData.name} onChange={handleInputChange} />
                            <div className="grid grid-cols-2 gap-4">
                                <input name="discountPercentage" type="number" required placeholder="Discount %" className="w-full h-12 px-4 rounded-xl border border-gray-200" value={formData.discountPercentage} onChange={handleInputChange} />
                                <select name="category" className="w-full h-12 px-4 rounded-xl border border-gray-200" value={formData.category} onChange={handleInputChange}>
                                    <option value="All">All Categories</option>
                                    <option value="Sneakers">Sneakers</option>
                                    <option value="Running">Running</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold">Start Date</label><input name="startDate" type="date" required className="w-full h-12 px-4 rounded-xl border border-gray-200" value={formData.startDate} onChange={handleInputChange} /></div>
                                <div><label className="text-xs font-bold">End Date</label><input name="endDate" type="date" required className="w-full h-12 px-4 rounded-xl border border-gray-200" value={formData.endDate} onChange={handleInputChange} /></div>
                            </div>
                            <button type="submit" className="w-full h-12 bg-[#0F1720] text-white rounded-xl font-bold">ACTIVATE SALE</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sales.map((sale) => (
                    <div key={sale._id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4">
                            <button onClick={() => handleDelete(sale._id)}><Trash2 className="w-4 h-4 text-gray-300 hover:text-red-500" /></button>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-4 bg-red-50 rounded-2xl text-red-600"><Percent className="w-8 h-8" /></div>
                            <div>
                                <h3 className="text-xl font-bold">{sale.name}</h3>
                                <p className="text-red-600 font-black text-2xl">{sale.discountPercentage}% OFF</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 mt-6 pt-6 border-t font-bold text-sm text-gray-500">
                            <span className="flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> {sale.category}</span>
                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(sale.startDate).toLocaleDateString()} - {new Date(sale.endDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SalesPage;
