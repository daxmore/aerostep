import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Package } from 'lucide-react';

const LowStockPage = () => {
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLowStockProducts();
    }, []);

    const fetchLowStockProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/products');
            const products = await response.json();

            // Filter products with stock <= 10
            const lowStock = products.filter(product => {
                const totalStock = product.sizes?.reduce((sum, size) => sum + size.stock, 0) || 0;
                return totalStock <= 10;
            }).map(product => ({
                ...product,
                totalStock: product.sizes?.reduce((sum, size) => sum + size.stock, 0) || 0
            }));

            // Sort by stock level (lowest first)
            lowStock.sort((a, b) => a.totalStock - b.totalStock);

            setLowStockProducts(lowStock);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching low stock products:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-gray-500 font-body">Loading low stock products...</div>;
    }

    return (
        <div className="space-y-6 font-body">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-aero-text mb-2 flex items-center gap-3 font-heading">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                        Low Stock Alert
                    </h1>
                    <p className="text-gray-500">Products with 10 or fewer units in stock</p>
                </div>
                <div className="text-right">
                    <p className="text-4xl font-bold text-red-500">{lowStockProducts.length}</p>
                    <p className="text-gray-500 text-sm">Items need attention</p>
                </div>
            </div>

            {/* Low Stock Products Table */}
            <div className="bg-aero-surface rounded-xl border border-red-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    {lowStockProducts.length > 0 ? (
                        <table className="w-full">
                            <thead className="bg-red-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Image</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Size Breakdown</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-red-800 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lowStockProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-red-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <img
                                                src={product.images?.primary || product.images?.thumbnail}
                                                alt={product.title}
                                                className="w-12 h-12 object-cover rounded bg-gray-200"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-aero-text font-medium">{product.title}</td>
                                        <td className="px-6 py-4 text-gray-600">{product.category}</td>
                                        <td className="px-6 py-4 text-gray-600">₹{product.price.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded text-xs font-bold ${product.totalStock === 0 ? 'bg-red-100 text-red-700 border border-red-200' :
                                                product.totalStock <= 3 ? 'bg-red-50 text-red-600 border border-red-100' :
                                                    product.totalStock <= 6 ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                                        'bg-yellow-50 text-yellow-600 border border-yellow-100'
                                                }`}>
                                                {product.totalStock} units
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {product.sizes?.map((size) => (
                                                    <span key={size.size} className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                        {size.size}: {size.stock}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end">
                                                <Link
                                                    to={`/admin/products/${product._id}/edit`}
                                                    className="px-3 py-2 bg-aero-primary hover:bg-blue-700 rounded text-sm transition-colors text-white shadow-lg shadow-blue-500/20"
                                                >
                                                    Restock
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No low stock items!</p>
                            <p className="text-gray-400 text-sm">All products have sufficient inventory</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LowStockPage;
