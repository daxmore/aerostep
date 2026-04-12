import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SaleBanner = () => {
    const [activeSales, setActiveSales] = useState([]);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const res = await axios.get('/api/products/active-deals');
                setActiveSales(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSales();
    }, []);

    if (activeSales.length === 0) return null;

    const mainSale = activeSales[0];

    return (
        <div className="bg-[#FF3131] py-3 overflow-hidden relative group">
            <div className="container-custom flex items-center justify-center gap-6 text-white overflow-hidden whitespace-nowrap">
                <div className="flex items-center gap-2 animate-pulse">
                    <Sparkles className="w-5 h-5 fill-white" />
                    <span className="font-black uppercase tracking-[0.2em] text-sm md:text-base">
                        {mainSale.name}: UP TO {mainSale.discountPercentage}% OFF STOREWIDE
                    </span>
                </div>
                
                <Link 
                    to="/shop" 
                    className="hidden md:flex items-center gap-2 bg-white text-[#FF3131] px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all"
                >
                    Shop Now <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            {/* Scrolling duplicates for a ticker effect on small screens */}
            <div className="flex md:hidden absolute inset-0 items-center animate-scroll">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className="mx-8 font-black uppercase text-xs text-white">
                        {mainSale.name} - {mainSale.discountPercentage}% OFF
                    </span>
                ))}
            </div>
        </div>
    );
};

export default SaleBanner;
