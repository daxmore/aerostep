import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/brand_logo/aerostep_logo.jpg';
import { Search, ShoppingCart, User, Heart, X } from 'lucide-react';
import { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';

const AeroStepNavbar = () => {
    const { isAuthenticated, logout, cartItems, wishlist } = useContext(AuthContext);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    // Close search on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsSearchOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const cartCount = cartItems ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;
    const wishlistCount = wishlist ? wishlist.length : 0;

    return (
        <>
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <nav className="container-custom">
                    <div className="flex items-center justify-between h-[68px]">
                        <Link to="/" className="flex items-center">
                            <img 
                                src={logo} 
                                alt="AeroStep Logo" 
                                className="h-10 w-auto object-contain hover:opacity-80 transition-opacity"
                            />
                        </Link>

                        <div className="hidden md:flex items-center gap-8">
                            <Link to="/shop" className="text-[#0F1720] font-medium hover:text-[#0057FF] transition-colors">
                                Shop
                            </Link>
                            <Link to="/shop?category=Running" className="text-[#0F1720] font-medium hover:text-[#0057FF] transition-colors">
                                Running
                            </Link>
                            <Link to="/shop?category=Training" className="text-[#0F1720] font-medium hover:text-[#0057FF] transition-colors">
                                Training
                            </Link>
                            <Link to="/shop?category=Casual" className="text-[#0F1720] font-medium hover:text-[#0057FF] transition-colors">
                                Casual
                            </Link>
                            <Link to="/about" className="text-[#0F1720] font-medium hover:text-[#0057FF] transition-colors">
                                About
                            </Link>
                        </div>

                        <div className="flex items-center gap-5">
                            <button 
                                aria-label="Search" 
                                className="text-[#0F1720] hover:text-[#0057FF] transition-colors"
                                onClick={() => setIsSearchOpen(true)}
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            <Link to="/wishlist" className="relative group" aria-label="Wishlist">
                                <Heart className="w-5 h-5 text-[#0F1720] group-hover:text-[#0057FF] transition-colors" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            <Link to="/cart" className="relative" aria-label="Shopping cart">
                                <ShoppingCart className="w-5 h-5 text-[#0F1720] hover:text-[#0057FF] transition-colors" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-[#0057FF] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
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

            {/* Search Overlay */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 bg-[#0F1720]/90 backdrop-blur-sm animate-fade-in">
                    <button 
                        onClick={() => setIsSearchOpen(false)}
                        className="absolute top-8 right-8 text-white hover:text-gray-300 transition-colors"
                    >
                        <X className="w-10 h-10" />
                    </button>
                    
                    <div className="w-full max-w-4xl px-10">
                        <form onSubmit={handleSearch} className="relative">
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="Search for sneakers, series, categories..."
                                className="w-full bg-transparent border-0 border-b-2 border-white/20 pb-6 text-4xl lg:text-6xl text-white font-bold placeholder:text-white/20 focus:ring-0 focus:border-white transition-all outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="absolute right-0 bottom-8 text-white">
                                <Search className="w-10 h-10" />
                            </button>
                        </form>
                        <div className="mt-12 text-white/50">
                            <p className="text-sm font-bold uppercase tracking-[0.2em] mb-6">Popular Categories</p>
                            <div className="flex flex-wrap gap-4">
                                {['Running', 'Training', 'Basketball', 'Casual', 'Limited Edition'].map(cat => (
                                    <button 
                                        key={cat}
                                        onClick={() => {
                                            navigate(`/shop?category=${cat}`);
                                            setIsSearchOpen(false);
                                        }}
                                        className="px-6 py-2 border border-white/10 rounded-full hover:bg-white hover:text-[#0F1720] hover:border-white transition-all"
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AeroStepNavbar;
