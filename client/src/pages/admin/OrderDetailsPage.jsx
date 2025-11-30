import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, CreditCard } from 'lucide-react';

const OrderDetailsPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrderDetails();
        // eslint-disable-next-line
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/orders/${id}`, {
                credentials: 'include',
            });
            const data = await response.json();
            setOrder(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching order:', error);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!confirm(`Change order status to "${newStatus}"?`)) return;

        setUpdating(true);
        try {
            const response = await fetch(`http://localhost:5000/api/admin/orders/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                const updatedOrder = await response.json();
                setOrder(updatedOrder);
                alert('Order status updated successfully');
            } else {
                const data = await response.json();
                alert(data.msg || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating order status');
        }
        setUpdating(false);
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
            'Processing': 'bg-blue-50 text-blue-700 border-blue-200',
            'Shipped': 'bg-purple-50 text-purple-700 border-purple-200',
            'Delivered': 'bg-green-50 text-green-700 border-green-200',
            'Cancelled': 'bg-red-50 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-50 text-gray-600 border-gray-200';
    };

    if (loading) {
        return <div className="text-gray-500 font-body">Loading order details...</div>;
    }

    if (!order) {
        return (
            <div className="text-center font-body">
                <p className="text-gray-500 mb-4">Order not found</p>
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="px-4 py-2 bg-aero-primary hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-body">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-aero-text font-heading">Order #{order._id.slice(-8)}</h1>
                        <p className="text-gray-500">
                            Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Status Update Dropdown */}
                <div className="flex items-center gap-3">
                    <span className="text-gray-500">Status:</span>
                    <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        disabled={updating || order.status === 'Delivered'}
                        className="px-4 py-2 bg-aero-surface border border-gray-200 rounded-lg text-aero-text focus:outline-none focus:ring-2 focus:ring-aero-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-aero-surface rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-bold text-aero-text mb-4 flex items-center gap-2 font-heading">
                            <Package className="w-5 h-5" />
                            Order Items
                        </h2>
                        <div className="space-y-4">
                            {order.products.map((item) => (
                                <div key={item._id} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <img
                                        src={item.productId?.images?.primary || '/placeholder.png'}
                                        alt={item.productId?.title}
                                        className="w-20 h-20 object-cover rounded bg-gray-200"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-aero-text font-medium">{item.productId?.title || 'Product'}</h3>
                                        <div className="text-sm text-gray-500 mt-1">
                                            <p>Size: {item.size}</p>
                                            <p>Quantity: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-aero-text font-medium">₹{(item.price || 0).toFixed(2)}</p>
                                        <p className="text-sm text-gray-500">× {item.quantity || 0}</p>
                                        <p className="text-aero-text font-bold mt-1">₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Summary & Customer Info */}
                <div className="space-y-4">
                    {/* Customer Info */}
                    <div className="bg-aero-surface rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-bold text-aero-text mb-4 flex items-center gap-2 font-heading">
                            <User className="w-5 h-5" />
                            Customer Information
                        </h2>
                        <div className="space-y-2 text-sm">
                            <p className="text-gray-500">Name:</p>
                            <p className="text-aero-text font-medium">{order.userId?.name || 'N/A'}</p>
                            <p className="text-gray-500 mt-3">Email:</p>
                            <p className="text-aero-text">{order.userId?.email || 'N/A'}</p>
                            <p className="text-gray-500 mt-3">Phone:</p>
                            <p className="text-aero-text">{order.userId?.phone || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-aero-surface rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-bold text-aero-text mb-4 flex items-center gap-2 font-heading">
                            <MapPin className="w-5 h-5" />
                            Shipping Address
                        </h2>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>{order.shippingAddress?.street}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                            <p>{order.shippingAddress?.zipCode}</p>
                            <p>{order.shippingAddress?.country}</p>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-aero-surface rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-bold text-aero-text mb-4 flex items-center gap-2 font-heading">
                            <CreditCard className="w-5 h-5" />
                            Order Summary
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal:</span>
                                <span className="text-aero-text">₹{order.totalPrice?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Shipping:</span>
                                <span className="text-aero-text">Free</span>
                            </div>
                            <div className="border-t border-gray-100 pt-2 mt-2">
                                <div className="flex justify-between">
                                    <span className="text-aero-text font-bold">Total:</span>
                                    <span className="text-aero-text font-bold text-lg">₹{order.totalPrice?.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-gray-500">Payment Method:</p>
                                <p className="text-aero-text">{order.paymentMethod || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
