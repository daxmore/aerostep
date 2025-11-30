const AuthLayout = ({ children, visual, reverse = false }) => {
    return (
        <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-4">
            <div className="w-full max-w-6xl bg-white rounded-3xl shadow-[0_12px_30px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className={`grid lg:grid-cols-2 ${reverse ? 'lg:grid-flow-col-dense' : ''}`}>
                    {/* Visual Panel */}
                    <div className={`hidden lg:block relative overflow-hidden ${reverse ? 'lg:col-start-2 rounded-r-3xl' : 'rounded-l-3xl'}`}>
                        <img
                            src={visual}
                            alt="AeroStep Brand Visual"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20" />
                        <div className="absolute top-10 left-10 text-white">
                            <h2 className="text-heading text-2xl font-bold tracking-wide mb-2">
                                AEROSTEP
                            </h2>
                            <p className="text-white/90 text-sm font-medium">
                                Built for speed. Crafted for comfort.
                            </p>
                        </div>
                    </div>

                    {/* Form Panel */}
                    <div className={`p-10 lg:p-12 ${reverse ? 'lg:col-start-1 rounded-l-3xl' : 'rounded-r-3xl'}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
