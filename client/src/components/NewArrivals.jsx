import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ArrowRight } from 'lucide-react';

const NewArrivals = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/products?tags=New%20Arrival');
                setProducts(response.data.slice(0, 4));
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, []);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                className={`w-3.5 h-3.5 ${index < Math.floor(rating) ? 'fill-[#0F1720] text-[#0F1720]' : 'text-gray-200'
                    }`}
            />
        ));
    };

    return (
        <section className="section-spacing bg-white">
            <div className="container-custom px-12 lg:px-20">
                {/* Section Header - Minimal */}
                <div className="flex items-start justify-between mb-16">
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">
                            Latest Drops
                        </div>
                        <h2 className="text-heading text-5xl lg:text-6xl font-black text-[#0F1720]">
                            New Arrivals
                        </h2>
                    </div>
                    <Link
                        to="/shop?tag=New%20Arrival"
                        className="hidden lg:flex items-center gap-2 text-[#0F1720] font-bold text-sm hover:gap-3 transition-all mt-10"
                    >
                        <span className="uppercase tracking-wide">View All</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link
                            key={product._id}
                            to={`/product/${product._id}`}
                            className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 transition-all duration-300 hover:shadow-md"
                        >
                            {/* Image Container - Clean */}
                            <div className="bg-gray-50 aspect-square overflow-hidden">
                                <img
                                    src={product.images?.primary || product.images?.thumbnail}
                                    alt={product.title}
                                    className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            {/* Product Info - Minimal */}
                            <div className="p-5 space-y-3">
                                <h3 className="text-base font-bold text-[#0F1720] line-clamp-2 min-h-[48px]">
                                    {product.title}
                                </h3>

                                {/* Rating - Subtle */}
                                <div className="flex items-center gap-1.5">
                                    <div className="flex gap-0.5">{renderStars(product.averageRating || 4)}</div>
                                    <span className="text-xs text-gray-400 font-medium">
                                        {product.averageRating || 4.0}
                                    </span>
                                </div>

                                {/* Price - Bold */}
                                <div className="flex items-center justify-between pt-1">
                                    <div className="text-xl font-black text-[#0F1720]">
                                        ₹{product.price?.toLocaleString('en-IN')}
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="w-4 h-4 text-[#0F1720]" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Mobile \"View All\" Button */}
                <div className="lg:hidden mt-10 text-center">
                    <Link
                        to="/shop?tag=New%20Arrival"
                        className="inline-flex items-center gap-3 bg-[#0F1720] text-white font-bold px-10 h-14 rounded-full hover:bg-[#2a3441] transition-colors uppercase tracking-wide text-sm"
                    >
                        <span>View All</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default NewArrivals;
