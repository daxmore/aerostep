import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const SubscribeStrip = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Add newsletter subscription logic
        console.log('Subscribe:', email);
        setEmail('');
    };

    return (
        <section className="bg-white border-t border-gray-100">
            <div className="container-custom px-12 lg:px-20 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">
                        Newsletter
                    </div>

                    <h3 className="text-heading text-4xl lg:text-5xl font-black text-[#0F1720] mb-8">
                        Stay in the loop
                    </h3>

                    <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
                        Get exclusive offers and updates straight to your inbox
                    </p>

                    <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="flex-1 h-14 px-6 rounded-full border-2 border-gray-200 focus:border-[#0F1720] focus:outline-none transition-colors font-medium text-[#0F1720] bg-white"
                        />
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-2 bg-[#0F1720] text-white font-bold px-8 h-14 rounded-full hover:bg-[#2a3441] transition-colors"
                        >
                            <span>Subscribe</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default SubscribeStrip;
