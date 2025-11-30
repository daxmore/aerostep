import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Package, MapPin, Heart, Settings, LogOut, User, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';

const ProfilePage = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, addressId: null });
  const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async () => {
    if (!deleteModal.addressId) return;

    try {
      await axios.delete(`/api/users/addresses/${deleteModal.addressId}`);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to delete address');
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelModal.orderId) return;

    try {
      await axios.patch(`/api/orders/${cancelModal.orderId}/cancel`);
      setCancelModal({ isOpen: false, orderId: null });
      fetchOrders(); // Refresh orders
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to cancel order');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0F1720] mb-4">Please log in to view your profile</h2>
          <Link to="/login" className="inline-block bg-[#0F1720] text-white px-8 py-3 rounded-full font-bold hover:bg-[#2a3441] transition-colors">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-[#0F1720] mb-6">Order History</h2>
            {orders.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-12 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium mb-6">You haven't placed any orders yet.</p>
                <Link to="/shop" className="text-[#0057FF] font-bold hover:underline">Start Shopping</Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order._id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-gray-50 gap-4">
                      <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order ID</div>
                        <div className="font-mono text-sm font-bold text-[#0F1720]">#{order._id.slice(-8).toUpperCase()}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</div>
                        <div className="text-sm font-bold text-[#0F1720]">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total</div>
                        <div className="text-sm font-black text-[#0F1720]">${order.totalPrice}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                          }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {order.products.map(item => (
                        <div key={item._id} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center">
                            {/* Placeholder for order item image since it might not be populated deeply */}
                            <Package className="w-6 h-6 text-gray-300" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#0F1720]">{item.productId?.title || 'Product'}</h4>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cancel Order Button */}
                    {(order.status === 'Pending' || order.status === 'Processing') && (
                      <div className="mt-6 pt-6 border-t border-gray-50">
                        <button
                          onClick={() => setCancelModal({ isOpen: true, orderId: order._id })}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition-colors text-sm"
                        >
                          <X className="w-4 h-4" />
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'wishlist':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-[#0F1720] mb-6">My Wishlist</h2>
            {user?.wishlist && user.wishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.wishlist.filter(item => item && item._id).map((item, index) => (
                  <div key={item._id || index} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-shadow relative group">
                    <Link to={`/product/${item._id}`} className="block">
                      <div className="aspect-[4/5] bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center p-4">
                        <img src={item.images?.thumbnail || item.images?.primary} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <h3 className="font-bold text-[#0F1720] line-clamp-1 mb-1">{item.title}</h3>
                      <p className="font-black text-[#0F1720]">${item.price}</p>
                    </Link>
                    <button
                      onClick={async () => {
                        try {
                          await axios.delete(`/api/users/wishlist/${item._id}`);
                          // Refresh user data to update wishlist
                          window.location.reload();
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="absolute top-6 right-6 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4 fill-current text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-2xl">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#0F1720] mb-2">Your Wishlist is Empty</h3>
                <p className="text-gray-500 mb-6">Save items you love to buy later.</p>
                <Link to="/shop" className="inline-block bg-[#0F1720] text-white px-8 py-3 rounded-full font-bold hover:bg-[#2a3441] transition-colors">Explore Products</Link>
              </div>
            )}
          </div>
        );
      case 'addresses':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-[#0F1720]">Saved Addresses</h2>
              <button
                onClick={() => {
                  const form = document.getElementById('add-address-form');
                  form.classList.toggle('hidden');
                }}
                className="bg-[#0F1720] text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-[#2a3441] transition-colors"
              >
                + Add New
              </button>
            </div>

            {/* Add Address Form */}
            <div id="add-address-form" className="hidden bg-gray-50 p-6 rounded-2xl mb-8">
              <h3 className="font-bold text-lg mb-4">Add New Address</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                try {
                  await axios.post('/api/users/addresses', data);
                  window.location.reload();
                } catch (err) {
                  console.error(err);
                  alert('Failed to add address');
                }
              }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="fullName" placeholder="Full Name" required className="p-3 rounded-lg border border-gray-200" />
                <input name="phone" placeholder="Phone Number" required className="p-3 rounded-lg border border-gray-200" />
                <input name="street" placeholder="Street Address" required className="md:col-span-2 p-3 rounded-lg border border-gray-200" />
                <input name="city" placeholder="City" required className="p-3 rounded-lg border border-gray-200" />
                <input name="state" placeholder="State" required className="p-3 rounded-lg border border-gray-200" />
                <input name="zipCode" placeholder="ZIP Code" required className="p-3 rounded-lg border border-gray-200" />
                <div className="md:col-span-2">
                  <button type="submit" className="bg-[#0F1720] text-white px-8 py-3 rounded-full font-bold hover:bg-[#2a3441] transition-colors">Save Address</button>
                </div>
              </form>
            </div>

            {user?.addresses && user.addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.addresses.map((addr, index) => (
                  <div key={addr._id || index} className="border border-gray-200 rounded-2xl p-6 relative hover:border-[#0F1720] transition-colors group">
                    {addr.isDefault && (
                      <span className="absolute top-6 right-6 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-1 rounded-sm">Default</span>
                    )}
                    <h4 className="font-bold text-lg mb-2">{addr.fullName}</h4>
                    <p className="text-gray-500 text-sm mb-1">{addr.street}</p>
                    <p className="text-gray-500 text-sm mb-1">{addr.city}, {addr.state} {addr.zipCode}</p>
                    <p className="text-gray-500 text-sm mb-4">{addr.phone}</p>

                    <button
                      onClick={() => setDeleteModal({ isOpen: true, addressId: addr._id })}
                      className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No addresses saved yet.</p>
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-xl">
            <h2 className="text-2xl font-black text-[#0F1720] mb-8">Account Settings</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#0F1720] mb-2">Full Name</label>
                <input type="text" defaultValue={user?.name} className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-[#0F1720] focus:ring-0 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0F1720] mb-2">Email Address</label>
                <input type="email" defaultValue={user?.email} disabled className="w-full h-12 px-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <button className="bg-[#0F1720] text-white font-bold px-8 py-3 rounded-full hover:bg-[#2a3441] transition-colors">
                Save Changes
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, addressId: null })}
        onConfirm={handleDeleteAddress}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, orderId: null })}
        onConfirm={handleCancelOrder}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Cancel Order"
        type="danger"
      />

      <div className="container-custom py-12 lg:py-20 px-6 lg:px-20">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-gray-50 rounded-3xl p-8 mb-8 text-center">
              <div className="w-24 h-24 bg-[#0F1720] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-black">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <h2 className="text-xl font-bold text-[#0F1720] mb-1">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-[#0F1720] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 hover:text-[#0F1720]'}`}
              >
                <Package className="w-5 h-5" />
                Orders
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'wishlist' ? 'bg-[#0F1720] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 hover:text-[#0F1720]'}`}
              >
                <Heart className="w-5 h-5" />
                Wishlist
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'addresses' ? 'bg-[#0F1720] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 hover:text-[#0F1720]'}`}
              >
                <MapPin className="w-5 h-5" />
                Addresses
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-[#0F1720] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 hover:text-[#0F1720]'}`}
              >
                <Settings className="w-5 h-5" />
                Settings
              </button>
              <div className="pt-8 mt-8 border-t border-gray-100">
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/';
                  }}
                  className="w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
