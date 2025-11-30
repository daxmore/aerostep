import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../components/AuthLayout';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const { name, email, password } = formData;

    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (name.length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
      setError('Name can only contain letters and spaces');
      return false;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError('Password must contain uppercase, lowercase, number, and special character');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      await axios.post('http://localhost:5000/api/users/register', formData);
      // Redirect to login page after successful registration
      navigate('/login');
    } catch (err) {
      // Prefer backend message if provided (server sends `msg`), fall back to `message`.
      const serverMsg = err.response?.data?.msg || err.response?.data?.message;
      setError(serverMsg || 'Registration failed');
    }
  };

  return (
    <AuthLayout visual="/src/assets/images/auth_visuals/auth_visuals (4).jpeg" reverse={true}>
      <div className="space-y-6">
        {/* Heading */}
        <div>
          <h1 className="text-heading text-3xl font-bold text-[#0F1720] mb-2">
            Create an account
          </h1>
          <p className="text-gray-600">
            Join AeroStep and start your performance journey.
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
            <label htmlFor="name" className="block text-sm font-semibold text-[#0F1720] mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full h-12 px-4 rounded-md border border-neutral-300 text-[15px] focus:ring-2 focus:ring-[#0057FF] focus:outline-none transition-all"
              placeholder="John Doe"
            />
          </div>

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

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-[#0F1720] mb-2">
              Phone <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-md border border-neutral-300 text-[15px] focus:ring-2 focus:ring-[#0057FF] focus:outline-none transition-all"
              placeholder="9876543210"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-[#0057FF] text-white font-semibold rounded-md hover:bg-[#0046CC] transition-colors"
          >
            Create Account
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
          <span className="font-medium text-[#0F1720]">Sign up with Google</span>
        </button>

        {/* Login Link */}
        <div className="text-center pt-4">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0057FF] hover:underline font-semibold">
              Login →
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
