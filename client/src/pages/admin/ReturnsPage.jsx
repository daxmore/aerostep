import React, { useState, useEffect } from 'react';
import { RotateCcw, Check, X, User, Package, Calendar, MessageSquare } from 'lucide-react';

const ReturnsPage = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReturns();
    }, []);

    const fetchReturns = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/orders?status=All', {
                credentials: 'include',
            });
            const allOrders = await res.json();
            // Filter only requested returns
            const requests = allOrders.filter(order => order.returnStatus === 'Requested');
            setReturns(requests);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching returns:', error);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this return request?`)) return;
        
        try {
            const res = await fetch(`http://localhost:5000/api/admin/orders/${id}/return-status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
                credentials: 'include',
            });
            if (res.ok) {
                alert(`Return request ${status.toLowerCase()}ed successfully!`);
                fetchReturns();
            }
        } catch (error) {
            console.error('Error updating return status:', error);
        }
    };

    if (loading) return <div className="p-8">Loading return requests...</div>;

    return (
        <div className="space-y-6 font-body">
            <div>
                <h1 className="text-3xl font-bold text-aero-text font-heading">Return Requests</h1>
                <p className="text-gray-500 mt-1">Review and process customer return applications</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {returns.map((request) => (
                    <div key={request._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                                                <RotateCcw className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-[#0F1720]">Order #{request._id.slice(-8).toUpperCase()}</h3>
                                                <p className="text-sm text-gray-500">Requested on {new Date(request.returnRequestedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="lg:hidden flex gap-2">
                                            <button onClick={() => handleStatusUpdate(request._id, 'Approved')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Check /></button>
                                            <button onClick={() => handleStatusUpdate(request._id, 'Rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><X /></button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                                        <div className="flex items-center gap-3 text-sm">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="font-bold text-[#0F1720]">{request.userId?.name}</p>
                                                <p className="text-gray-500 text-xs">{request.userId?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Package className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="font-bold text-[#0F1720]">{request.products.length} Products</p>
                                                <p className="text-gray-500 text-xs">Total: ₹{request.totalPrice.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm lg:col-span-2">
                                            <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />
                                            <div className="bg-gray-50 p-3 rounded-xl w-full">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Reason for Return</p>
                                                <p className="text-[#0F1720]">{request.returnReason || 'No reason provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden lg:flex flex-col gap-2 min-w-[200px]">
                                    <button
                                        onClick={() => handleStatusUpdate(request._id, 'Approved')}
                                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-100"
                                    >
                                        <Check className="w-5 h-5" />
                                        APPROVE RETURN
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(request._id, 'Rejected')}
                                        className="w-full py-3 bg-white text-red-600 border border-red-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                        REJECT REQUEST
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {returns.length === 0 && (
                    <div className="bg-gray-50 rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
                        <RotateCcw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-600">No Return Requests</h2>
                        <p className="text-gray-400">Everything is processed! All quiet on the returns front.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReturnsPage;
