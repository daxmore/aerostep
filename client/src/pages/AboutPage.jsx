import React from 'react';

const AboutPage = () => {
    return (
        <div className="container-custom py-20">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl lg:text-7xl font-bold mb-12 tracking-tighter leading-none">Engineering the Perfect Step.</h1>
                <p className="text-2xl text-gray-500 mb-16 leading-relaxed">
                    AeroStep was born from a simple obsession: why should high-performance gear compromise on daily style? 
                    We craft footwear for the dreamers, the athletes, and the everyday explorers.
                </p>

                <div className="grid md:grid-cols-2 gap-12 mb-24">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold">Our Philosophy</h2>
                        <p className="text-gray-500 leading-relaxed">
                            We believe in technology that moves with you. Every AeroStep sneaker is a fusion of advanced kinetics and contemporary aesthetics. 
                            From the street to the track, we ensure your feet are supported by the best engineering available today.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold">Sustainability</h2>
                        <p className="text-gray-500 leading-relaxed">
                            Walking towards a better future means leaving a smaller footprint. We're committed to using recycled materials and ethical manufacturing processes in every pair we create.
                        </p>
                    </div>
                </div>

                <div className="bg-[#0F1720] rounded-[2rem] p-12 lg:p-20 text-white text-center">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-8">Ready to step up?</h2>
                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                        Join thousands of AeroStep enthusiasts who have discovered what it feels like to walk on air.
                    </p>
                    <button className="bg-[#0057FF] text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-blue-600 transition-all">
                        Explore the Collection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
