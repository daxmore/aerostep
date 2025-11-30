import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, PackageX, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalUsers: 0,
        lowStockItems: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch orders
            const ordersRes = await fetch('http://localhost:5000/api/admin/orders', {
                credentials: 'include',
            });
            const orders = ordersRes.ok ? await ordersRes.json() : [];

            // Fetch users
            const usersRes = await fetch('http://localhost:5000/api/admin/users', {
                credentials: 'include',
            });
            const users = usersRes.ok ? await usersRes.json() : [];

            // Fetch products
            const productsRes = await fetch('http://localhost:5000/api/products');
            const products = productsRes.ok ? await productsRes.json() : [];

            // Calculate stats
            const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);

            // Get products with stock <= 10
            const lowStock = products.filter(product => {
                const totalStock = product.sizes?.reduce((sum, size) => sum + size.stock, 0) || 0;
                return totalStock <= 10;
            });

            setStats({
                totalSales,
                totalOrders: orders.length,
                totalUsers: users.length,
                lowStockItems: lowStock.length,
            });

            // Get 5 most recent orders
            setRecentOrders(orders.slice(0, 5));

            // Get low stock products (limited to 5 for dashboard)
            setLowStockProducts(lowStock.slice(0, 5));

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const StatCard = ({ icon: StatIcon, title, value, iconColor }) => (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${iconColor}`}>
                    <StatIcon className="w-6 h-6 text-white" />
                </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-gray-400">Welcome to AeroStep Admin Dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={DollarSign}
                    title="Total Sales"
                    value={`₹${stats.totalSales.toLocaleString()}`}
                    iconColor="bg-green-600"
                />
                <StatCard
                    icon={ShoppingCart}
                    title="Total Orders"
                    value={stats.totalOrders}
                    iconColor="bg-blue-600"
                />
                <StatCard
                    icon={Users}
                    title="Total Users"
                    value={stats.totalUsers}
                    iconColor="bg-purple-600"
                />
                <Link to="/admin/low-stock">
                    <StatCard
                        icon={PackageX}
                        title="Low Stock Alerts"
                        value={stats.lowStockItems}
                        iconColor="bg-red-600"
                    />
                </Link>
            </div>

            {/* Low Stock Products Alert */}
            {lowStockProducts.length > 0 && (
                <div className="bg-red-900/20 border border-red-600 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                        <h2 className="text-xl font-bold text-white">Low Stock Alert</h2>
                    </div>
                    <div className="space-y-3">
                        {lowStockProducts.map(product => {
                            const totalStock = product.sizes?.reduce((sum, size) => sum + size.stock, 0) || 0;
                            return (
                                <div key={product._id} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-300">{product.title}</span>
                                    <span className="text-red-400 font-medium">{totalStock} units left</span>
                                </div>
                            );
                        })}
                    </div>
                    <Link
                        to="/admin/low-stock"
                        className="mt-4 inline-block text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                        View all low stock items →
                    </Link>
                </div>
            )}

            {/* Recent Orders */}
            <div className="bg-gray-800 rounded-xl border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Recent Orders
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    {recentOrders.length > 0 ? (
                        <table className="w-full">
                            <thead className="bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            #{order._id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                                            ₹{order.totalPrice.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'Pending' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' :
                                                    order.status === 'Processing' ? 'bg-blue-900/50 text-blue-300 border border-blue-700' :
                                                        order.status === 'Shipped' ? 'bg-purple-900/50 text-purple-300 border border-purple-700' :
                                                            'bg-green-900/50 text-green-300 border border-green-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-gray-400">
                            No orders yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
