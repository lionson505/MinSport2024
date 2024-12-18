import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');

  // Extract token from query parameters
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      console.log(token);
      console.log(formData.password);
      const response = await axiosInstance.post('auth/reset-password', {
        token: token, // Include the token in the request body
        password: formData.password
      });
      setMessage('Password has been reset successfully.');
    } catch (error) {
      setMessage('Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5FA] flex flex-col items-center justify-center p-4">
      <img src="/logo/logo.svg" alt="MINISPORTS" className="h-32" />
      
      <div className="w-full max-w-md bg-white rounded-[20px] shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-[#1B2559] mb-2">Reset password</h2>
        <p className="text-[#A3AED0] mb-6">Enter your new password</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#1B2559] mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-[#E2E7F0] focus:outline-none focus:ring-2 focus:ring-[#4318FF]"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#A3AED0]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1B2559] mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-[#E2E7F0] focus:outline-none focus:ring-2 focus:ring-[#4318FF]"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-[#A3AED0]"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#4318FF] text-white rounded-lg hover:bg-[#3311CC] transition-colors"
          >
            Reset Password
          </button>
        </form>

        {message && (
          <div className="mt-4 text-center text-sm text-[#A3AED0]">
            {message}
          </div>
        )}

        <div className="mt-6 text-center">
          <div className="text-[#A3AED0] mb-2">OR</div>
          <div className="text-[#A3AED0]">
            Back to{' '}
            <Link to="/login" className="text-[#4318FF] hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
