import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';

const FeaturedCollection = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/products?featured=true');
                setProducts(response.data.slice(0, 3)); // Show 3 featured products
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, []);

    if (products.length === 0) return null;

    return (
        <section className="section-spacing bg-white">
            <div className="container-custom px-12 lg:px-20">
                {/* Section Header - Minimal */}
                <div className="mb-20">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">
                        Spotlight
                    </div>
                    <h2 className="text-heading text-5xl lg:text-6xl font-black text-[#0F1720]">
                        Featured Collection
                    </h2>
                </div>

                {/* Featured Products Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {products.map((product, index) => {
                        // Different gradient for each card
                        const gradients = [
                            'from-[#ffd4d4] to-[#ffc4c4]',
                            'from-[#c4d7ff] to-[#b4c7ff]',
                            'from-[#ffd4ff] to-[#ffc4ff]'
                        ];

                        return (
                            <Link
                                key={product._id}
                                to={`/product/${product._id}`}
                                className="group relative bg-white border border-gray-100 rounded-3xl overflow-hidden hover:border-gray-200 transition-all duration-300 hover:shadow-lg"
                            >
                                {/* Soft Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % 3]} opacity-30`}></div>

                                {/* Content */}
                                <div className="relative z-10 p-8">
                                    {/* Product Image - Large & Centered */}
                                    <div className="mb-6 flex justify-center">
                                        <img
                                            src={product.images?.primary || product.images?.thumbnail}
                                            alt={product.title}
                                            className="w-full max-w-[280px] h-[280px] object-contain transform group-hover:scale-105 transition-transform duration-500 drop-shadow-lg"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-[#0F1720] line-clamp-2">
                                            {product.title}
                                        </h3>

                                        {/* Price - Big & Bold */}
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="text-3xl font-black text-[#0F1720]">
                                                ₹{product.price?.toLocaleString('en-IN')}
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowRight className="w-5 h-5 text-[#0F1720]" />
                                            </div>
                                        </div>

                                        {/* Featured Badge */}
                                        <div className="pt-2">
                                            <span className="inline-block text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                                                Featured
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FeaturedCollection;
