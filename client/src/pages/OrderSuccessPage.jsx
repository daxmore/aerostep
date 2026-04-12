import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight, Download, Mail, Star } from 'lucide-react';
import axios from 'axios';

const OrderSuccessPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Get order by transactionId (which is passed as orderId from checkout)
                const res = await axios.get(`http://localhost:5000/api/orders/transaction/${orderId}`);
                setOrder(res.data);
            } catch (_err) {
                console.error("Error fetching order for success page:", _err);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handleDownloadInvoice = async () => {
        if (!order) return;
        try {
            const response = await axios.get(`http://localhost:5000/api/orders/${order._id}/invoice`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `AeroStep-Invoice-${order._id.slice(-6)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (_err) {
            alert("Error downloading invoice. Please try again later.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-20 px-4">
            {/* Confetti Animation Placeholder Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>

            <div className="max-w-3xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-500/10 overflow-hidden border border-gray-100 flex flex-col items-center text-center p-8 lg:p-16 relative">
                
                {/* Visual Accent */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>

                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-8 animate-bounce transition-transform duration-1000">
                    <CheckCircle className="w-12 h-12" />
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-black mb-4 tracking-tighter text-[#0F1720]">
                    PAYMENT <span className="text-[#0057FF]">SUCCESS!</span>
                </h1>
                
                <p className="text-xl text-gray-500 mb-2 max-w-lg">
                    Your Aeros are officially in the queue for takeoff.
                </p>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-12">
                    <Mail className="w-4 h-4" />
                    Confirmation sent to your inbox
                </div>

                {order && (
                    <div className="w-full bg-gray-50 rounded-3xl p-6 mb-12 text-left border border-gray-100">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Order ID</p>
                                <p className="font-mono text-gray-700">#{order._id.slice(-8).toUpperCase()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Total Paid</p>
                                <p className="text-xl font-black text-[#0F1720]">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <button 
                                onClick={handleDownloadInvoice}
                                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-sm"
                            >
                                <Download className="w-4 h-4" />
                                Download Invoice PDF
                            </button>
                            <Link 
                                to={`/profile`}
                                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-sm"
                            >
                                <Star className="w-4 h-4 text-yellow-500" />
                                View Order Details
                            </Link>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <Link 
                        to="/shop" 
                        className="flex-1 py-5 bg-[#0F1720] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#0057FF] transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        Keep Shopping
                    </Link>
                    <Link 
                        to="/profile" 
                        className="flex-1 py-5 border-2 border-gray-100 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-95"
                    >
                        Profile Page
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-100 w-full flex items-center justify-center gap-8 grayscale opacity-50">
                    <span className="text-xs font-bold uppercase tracking-widest">Secure Checkout</span>
                    <span className="text-xs font-bold uppercase tracking-widest">Fast Logistics</span>
                    <span className="text-xs font-bold uppercase tracking-widest">24/7 Support</span>
                </div>
            </div>
            
            <p className="mt-8 text-gray-400 text-sm">
                Redirecting automatically to your profile in <span className="font-bold text-gray-600">30 seconds</span>...
            </p>
        </div>
    );
};

export default OrderSuccessPage;
