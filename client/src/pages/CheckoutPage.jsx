import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, MapPin, Check, Ticket, X, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51TLMFQRsdIgeqWoKlsYkBxW7pD6Pxmm6X7OAvdDH49tmTNluX0x67CIeqjbhBvgN734GsOgPkLcNOEpdczQ9Bj2400h25g4p9s');

const CheckoutPage = () => {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutContent />
        </Elements>
    );
};

const CheckoutContent = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

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

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;

    try {
      setCouponError('');
      const subtotal = calculateSubtotal();
      const { data } = await axios.get(`http://localhost:5000/api/coupons/validate/${couponInput}?amount=${subtotal}`, { withCredentials: true });
      setAppliedCoupon(data);
      alert('Coupon applied successfully!');
    } catch (error) {
      setCouponError(error.response?.data?.msg || 'Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();

    if (!selectedAddress && !formData.fullName) {
      alert('Please fill in shipping details');
      return;
    }

    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      let addressId = selectedAddress;

      // If no selected address, create new one
      if (!addressId) {
        const addrRes = await axios.post(
          'http://localhost:5000/api/users/addresses',
          formData,
          { withCredentials: true }
        );
        const addressesArray = Array.isArray(addrRes.data) ? addrRes.data : [];
        const newAddress = addressesArray[addressesArray.length - 1];
        addressId = newAddress?._id;
      }
      if (!addressId) {
        setProcessing(false);
        return alert('Please select or provide a shipping address.');
      }

      // 1. Create Order and Get PaymentIntent clientSecret
      const { data } = await axios.post(
        'http://localhost:5000/api/orders',
        { addressId, couponCode: appliedCoupon?.code },
        { withCredentials: true }
      );

      const clientSecret = data.clientSecret;

      // 2. Confirm Payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        console.error(result.error.message);
        alert(result.error.message);
        setProcessing(false);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          // Stripe webhook will actually confirm the order in DB, 
          // but we can redirect now.
          alert('Payment Successful!');
          navigate('/order-success/' + result.paymentIntent.id);
        }
      }
    } catch (error) {
      const serverMsg = error.response?.data?.msg || error.response?.data?.message;
      console.error('Error in checkout:', error);
      alert(serverMsg || 'Checkout failed');
      setProcessing(false);
    }
  };

  const subtotal = calculateSubtotal();
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discountAmount) / 100;
    } else {
      discountAmount = appliedCoupon.discountAmount;
    }
  }
  const shipping = 0;
  const total = subtotal - discountAmount + shipping;

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
              <h2 className="text-heading text-2xl font-bold text-[#111] mb-6 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Secure Payment
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <Lock className="w-3 h-3" /> Encrypted Card Details
                </div>

                <div className="p-4 border-2 border-gray-100 rounded-[6px] bg-gray-50">
                   <CardElement 
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#111',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                          invalid: {
                            color: '#fa755a',
                          },
                        },
                      }}
                   />
                </div>
                
                <div className="flex items-center gap-6 opacity-80">
                    <div className="h-6">
                      <svg width="60" height="20" viewBox="0 0 1336 430" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Visa Home"><path fill="#1434CB" d="M507.369 7.60031L332.588 423.495H218.557L132.547 91.592C127.325 71.1489 122.785 63.6595 106.904 55.0468C80.9894 41.0181 38.172 27.8632 0.5 19.6942L3.05875 7.60031H186.614C210.012 7.60031 231.045 23.1338 236.357 50.0053L281.782 290.663L394.047 7.60031H507.369ZM954.17 287.709C954.629 177.942 801.98 171.895 803.03 122.86C803.356 107.937 817.603 92.0705 848.788 88.0207C864.245 86.0028 906.833 84.4633 955.136 106.633L974.083 18.4391C948.127 9.0427 914.732 0 873.18 0C766.554 0 691.515 56.5308 690.883 137.478C690.194 197.351 744.443 230.762 785.313 250.658C827.359 271.031 841.466 284.124 841.307 302.348C841.008 330.246 807.772 342.562 776.712 343.047C722.492 343.879 691.029 328.415 665.949 316.786L646.397 407.899C671.602 419.432 718.125 429.494 766.359 430C879.688 430 953.822 374.17 954.17 287.709ZM1235.73 423.502H1335.5L1248.41 7.60031H1156.32C1135.62 7.60031 1118.15 19.6249 1110.42 38.1125L948.545 423.495H1061.82L1084.31 361.368H1222.71L1235.74 423.495L1235.73 423.502ZM1115.36 276.135L1172.14 119.982L1204.82 276.135H1115.37H1115.36ZM661.506 7.60031L572.304 423.495H464.433L553.67 7.60031H661.506Z"></path></svg>
                    </div>
                    <div className="h-6">
                      <svg width="41" height="26" viewBox="0 0 41 26" xmlns="http://www.w3.org/2000/svg">
                          <g fill="none" fillRule="evenodd">
                              <rect fill="#F16022" x="14.856" y="3.205" width="10.974" height="19.72"></rect>
                              <path d="M15.552 13.066c0-4.001 1.873-7.564 4.79-9.86-2.133-1.68-4.825-2.682-7.75-2.682-6.926 0-12.54 5.615-12.54 13.065 0 6.927 5.614 12.542 12.54 12.542 2.926 0 5.617-1.002 7.75-2.681-2.917-2.296-4.79-5.86-4.79-9.864z" fill="#E91D25"></path>
                              <path d="M40.634 13.066c0 6.927-5.615 12.542-12.541 12.542-2.925 0-5.617-1.002-7.75-2.68 2.917-2.3 4.79-5.864 4.79-9.865 0-4-1.873-7.564-4.79-9.86 2.133-1.678 4.825-2.68 7.75-2.68 6.926 0 12.54 5.614 12.54 13.064" fill="#F69E1E"></path>
                          </g>
                      </svg>
                    </div>
                </div>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="bg-white rounded-[6px] p-6 mt-6">
              <h2 className="text-heading text-2xl font-bold text-[#111] mb-4 flex items-center gap-2">
                <Ticket className="w-6 h-6" />
                Apply Coupon
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter Code (e.g. SAVE20)"
                  className="input-field flex-grow mb-0 uppercase"
                  disabled={!!appliedCoupon}
                />
                {!appliedCoupon ? (
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-[#0F1720] text-white px-6 py-2 rounded-[6px] font-bold hover:bg-[#2a3441] transition-colors"
                  >
                    APPLY
                  </button>
                ) : (
                  <button
                    onClick={removeCoupon}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-[6px] font-bold hover:bg-red-100 transition-colors flex items-center gap-1"
                  >
                    <X className="w-4 h-4" /> REMOVE
                  </button>
                )}
              </div>
              {couponError && <p className="text-red-500 text-sm mt-2 font-bold">{couponError}</p>}
              {appliedCoupon && <p className="text-green-600 text-sm mt-2 font-bold">Applied: {appliedCoupon.code} (-{appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountAmount}%` : `₹${appliedCoupon.discountAmount}`})</p>}
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
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#14C27A]">
                    <span className="font-medium">Discount:</span>
                    <span className="font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-200 pt-3 flex justify-between">
                  <span className="text-xl font-bold text-[#111]">Total:</span>
                  <span className="text-3xl font-bold text-[#111]">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button 
                onClick={handlePlaceOrder} 
                disabled={processing || !stripe}
                className={`btn-primary w-full mt-6 flex items-center justify-center gap-2 ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    PROCESSING...
                  </>
                ) : (
                  `PAY ₹${total.toLocaleString('en-IN')}`
                )}
              </button>
              
              <p className="text-[10px] text-gray-400 text-center mt-4">
                By clicking "PAY", you agree to AeroStep's terms of service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
