import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
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
                totalProducts: products.length,
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-400 font-body">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-body">
            <h1 className="text-3xl font-bold text-aero-text mb-8 font-heading">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-aero-surface p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <DollarSign className="w-6 h-6 text-aero-primary" />
                        </div>
                        <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> +12.5%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Sales</h3>
                    <p className="text-2xl font-bold text-aero-text mt-1">₹{stats.totalSales.toLocaleString()}</p>
                </div>

                <div className="bg-aero-surface p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                            <ShoppingBag className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> +8.2%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                    <p className="text-2xl font-bold text-aero-text mt-1">{stats.totalOrders}</p>
                </div>

                <div className="bg-aero-surface p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                            <Users className="w-6 h-6 text-orange-600" />
                        </div>
                        <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> +24.3%
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                    <p className="text-2xl font-bold text-aero-text mt-1">{stats.totalUsers}</p>
                </div>

                <div className="bg-aero-surface p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-pink-50 rounded-lg group-hover:bg-pink-100 transition-colors">
                            <Package className="w-6 h-6 text-pink-600" />
                        </div>
                        <span className="text-gray-500 text-sm font-medium">
                            {stats.totalProducts} Active
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
                    <p className="text-2xl font-bold text-aero-text mt-1">{stats.totalProducts}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-aero-surface rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-aero-text mb-4 font-heading">Recent Orders</h2>
                    <div className="space-y-4">
                        {recentOrders.map((order) => (
                            <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <ShoppingBag className="w-5 h-5 text-aero-primary" />
                                    </div>
                                    <div>
                                        <p className="text-aero-text font-medium">Order #{order._id.slice(-6)}</p>
                                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-aero-text font-bold">₹{order.totalPrice.toLocaleString()}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                        order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {recentOrders.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No recent orders</p>
                        )}
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-aero-surface rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-aero-text font-heading">Low Stock Alert</h2>
                        <span className="px-2 py-1 bg-red-50 text-aero-accent rounded text-xs font-bold border border-red-100">
                            {lowStockProducts.length} Items
                        </span>
                    </div>
                    <div className="space-y-4">
                        {lowStockProducts.map((product) => (
                            <div key={product._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
                                <img
                                    src={product.images.thumbnail}
                                    alt={product.title}
                                    className="w-12 h-12 rounded-lg object-cover bg-gray-200"
                                />
                                <div className="flex-1">
                                    <h3 className="text-aero-text font-medium truncate">{product.title}</h3>
                                    <p className="text-sm text-gray-500">
                                        Stock: <span className="text-aero-accent font-bold">{product.totalStock}</span>
                                    </p>
                                </div>
                                <Link to={`/admin/products/${product._id}`} className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-400 hover:text-aero-text">
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>
                        ))}
                        {lowStockProducts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                <Package className="w-12 h-12 mb-2 opacity-20" />
                                <p>No low stock items</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
