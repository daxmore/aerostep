import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const AeroStepHero = () => {
    return (
        <section className="relative bg-white min-h-screen flex items-center overflow-hidden">
            {/* Soft Gradient Background Panel */}
            <div className="absolute right-0 top-0 bottom-0 w-[45%] bg-gradient-to-br from-[#ffd4d4] via-[#c4d7ff] to-[#ffd4ff] opacity-40"></div>

            <div className="container-custom relative z-10 px-12 lg:px-2">
                <div className="grid lg:grid-cols-2 gap-20 items-center max-w-[1400px] mx-auto">
                    {/* Left: Text Content */}
                    <div className="space-y-6">
                        {/* Category Label */}
                        <div className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em]">
                            Next Gen Performance
                        </div>

                        {/* Product Name - MASSIVE Typography */}
                        <h1 className="brand-logo text-[clamp(3.5rem,5vw,8rem)] font-black leading-[0.95] tracking-tight text-[#0F1720]">
                            Velocity X
                        </h1>

                        {/* Description */}
                        <p className="text-[clamp(1rem,2vw,1.25rem)] text-gray-600 max-w-md leading-relaxed font-normal">
                            Engineered for those who refuse to settle. The Velocity X combines ultra-lightweight materials with reactive cushioning to propel you forward with every stride.
                        </p>

                        {/* CTA Button - Clean & Bold */}
                        <div className="pt-4">
                            <Link
                                to="/shop"
                                className="inline-flex items-center justify-center gap-3 bg-[#0F1720] text-white font-bold text-base px-10 h-14 rounded-full hover:bg-[#2a3441] transition-all duration-300 shadow-lg hover:shadow-xl uppercase tracking-wide"
                            >
                                Shop The Drop
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Right: Shoe Visual */}
                    <div className="relative flex items-center justify-center lg:justify-end">
                        {/* Gradient Backdrop - Softer Colors */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[600px] h-[600px] bg-gradient-to-br from-[#ffd4d4]/50 via-[#c4d7ff]/50 to-[#ffd4ff]/50 rounded-3xl blur-3xl"></div>
                        </div>

                        {/* Main Shoe Image - LARGE */}
                        <div className="relative z-10">
                            <img
                                src="/src/assets/images/product_images/hero (1).jpeg"
                                alt="Velocity X Performance Shoe"
                                className="w-full max-w-[650px] drop-shadow-[0_25px_50px_rgba(0,0,0,0.15)] transform transition-transform duration-500"
                            />
                        </div>

                        {/* Minimal Accent Element */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#0057FF]/10 rounded-full blur-2xl"></div>
                    </div>
                </div>
            </div>

            {/* Vertical Text - FREE SHIPPING */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
                <div className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase" style={{ writingMode: 'vertical-rl' }}>
                    FREE SHIPPING
                </div>
            </div>
        </section>
    );
};

export default AeroStepHero;
