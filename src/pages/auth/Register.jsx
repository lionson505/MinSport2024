/* src/pages/auth/Register.jsx */
'use client';

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    reason: '',
    idType: 'national',
    idNumber: '',
    acceptTerms: false
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const staticOtp = '123456'; // Static OTP for demonstration

  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const nationalIdRegex = /^[12][0-9]{15}$/;
    const passportRegex = /^[A-Z]{2}[0-9]{7}$/;

    if (formData.idType === 'national' && !nationalIdRegex.test(formData.idNumber)) {
      setErrorMessage('National ID must be 16 digits starting with 1 or 2');
      return;
    }

    if (formData.idType === 'passport' && !passportRegex.test(formData.idNumber)) {
      setErrorMessage('Passport number must be 2 letters followed by 7 digits');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      setShowOtpModal(true); // Show OTP modal instead of navigating directly
    } catch (error) {
      setErrorMessage(error.message || 'Registration failed. Please try again.');
      console.error('Registration Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = () => {
    if (otp.length !== 6) {
      setErrorMessage('OTP must be 6 digits.');
      return;
    }

    if (otp === staticOtp) {
      navigate('/login');
    } else {
      setErrorMessage('Invalid OTP. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVerify = async () => {
    setVerifying(true);
    setErrorMessage('');

    const nationalIdRegex = /^[12][0-9]{15}$/;
    const passportRegex = /^[A-Z]{2}[0-9]{7}$/;

    try {
      if (formData.idType === 'national' && !nationalIdRegex.test(formData.idNumber)) {
        throw new Error('National ID must be 16 digits starting with 1 or 2');
      }
      if (formData.idType === 'passport' && !passportRegex.test(formData.idNumber)) {
        throw new Error('Passport number must be 2 letters followed by 7 digits');
      }

      // Simulate an API call to verify the ID and fetch user data
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate fetched data
      const fetchedData = {
        firstName: 'John',
        lastName: 'Doe'
      };

      setFormData((prev) => ({
        ...prev,
        firstName: fetchedData.firstName,
        lastName: fetchedData.lastName
      }));

      setVerified(true);
    } catch (error) {
      setErrorMessage(error.message || 'Verification failed. Please check your ID number.');
      setVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <style>
        {`
          @keyframes moveUpDown {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          .animate-title span {
            display: inline-block;
            animation: moveUpDown 1s infinite;
          }

          .animate-title span:nth-child(odd) {
            animation-delay: 0.1s;
          }

          .animate-title span:nth-child(even) {
            animation-delay: 0.2s;
          }
        `}
      </style>
      <div className="w-1/2 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold mb-2">Create an Account</h2>
            <p className="text-gray-500 mb-6">Please fill in the details to register</p>
            
            {errorMessage && (
              <div className="text-red-500 align-center center flex justify-center font-semibold w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="national">National ID</option>
                    <option value="passport">Passport</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.idType === 'national' ? 'National ID Number' : 'Passport Number'}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          verified ? 'border-green-500 pr-10' : ''
                        }`}
                        placeholder={formData.idType === 'national' 
                          ? "Enter your 16-digit National ID" 
                          : "Enter your Passport number (e.g., PC1234567)"
                        }
                        required
                        disabled={verified}
                      />
                      {verified && (
                        <svg
                          className="h-5 w-5 text-green-500 absolute right-3 top-1/2 -translate-y-1/2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={verifying || verified || !formData.idNumber}
                      className={`px-4 py-2 rounded-lg text-white font-medium ${
                        verified
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]`}
                    >
                      {verifying ? (
                        'Verifying...'
                      ) : verified ? (
                        'Verified'
                      ) : (
                        'Verify'
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.idType === 'national' 
                      ? "Must be 16 digits starting with 1 or 2" 
                      : "Must be 2 letters followed by 7 digits"
                    }
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Registration
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y"
                  placeholder="Please explain why you want to register..."
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
                  disabled={loading || !verified}
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </button>

                <div className="mt-6 text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:underline">
                    Login here
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="w-1/2 bg-blue-600 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white mb-8 animate-title">
          {Array.from("MIS - MINISPORTS").map((char, index) => (
            <span key={index}>{char}</span>
          ))}
        </h1>
        <img src="/logo/logo.svg" alt="MINISPORTS" className="h-32" />
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Enter OTP</h3>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
            />
            <button
              onClick={handleOtpSubmit}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit OTP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
