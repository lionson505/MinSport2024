/* src/pages/auth/Login.jsx */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { Button } from '../../components/ui/Button';

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
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
        // Store userId in localStorage for OTP verification
        localStorage.setItem('tempUserId', response.data.userId);
        setShowOtpForm(true);
        toast.success(response.data.message || 'OTP sent to your email');
      }
    } catch (error) {
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

        // Fetch user permissions if needed
        if (!isAdmin) {
          try {
            const permissionsResponse = await axiosInstance.get(`/users/${response.data.user.id}/permissions`);
            if (permissionsResponse.data) {
              localStorage.setItem('accessibleLinks', JSON.stringify(permissionsResponse.data));
            }
          } catch (error) {
            console.error('Error fetching permissions:', error);
          }
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="/logo/logo.svg"
            alt="Logo"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {showOtpForm ? 'Enter OTP' : 'Login to continue'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {showOtpForm 
              ? 'Please check your email for the OTP'
              : 'Welcome back, enter your credentials to continue'}
          </p>
        </div>

        {!showOtpForm ? (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                />
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
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Login'}
              </Button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Register here
                </Link>
              </span>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Enter OTP sent to your email
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
