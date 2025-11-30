import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, LogIn } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const AeroStepNavbar = () => {
    const { isAuthenticated, logout, cartItems } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const cartCount = cartItems ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <nav className="container-custom">
                <div className="flex items-center justify-between h-[68px]">
                    <Link to="/" className="text-heading text-3xl font-bold tracking-wide text-[#0F1720] brand-logo">
                        AEROSTEP
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/shop" className="text-[#0F1720] font-medium hover:text-[#0057FF] transition-colors">
                            Shop
                        </Link>
                        <Link to="/shop?category=Men" className="text-[#0F1720] font-medium hover:text-[#0057FF] transition-colors">
                            Men
                        </Link>
                        <Link to="/shop?category=Women" className="text-[#0F1720] font-medium hover:text-[#0057FF] transition-colors">
                            Women
                        </Link>
                        <Link to="/shop?tag=Running" className="text-[#0F1720] font-medium hover:text-[#0057FF] transition-colors">
                            Running
                        </Link>
                        <Link to="/shop?tag=Training" className="text-[#0F1720] font-medium hover:text-[#0057FF] transition-colors">
                            Training
                        </Link>
                    </div>

                    <div className="flex items-center gap-5">
                        <button aria-label="Search" className="text-[#0F1720] hover:text-[#0057FF] transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                        <Link to="/cart" className="relative" aria-label="Shopping cart">
                            <ShoppingCart className="w-5 h-5 text-[#0F1720] hover:text-[#0057FF] transition-colors" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-[#0057FF] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {isAuthenticated ? (
                            <div className="relative group">
                                <button
                                    className="flex items-center gap-2 focus:outline-none"
                                    aria-label="User menu"
                                >
                                    <User className="w-5 h-5 text-[#0F1720] hover:text-[#0057FF] transition-colors" />
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                                    <div className="px-4 py-2 border-b border-gray-50">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account</p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#0057FF] transition-colors"
                                    >
                                        My Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" aria-label="Login">
                                <User className="w-5 h-5 text-[#0F1720] hover:text-[#0057FF] transition-colors" />
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default AeroStepNavbar;
