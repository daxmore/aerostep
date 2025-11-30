import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const BrandMessage = () => {
    return (
        <section className="relative min-h-[500px] bg-gray-50 overflow-hidden flex items-center">
            {/* Background Image - Subtle */}
            <img
                src="/src/assets/images/product_images/hero (2).jpeg"
                alt="Brand story background"
                className="absolute inset-0 w-full h-full object-cover opacity-10"
            />

            <div className="relative z-10 container-custom px-12 lg:px-20 text-center">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-6">
                    Our Philosophy
                </div>

                <h2 className="text-heading text-5xl lg:text-6xl font-black text-[#0F1720] mb-8 max-w-3xl mx-auto leading-tight">
                    Performance is crafted, not claimed
                </h2>

                <Link
                    to="/about"
                    className="inline-flex items-center gap-3 bg-[#0F1720] text-white font-bold px-10 h-14 rounded-full hover:bg-[#2a3441] transition-colors uppercase tracking-wide text-sm"
                >
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </section>
    );
};

export default BrandMessage;
