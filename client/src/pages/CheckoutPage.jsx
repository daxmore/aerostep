import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, MapPin, Check } from 'lucide-react';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const fetchCheckoutData = async () => {
    try {
      const [cartRes, addressRes] = await Promise.all([
        axios.get('http://localhost:5000/api/cart', { withCredentials: true }),
        axios.get('http://localhost:5000/api/users/addresses', { withCredentials: true }),
      ]);
      setCartItems(cartRes.data);
      setAddresses(addressRes.data);

      // Select default address if available
      const defaultAddr = addressRes.data.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr._id);
      }
    } catch (error) {
      console.error('Error fetching checkout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.productId?.price || 0) * item.quantity;
    }, 0);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!selectedAddress && !formData.fullName) {
      alert('Please fill in shipping details');
      return;
    }

    try {
      // If using saved address
      if (selectedAddress) {
        await axios.post(
          'http://localhost:5000/api/orders',
          { addressId: selectedAddress },
          { withCredentials: true }
        );
      } else {
        // Create new address and order
        const addrRes = await axios.post(
          'http://localhost:5000/api/users/addresses',
          formData,
          { withCredentials: true }
        );
        // The server returns the full addresses array. Use the newly added address (last item).
        const addressesArray = Array.isArray(addrRes.data) ? addrRes.data : [];
        const newAddress = addressesArray[addressesArray.length - 1];
        const newAddressId = newAddress?._id;
        await axios.post(
          'http://localhost:5000/api/orders',
          { addressId: newAddressId },
          { withCredentials: true }
        );
      }

      alert('Order placed successfully!');
      navigate('/profile');
    } catch (error) {
      // Prefer backend message when available
      const serverMsg = error.response?.data?.msg || error.response?.data?.message;
      console.error('Error placing order:', error, 'serverMsg:', serverMsg);
      alert(serverMsg || 'Failed to place order');
    }
  };

  const subtotal = calculateSubtotal();
  const shipping = 0;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4] py-12">
      <div className="container-custom">
        <h1 className="text-heading text-4xl lg:text-5xl font-bold text-[#111] mb-8">
          CHECKOUT
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Addresses */}
            {addresses.length > 0 && (
              <div className="bg-white rounded-[6px] p-6">
                <h2 className="text-heading text-2xl font-bold text-[#111] mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  Saved Addresses
                </h2>
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <button
                      key={addr._id}
                      onClick={() => setSelectedAddress(addr._id)}
                      className={`w-full text-left p-4 rounded-[6px] border-2 transition-all ${selectedAddress === addr._id
                          ? 'border-[#0057FF] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-[#111]">{addr.fullName}</div>
                          <div className="text-sm text-gray-700 mt-1">
                            {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{addr.phone}</div>
                        </div>
                        {selectedAddress === addr._id && (
                          <Check className="w-5 h-5 text-[#0057FF]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSelectedAddress(null)}
                  className="mt-4 text-[#0057FF] font-semibold hover:underline"
                >
                  + Add New Address
                </button>
              </div>
            )}

            {/* New Address Form */}
            {(!addresses.length || !selectedAddress) && (
              <form onSubmit={handlePlaceOrder} className="bg-white rounded-[6px] p-6 space-y-4">
                <h2 className="text-heading text-2xl font-bold text-[#111] mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  Shipping Address
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#111] mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#111] mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#111] mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="House no., Building name, Street"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#111] mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#111] mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#111] mb-2">
                      Pin Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      maxLength="6"
                      className="input-field"
                      placeholder="6-digit PIN"
                    />
                  </div>
                </div>
              </form>
            )}

            {/* Payment Info */}
            <div className="bg-white rounded-[6px] p-6">
              <h2 className="text-heading text-2xl font-bold text-[#111] mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Payment Method
              </h2>
              <div className="bg-[#F4F4F4] rounded-[6px] p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#0057FF] rounded-[6px] flex items-center justify-center">
                    <span className="text-2xl">💳</span>
                  </div>
                  <div>
                    <div className="font-bold text-[#111]">Demo Payment</div>
                    <div className="text-sm text-gray-600">
                      For demonstration purposes only
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[6px] p-6 shadow-sm sticky top-24">
              <h2 className="text-heading text-2xl font-bold text-[#111] mb-6">
                ORDER SUMMARY
              </h2>

              {/* Products */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <div className="w-16 h-16 bg-[#F4F4F4] rounded-[6px] flex-shrink-0">
                      <img
                        src={item.productId?.images?.thumbnail}
                        alt={item.productId?.title}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="font-semibold text-sm text-[#111] line-clamp-2">
                        {item.productId?.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        Size: {item.size} × {item.quantity}
                      </div>
                      <div className="font-bold text-sm text-[#111]">
                        ₹{((item.productId?.price || 0) * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t-2 border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Subtotal:</span>
                  <span className="font-bold text-[#111]">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Shipping:</span>
                  <span className="font-bold text-[#14C27A]">FREE</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-3 flex justify-between">
                  <span className="text-xl font-bold text-[#111]">Total:</span>
                  <span className="text-3xl font-bold text-[#111]">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button onClick={handlePlaceOrder} className="btn-primary w-full mt-6">
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
