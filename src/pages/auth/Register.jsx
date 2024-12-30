'use client';

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, Loader } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    gender: 'male', // Default value
    reasonForRegistration: '',
    federationId:Number(0)
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      console.log("sending form data", formData)
      const response = await axiosInstance.post('/auth/register', formData);
      toast.success('Registration successful! Please check your email for verification.');
      navigate('/check-email');

    } catch (error) {
      toast.error(error.response?.data?.error  || 'Registration failed');
      console.error(error.request.response )
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
              <div className="scale-150 animate animate-spin ">
                <Loader />
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


{/* 
            <div>
                <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 mb-1">
                  National ID
                </label>
                <div className="flex gap-2">
                  <input
                    id="nationalId"
                    name="nationalId"
                    type="text"
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="Enter National ID"
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyId}
                    disabled={isVerifyingId || !nationalId}
                    className="px-4 py-2"
                  >
                    {isVerifyingId ? <Loader className="h-4 w-4 animate-spin" /> : 'Verify'}
                  </Button>
                </div>
              </div> */}
          
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
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
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
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
                  onChange={handleChange}
                  placeholder="user@example.com"
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
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
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
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="reasonForRegistration" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Registration
                </label>
                <textarea
                  id="reasonForRegistration"
                  name="reasonForRegistration"
                  required
                  rows={3}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.reasonForRegistration}
                  onChange={handleChange}
                  placeholder="Please explain why you want to register..."
                />
              </div>
              <div className="hidden">
                <label htmlFor="federationId" className="block text-sm font-medium text-gray-700 mb-1">
                  Federation ID
                </label>
                <input
                  id="federationId"
                  name="federationId"
                  type="number"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.federationId}
                  onChange={handleChange}
                  placeholder="Enter federation ID"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5"
              disabled={isLoading || !formData.firstName} // Disable if ID not verified
            >
              {isLoading ? <Loader /> : 'Create Account'}
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
