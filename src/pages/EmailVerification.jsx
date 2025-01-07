import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const EmailVerification = () => {
  const { token } = useParams();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('loading');
  const navigate = useNavigate();
    
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Make sure token exists
        if (!token) {
          setMessage('Verification token is missing.');
          setStatus('error');
          return;
        }

        const response = await axiosInstance.get(`/auth/verify-email/${token}`);
        
        // Check for successful verification (status 200)
        if (response.status === 200) {
          setMessage('Email verified successfully');
          localStorage.setItem('verified', 'true');
          setStatus('success');
          // Use a normal timeout instead of async/await
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
        // Handle specific error cases
        if (error.response?.status === 400) {
          setMessage(error.response.data.error || 'Invalid or expired verification token');
        } else {
          setMessage('An error occurred during verification. Please try again.');
        }
        setStatus('error');
        console.error('Verification error:', error.response?.data || error.message);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Email Verification</h2>
        {status === 'loading' && (
          <div>
            <svg
              className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <p className="text-gray-600">Verifying your email, please wait...</p>
          </div>
        )}
        {status === 'success' && (
          <div>
            <svg
              className="h-16 w-16 text-green-500 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-lg font-medium text-green-600">{message}</p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <svg
              className="h-16 w-16 text-red-500 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <p className="text-lg font-medium text-red-600">{message}</p>
          </div>
        )}
        <p className="mt-4 text-gray-500">
          {status === 'success' && 'Redirecting you to login...'}
        </p>
      </div>
    </div>
  );
};

export default EmailVerification;