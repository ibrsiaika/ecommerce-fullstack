import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { register } from '../../store/slices/authSlice';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { name, email, password, confirmPassword } = formData;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push('Name is required');
    }

    if (!email.trim()) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.push('Email is invalid');
    }

    if (!password) {
      errors.push('Password is required');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (!confirmPassword) {
      errors.push('Please confirm your password');
    } else if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(register({ name, email, password })).unwrap();
      navigate('/', { replace: true });
    } catch (err) {
      // Error is handled by the slice
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-16 lg:py-24">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center text-white font-bold mb-4">
              E
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Create account</h1>
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-gray-900 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50">
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((err, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={handleChange}
                placeholder="John Doe"
                className="input w-full"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
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
                className="input w-full"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3 text-base font-medium"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Password Requirements Info */}
          <div className="mt-8 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">Requirements</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                <span>At least 6 characters</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                <span>Passwords must match</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                <span>Valid email address</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;