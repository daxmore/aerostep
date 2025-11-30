import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../components/AuthLayout';
import Modal from '../components/Modal';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showBanModal, setShowBanModal] = useState(false);
  const [banMessage, setBanMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const _response = await axios.post(
        'http://localhost:5000/api/users/login',
        formData,
        { withCredentials: true }
      );
      // TODO: Store auth state
      navigate('/');
    } catch (err) {
      if (err.response?.status === 403) {
        setBanMessage(err.response.data.msg || 'Your account has been banned.');
        setShowBanModal(true);
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    }
  };

  return (
    <AuthLayout visual="/src/assets/images/auth_visuals/auth_visuals (3).jpeg">
      <div className="space-y-6">
        {/* Heading */}
        <div>
          <h1 className="text-heading text-3xl font-bold text-[#0F1720] mb-2">
            Login to your account
          </h1>
          <p className="text-gray-600">
            Welcome back! Enter your credentials to continue.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#0F1720] mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full h-12 px-4 rounded-md border border-neutral-300 text-[15px] focus:ring-2 focus:ring-[#0057FF] focus:outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#0F1720] mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full h-12 px-4 rounded-md border border-neutral-300 text-[15px] focus:ring-2 focus:ring-[#0057FF] focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-[#0057FF] hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-[#0057FF] text-white font-semibold rounded-md hover:bg-[#0046CC] transition-colors"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">or continue with</span>
          </div>
        </div>

        {/* Social Login */}
        <button
          type="button"
          className="w-full h-12 border border-neutral-300 rounded-md flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="font-medium text-[#0F1720]">Continue with Google</span>
        </button>

        {/* Register Link */}
        <div className="text-center pt-4">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#0057FF] hover:underline font-semibold">
              Register →
            </Link>
          </p>
        </div>
      </div>

      {/* Ban Modal */}
      <Modal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        title="Account Suspended"
        message={banMessage}
        type="danger"
      />
    </AuthLayout>
  );
};

export default LoginPage;
