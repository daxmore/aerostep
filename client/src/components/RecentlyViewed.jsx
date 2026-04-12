import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RecentlyViewed = () => {
    const [recentProducts, setRecentProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            if (viewedIds.length === 0) {
                setLoading(false);
                return;
            }

            try {
                // Fetch details for these IDs
                // Using a loop or a specific endpoint if available
                const products = [];
                for (const id of viewedIds.slice(0, 4)) { // Limit to 4
                    try {
                        const res = await axios.get(`/api/products/${id}`);
                        products.push(res.data);
                    } catch (e) {
                        console.error(`Error fetching recent product ${id}:`, e);
                    }
                }
                setRecentProducts(products);
            } catch (err) {
                console.error('Error loading recently viewed products', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecent();
    }, []);

    if (loading || recentProducts.length === 0) return null;

    return (
        <section className="py-16 bg-gray-50">
            <div className="container-custom">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Recently Viewed</h2>
                        <p className="text-gray-500">Pick up where you left off.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {recentProducts.map((product) => (
                        <Link 
                            key={product._id} 
                            to={`/product/${product._id}`}
                            className="group bg-white rounded-xl p-4 border border-transparent hover:border-gray-200 transition-all shadow-sm flex flex-col items-center text-center"
                        >
                            <div className="aspect-square w-full relative mb-4 overflow-hidden rounded-lg bg-gray-50">
                                <img 
                                    src={product.images.primary} 
                                    alt={product.title} 
                                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <h3 className="font-bold text-sm mb-1 line-clamp-1 group-hover:text-[#0057FF] transition-colors">{product.title}</h3>
                            <p className="text-[#0057FF] font-bold text-sm">₹{product.price.toLocaleString('en-IN')}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentlyViewed;
