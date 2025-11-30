import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const EditorialGrid = () => {
    return (
        <section className="section-spacing bg-white">
            <div className="container-custom px-12 lg:px-20">
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Large Image - Left */}
                    <div className="group rounded-3xl overflow-hidden h-[480px] relative border border-gray-100 hover:border-gray-200 transition-all duration-300">
                        <img
                            src="/src/assets/images/product_images/gray shoe with model (2).jpeg"
                            alt="Editorial lifestyle shot"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>

                    {/* Text Card - Right */}
                    <div className="group bg-gray-50 rounded-3xl p-12 flex flex-col justify-center hover:bg-gray-100 transition-colors duration-300">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-6">
                            Our Story
                        </div>

                        <h2 className="text-heading text-4xl lg:text-5xl font-black text-[#0F1720] mb-6 leading-tight">
                            Built by Athletes
                        </h2>

                        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                            Every step tells a story. Discover the journey behind AeroStep and how we're redefining performance footwear.
                        </p>

                        <Link
                            to="/about"
                            className="inline-flex items-center gap-2 text-[#0F1720] font-bold text-sm hover:gap-3 transition-all uppercase tracking-wide"
                        >
                            <span>Read More</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Text Card - Left */}
                    <div className="group bg-[#0F1720] text-white rounded-3xl p-12 flex flex-col justify-center hover:bg-[#1a2332] transition-colors duration-300">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-6">
                            Performance
                        </div>

                        <h3 className="text-heading text-4xl lg:text-5xl font-black mb-6 leading-tight">
                            Elevate Your Game
                        </h3>

                        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                            Premium designs crafted for urban athletes who demand both style and performance.
                        </p>

                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 text-white font-bold text-sm hover:gap-3 transition-all uppercase tracking-wide"
                        >
                            <span>Shop Now</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Large Image - Right */}
                    <div className="group rounded-3xl overflow-hidden h-[480px] relative border border-gray-100 hover:border-gray-200 transition-all duration-300">
                        <img
                            src="/src/assets/images/product_images/purple shoe (3).jpeg"
                            alt="Product showcase"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EditorialGrid;
