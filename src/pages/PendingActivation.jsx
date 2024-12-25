import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function PendingActivation() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Account Pending</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account is waiting for office activation. Please contact the administrator or try again later.
          </p>
        </div>
        <div className="mt-4">
          <Button
            onClick={handleLogout}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}