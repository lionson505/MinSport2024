import React from 'react';
import { Link } from 'react-router-dom';

const CheckEmail = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/logo/logo.svg" alt="Logo" className="h-20 w-auto" />
        </div>

        {/* Content Container */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-center mb-2">
            Check your email
          </h2>
          <p className="text-gray-600 text-center mb-6">
            We sent you an instruction on your email with an address that you wil use to reset your password
          </p>

          <button
            onClick={() => window.location.reload()} // This is temporary, should integrate with actual email resend logic
            className="w-full text-blue-600 hover:text-blue-500 text-center"
          >
            I didn't receive email
          </button>

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

export default CheckEmail; 