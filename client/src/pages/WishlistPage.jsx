import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const WishlistPage = () => {
    const { isAuthenticated, wishlist, addToCart, removeFromWishlist, getWishlist } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            if (isAuthenticated) {
                await getWishlist();
            }
            setLoading(false);
        };
        fetchWishlist();
    }, [isAuthenticated, getWishlist]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0057FF]"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="container-custom py-20 text-center">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-4">Your Wishlist</h1>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Please login to see and manage your wishlist items.
                </p>
                <Link to="/login" className="btn-primary w-fit mx-auto px-10">
                    Login Now
                </Link>
            </div>
        );
    }

    if (!wishlist || wishlist.length === 0) {
        return (
            <div className="container-custom py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-10 h-10 text-gray-300" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Keep track of items you love by adding them to your wishlist.
                </p>
                <Link to="/shop" className="btn-primary w-fit mx-auto px-10">
                    Explore Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="container-custom py-12 lg:py-20">
            <div className="flex items-center gap-4 mb-10">
                <Heart className="w-8 h-8 text-[#0057FF]" fill="#0057FF" />
                <h1 className="text-4xl font-bold tracking-tight">My Wishlist</h1>
                <span className="text-gray-400 font-medium ml-2">({wishlist.length} items)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {wishlist.map((product) => (
                    <div key={product._id} className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white">
                        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                            <Link to={`/product/${product._id}`}>
                                <img
                                    src={product.images.primary}
                                    alt={product.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </Link>
                            <button
                                onClick={() => removeFromWishlist(product._id)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-colors"
                                title="Remove from wishlist"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="text-xs font-bold text-[#0057FF] uppercase tracking-wider mb-2">
                                {product.category}
                            </div>
                            <Link to={`/product/${product._id}`}>
                                <h3 className="font-bold text-lg mb-2 group-hover:text-[#0057FF] transition-colors line-clamp-1">
                                    {product.title}
                                </h3>
                            </Link>
                            <div className="text-xl font-bold text-gray-900 mb-6">
                                ₹{product.price.toLocaleString('en-IN')}
                            </div>

                            <button
                                onClick={() => addToCart(product._id, product.sizes[0]?.size, 1)}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-[#0F1720] text-white font-bold rounded-xl hover:bg-[#0057FF] transition-all duration-300"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WishlistPage;
