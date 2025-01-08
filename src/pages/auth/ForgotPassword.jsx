import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const response = await axiosInstance.post('auth/forgot-password', { email });
      setMessage('A reset link has been sent to your email.');
      setLoading(false)
    } catch (error) {
      setMessage('Failed to send reset email. Please try again.');
    }
  };

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">

            <img src="/logo/logo.svg" alt="Logo" className="h-10 w-auto" />
          </div>

          {/* Form Container */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-center mb-2">
              Forgot password
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Please enter the email you use for login
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                />
              </div>
              {message ? (
                  <div className="mt-4 text-center font-bold text-l text-gray-600">
                    {message}
                  </div>
              ) : <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'submitting ' : 'submit'}
              </button>}


            </form>



            <div className="mt-6 text-center">
              <div className="text-sm text-gray-500">OR</div>
              <div className="mt-2">
                <span className="text-sm text-gray-600">Remembered your password? </span>
                <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ForgotPassword;
