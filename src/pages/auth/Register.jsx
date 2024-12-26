/* src/pages/auth/Register.jsx */
'use client';

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, Loader } from 'lucide-react';
import SportLoader from '../../components/ui/SportLoader';

// Dummy NIDA data for demonstration
const DUMMY_NIDA_DATA = {
  '1123456789101112': {
    firstName: 'MWIZERE',
    lastName: 'Cat',
    gender: 'male',
    dateOfBirth: '2010-05-15',
  },
  '1200080030326060': {
    firstName: 'MUGISHA ',
    lastName: 'Eric',
    gender: 'female',
    dateOfBirth: '2020-08-22',
  }
};

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingId, setIsVerifyingId] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    idNumber: '',
    idType: 'nid', // or passport
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    reason: ''
  });

  // Verify ID Number (simulating NIDA API call)
  const verifyIdNumber = async () => {
    setIsVerifyingId(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const nidaData = DUMMY_NIDA_DATA[formData.idNumber];
      if (nidaData) {
        setFormData(prev => ({
          ...prev,
          firstName: nidaData.firstName,
          lastName: nidaData.lastName,
          gender: nidaData.gender,
          dateOfBirth: nidaData.dateOfBirth
        }));
        toast.success('ID verified successfully');
      } else {
        toast.error('Invalid ID number');
      }
    } catch (error) {
      toast.error('Failed to verify ID');
    } finally {
      setIsVerifyingId(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register', formData);
      toast.success('Registration successful! Please check your email for verification.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Sports illustration and branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 p-12 flex-col">
        <div className="flex-1 flex flex-col justify-center items-center">
          <img
            src="/logo/logo.svg"
            alt="Logo"
            className="h-20 w-auto mb-8"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            MIS - MINISPORTS
          </h1>
          <div className="flex-1 flex items-center justify-center">
            {isLoading ? (
              <div className="scale-150">
                <SportLoader />
              </div>
            ) : (
              <img 
                src="/sport.svg" 
                alt="Sports illustration"
                className="max-w-md w-full h-auto"
              />
            )}
          </div>
        </div>
        <div className="flex space-x-4 text-sm text-gray-500 justify-center">
          <Link to="/terms">Terms of service</Link>
          <span>•</span>
          <Link to="/privacy">Privacy policy</Link>
          <span>•</span>
          <Link to="/support">Support</Link>
        </div>
      </div>

      {/* Right side - Registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
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

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join us to manage sports activities effectively
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* ID Verification Section */}
              <div>
                <label htmlFor="idType" className="block text-sm font-medium text-gray-700 mb-1">
                  ID Type
                </label>
                <select
                  id="idType"
                  name="idType"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.idType}
                  onChange={(e) => setFormData({...formData, idType: e.target.value})}
                >
                  <option value="nid">National ID</option>
                </select>
              </div>

              <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number
                </label>
                <div className="flex gap-2">
                  <input
                    id="idNumber"
                    name="idNumber"
                    type="text"
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                    placeholder={formData.idType === 'nid' ? '1199880052111000' : 'PC123456'}
                  />
                  <Button
                    type="button"
                    onClick={verifyIdNumber}
                    disabled={isVerifyingId || !formData.idNumber}
                    className="px-4 py-2"
                  >
                    {isVerifyingId ? <Loader className="h-4 w-4 animate-spin" /> : 'Verify'}
                  </Button>
                </div>
              </div>

              {/* Auto-filled fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    disabled
                    className="bg-gray-50 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.firstName}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    disabled
                    className="bg-gray-50 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.lastName}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <input
                  id="gender"
                  name="gender"
                  type="text"
                  required
                  disabled
                  className="bg-gray-50 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.gender}
                />
              </div>

              {/* User input fields */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  placeholder="e.g., +250789123456"
                />
              </div>

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
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Registration
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  required
                  rows={3}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Please explain why you want to register..."
                />
              </div>

              {/* Password fields */}
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
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5"
              disabled={isLoading || !formData.firstName} // Disable if ID not verified
            >
              {isLoading ? <SportLoader /> : 'Create Account'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

