import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      // TODO: Replace with actual API call when auth is set up
      const response = await axios.get('http://localhost:5000/api/cart', {
        withCredentials: true,
      });
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Mock data for now
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(
        `http://localhost:5000/api/cart/${itemId}`,
        { quantity: newQuantity },
        { withCredentials: true }
      );
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${itemId}`, {
        withCredentials: true,
      });
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.productId?.price || 0) * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading cart...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] py-16">
        <div className="container-custom text-center">
          <h1 className="text-heading text-4xl font-bold text-[#111] mb-4">Your Cart is Empty</h1>
          <p className="text-gray-700 mb-8">Add some performance footwear to get started!</p>
          <Link to="/shop" className="btn-primary inline-flex">
            Shop Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4] py-12">
      <div className="container-custom">
        <h1 className="text-heading text-4xl lg:text-5xl font-bold text-[#111] mb-8">
          YOUR CART
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="bg-white rounded-[6px] p-6 shadow-sm">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="w-32 h-32 bg-[#F4F4F4] rounded-[6px] flex-shrink-0 overflow-hidden">
                    <img
                      src={item.productId?.images?.thumbnail || item.productId?.images?.primary}
                      alt={item.productId?.title}
                      className="w-full h-full object-contain p-3"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow">
                    <Link
                      to={`/product/${item.productId?._id}`}
                      className="text-heading text-xl font-bold text-[#111] hover:text-[#0057FF] transition-colors mb-2 block"
                    >
                      {item.productId?.title}
                    </Link>

                    {/* Size */}
                    {item.size && (
                      <div className="text-gray-700 font-medium mb-2">
                        Size: <span className="font-bold">{item.size}</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="text-2xl font-bold text-[#111] mb-4">
                      ₹{(item.productId?.price || 0).toLocaleString('en-IN')}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-10 h-10 bg-[#F4F4F4] rounded-[6px] font-bold hover:bg-gray-300 transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-xl font-bold w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-10 h-10 bg-[#F4F4F4] rounded-[6px] font-bold hover:bg-gray-300 transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-[#FF3131] hover:text-[#E02020] font-semibold flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#111]">
                      ₹{((item.productId?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Summary Card (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[6px] p-6 shadow-sm sticky top-24">
              <h2 className="text-heading text-2xl font-bold text-[#111] mb-6">
                ORDER SUMMARY
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-700 font-medium">Subtotal:</span>
                  <span className="font-bold text-[#111]">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-700 font-medium">Shipping:</span>
                  <span className="font-bold text-[#14C27A]">FREE</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-4 flex justify-between">
                  <span className="text-xl font-bold text-[#111]">Total:</span>
                  <span className="text-3xl font-bold text-[#111]">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <Link to="/checkout" className="btn-primary w-full">
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/shop"
                className="block text-center text-[#0057FF] font-semibold mt-4 hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
