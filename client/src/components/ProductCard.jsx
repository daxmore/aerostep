import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.wishlist) {
      setIsInWishlist(user.wishlist.includes(product._id));
    }
  }, [user, product._id]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      // Optional: Redirect to login or show toast
      alert('Please login to add to wishlist');
      return;
    }

    try {
      if (isInWishlist) {
        await axios.delete(`/api/users/wishlist/${product._id}`);
        setIsInWishlist(false);
      } else {
        await axios.post(`/api/users/wishlist/${product._id}`);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-3.5 h-3.5 ${index < Math.floor(rating)
          ? 'fill-[#0F1720] text-[#0F1720]'
          : 'text-gray-200'
          }`}
      />
    ));
  };

  const availableSizes = product.sizes?.filter(s => s.stock > 0) || [];

  return (
    <Link to={`/product/${product._id}`} className="group block h-full">
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 hover:shadow-lg transition-all duration-300 h-full flex flex-col relative">

        {/* Image Container */}
        <div className="relative bg-white aspect-[4/5] overflow-hidden flex items-center justify-center p-8">
          <img
            src={product.images?.thumbnail || product.images?.primary || '/placeholder-shoe.jpg'}
            alt={product.title}
            className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
          />

          {/* Wishlist Heart - Top Right */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 z-10"
          >
            <Heart
              className={`w-4 h-4 ${isInWishlist ? 'fill-[#FF3131] text-[#FF3131]' : 'text-[#0F1720]'
                }`}
            />
          </button>

          {/* Tags - Adjusted Positioning & Styling */}
          {product.tags && product.tags.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-white/90 backdrop-blur-sm border border-gray-100 text-[#0F1720] rounded-md shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Product Name */}
          <h3 className="text-base font-bold text-[#0F1720] line-clamp-2 mb-1 group-hover:text-[#0057FF] transition-colors">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex gap-0.5">{renderStars(product.averageRating || 0)}</div>
            <span className="text-xs text-gray-400 font-medium">
              ({product.numReviews || 0})
            </span>
          </div>

          <div className="mt-auto flex items-center justify-between">
            {/* Price */}
            <div className="text-lg font-black text-[#0F1720]">
              ₹{product.price?.toLocaleString('en-IN') || '0'}
            </div>

            {/* Size Count Badge (Subtle) */}
            {availableSizes.length > 0 && (
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {availableSizes.length} Sizes
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
