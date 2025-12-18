import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login } from '../../store/slices/authSlice';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    try {
      await dispatch(login({ email, password })).unwrap();
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by the slice
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-16 lg:py-24">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-lg bg-black flex items-center justify-center text-white font-bold mb-3 sm:mb-4 text-sm">
              E
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-gray-900 hover:underline">
                Create one
              </Link>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3 sm:p-4 rounded-lg border border-red-200 bg-red-50">
              <p className="text-xs sm:text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="input w-full text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input w-full pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 flex-shrink-0"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-2 sm:py-3 text-sm sm:text-base font-medium rounded-lg"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 sm:mt-8 p-3 sm:p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">Demo credentials</p>
            <p className="text-xs sm:text-sm text-gray-700 break-all">Email: <code className="bg-white px-2 py-1 rounded border border-gray-200 text-xs">user@example.com</code></p>
            <p className="text-xs sm:text-sm text-gray-700 mt-1 break-all">Password: <code className="bg-white px-2 py-1 rounded border border-gray-200 text-xs">password123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;