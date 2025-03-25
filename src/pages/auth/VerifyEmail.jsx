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
        const response = await axiosInstance.get(`/auth/verify-email/${token}`);
        setMessage(response.data.message);
        setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds
      } catch (err) {
        setError(true);
        setMessage(err.response?.data?.message || 'Verification failed. Please try again.');
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