/* src/pages/auth/Login.jsx */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const [otp, setOtp] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      
      if (response.data.userId) {
        localStorage.setItem('tempUserId', response.data.userId);
        setShowOtpForm(true);
        toast.success(response.data.message || 'OTP sent to your email');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get userId from localStorage
      const userId = localStorage.getItem('tempUserId');

      const response = await axiosInstance.post('/auth/verify-otp', {
        userId: userId,
        otp: otp
      });

      if (response.data.token && response.data.user) {
        // Clear temporary userId
        localStorage.removeItem('tempUserId');
        
        // Store user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.user.userGroup.name);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Set activation status based on user group
        const isAdmin = response.data.user.userGroup.name === 'admin';
        localStorage.setItem('isActivated', isAdmin ? 'true' : 'false');

        // Initialize accessible links
        const defaultLinks = isAdmin ? [] : []; // You can set default links here
        localStorage.setItem('accessibleLinks', JSON.stringify(defaultLinks));

        // For non-admin users, fetch their permissions
        if (response.data.user.userGroup.name !== 'admin') {
          const permissionsResponse = await axiosInstance.get(
            `/users/${response.data.user.id}/permissions`
          );
          localStorage.setItem('accessibleLinks', 
            JSON.stringify(permissionsResponse.data)
          );
        }

        toast.success(response.data.message || 'Login successful');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
      setOtp(''); // Clear OTP field on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Background with logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-blue-50 to-blue-100 p-12 flex-col">
        <div className="flex-1 flex flex-col justify-center items-center">
          <img
            src="/logo/logo.svg"
            alt="Logo"
            className="h-20 w-auto mb-8"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            MIS - MINISPORTS
          </h1>
          <div className="flex-1 flex items-center">
            <img 
              src="/sport.svg" 
              alt="Login illustration"
              className="max-w-md"
            />
          </div>
        </div>
        <div className="flex space-x-4 text-sm text-gray-500">
          <Link to="/terms">Terms of service</Link>
          <span>•</span>
          <Link to="/privacy">Privacy policy</Link>
          <span>•</span>
          <Link to="/support">Support</Link>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo - only shown on small screens */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img
              src="/logo/logo.svg"
              alt="Logo"
              className="h-16 w-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">
              MIS - MINISPORTS
            </h1>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              {showOtpForm ? 'Enter OTP' : 'Login to continue'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {showOtpForm 
                ? 'Please check your email for the OTP'
                : 'Welcome back, enter your credentials to continue'}
            </p>
              </div>

          {!showOtpForm ? (
            <form onSubmit={handleLogin} className="mt-8 space-y-6">
              <div className="space-y-4">
              <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                <input
                    id="email"
                    name="email"
                  type="email"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                />
              </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                <div className="relative">
                  <input
                      id="password"
                    name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                    placeholder="Enter your password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Login'}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">
              Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Register here
              </Link>
                </span>
            </div>
            </form>
          ) : (
            // OTP Form
            <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter OTP sent to your email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
            </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
