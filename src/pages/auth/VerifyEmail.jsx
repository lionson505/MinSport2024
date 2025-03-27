import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        console.log(`Verifying email with token: ${token}`); // Log the token to verify it's correct
        const response = await axiosInstance.get(`/auth/verify-email/${token}`);
        console.log('Verification response:', response.data); // Log the response for debugging

        // Check if the response indicates success
        if (response.status === 200) {
          setMessage(response.data.message || 'Email verified successfully!');
          setError(false); // Ensure error is set to false on success
          setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds
        } else {
          throw new Error('Unexpected response status');
        }
      } catch (err) {
        console.error('Verification error:', err); // Log the error for debugging
        setError(true);
        setMessage(err.response?.data?.message || 'Email verified successfully!.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-center mb-2">
            {error ? 'Error' : 'Success'}
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 