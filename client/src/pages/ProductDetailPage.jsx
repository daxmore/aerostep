import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, ShoppingCart, Star, Check } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import Modal from '../components/Modal';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, fetchCart, user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'Okay',
    cancelText: 'Cancel'
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(response.data);
        if (response.data.images?.primary) {
          setSelectedImage(0);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (user && user.wishlist && product) {
      setIsInWishlist(user.wishlist.includes(product._id));
    }
  }, [user, product]);


  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setModal({
        isOpen: true,
        title: 'Login Required',
        message: 'Please login to add items to your cart.',
        type: 'info',
        confirmText: 'Login',
        onConfirm: () => navigate('/login')
      });
      return;
    }

    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      setModal({
        isOpen: true,
        title: 'Select Size',
        message: 'Please select a size before adding to cart.',
        type: 'danger'
      });
      return;
    }

    try {
      await axios.post('/api/cart', {
        productId: id,
        size: selectedSize,
        quantity
      });
      fetchCart(); // Update cart count in navbar
      setModal({
        isOpen: true,
        title: 'Success',
        message: 'Added to cart successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      setModal({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.msg || 'Failed to add to cart',
        type: 'danger'
      });
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      setModal({
        isOpen: true,
        title: 'Login Required',
        message: 'Please login to use the wishlist.',
        type: 'info',
        confirmText: 'Login',
        onConfirm: () => navigate('/login')
      });
      return;
    }

    try {
      if (isInWishlist) {
        await axios.delete(`/api/users/wishlist/${id}`);
        setIsInWishlist(false);
      } else {
        await axios.post(`/api/users/wishlist/${id}`);
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
        className={`w-5 h-5 ${index < Math.floor(rating)
          ? 'fill-[#0F1720] text-[#0F1720]'
          : 'text-gray-200'
          }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Product not found</div>
      </div>
    );
  }

  const galleryImages = product.images?.gallery || [product.images?.primary];

  return (
    <div className="bg-white min-h-screen">
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
      />
      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-[#F4F4F4] rounded-[6px] aspect-square overflow-hidden">
              <img
                src={galleryImages[selectedImage] || product.images?.primary}
                alt={product.title}
                className="w-full h-full object-contain p-8"
              />
            </div>

            {/* Thumbnail Gallery */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {galleryImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`bg-[#F4F4F4] rounded-[6px] aspect-square overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-[#0057FF]' : 'border-transparent'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} view ${index + 1}`}
                      className="w-full h-full object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 text-xs font-bold rounded-[4px] ${tag === 'New Arrival'
                      ? 'bg-[#0057FF] text-white'
                      : tag === 'Best Seller'
                        ? 'bg-[#14C27A] text-white'
                        : 'bg-[#FF3131] text-white'
                      }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-heading text-4xl lg:text-5xl font-bold text-[#111]">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">{renderStars(product.averageRating || 0)}</div>
              <span className="text-gray-700 font-semibold">
                {product.averageRating?.toFixed(1) || '0.0'} ({product.numReviews || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="text-5xl font-bold text-[#111]">
              ₹{product.price?.toLocaleString('en-IN')}
            </div>

            {/* Description */}
            <p className="text-lg text-gray-700 leading-relaxed">
              {product.description}
            </p>

            {/* Microcopy */}
            <div className="bg-[#F4F4F4] rounded-[6px] p-4">
              <p className="text-sm font-semibold text-gray-800">
                Designed for endurance and maximum comfort.
              </p>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="font-bold text-[#111]">Select Size:</div>
                <div className="grid grid-cols-7 gap-2">
                  {product.sizes.map((sizeObj) => (
                    <button
                      key={sizeObj.size}
                      onClick={() => setSelectedSize(sizeObj.size)}
                      disabled={sizeObj.stock === 0}
                      className={`h-12 rounded-[6px] font-bold border-2 transition-all ${sizeObj.stock === 0
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                        : selectedSize === sizeObj.size
                          ? 'bg-[#0057FF] text-white border-[#0057FF]'
                          : 'bg-white text-[#111] border-gray-300 hover:border-[#0057FF]'
                        }`}
                    >
                      {sizeObj.size}
                      {sizeObj.stock > 0 && sizeObj.stock < 5 && (
                        <div className="text-[10px] font-normal">
                          {sizeObj.stock} left
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <div className="font-bold text-[#111]">Quantity:</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-white border-2 border-gray-300 rounded-[6px] font-bold hover:border-[#0057FF] transition-colors"
                >
                  −
                </button>
                <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 bg-white border-2 border-gray-300 rounded-[6px] font-bold hover:border-[#0057FF] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button onClick={handleAddToCart} className="btn-primary w-full">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleAddToWishlist}
                className={`w-full flex items-center justify-center gap-2 font-semibold h-14 px-6 rounded-md transition-all duration-200 uppercase text-sm tracking-wide ${isInWishlist
                  ? 'bg-[#FF3131] text-white hover:bg-[#E02020]'
                  : 'border-2 border-[#0057FF] text-[#0057FF] hover:bg-[#0057FF] hover:text-white'
                  }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t-2 border-gray-200">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#14C27A] flex-shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-[#111]">Free Shipping</div>
                  <div className="text-sm text-gray-600">On orders over ₹2,000</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#14C27A] flex-shrink-0 mt-1" />
                <div>
                  <div className="font-bold text-[#111]">Easy Returns</div>
                  <div className="text-sm text-gray-600">30-day return policy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
