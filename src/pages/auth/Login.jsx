/* src/pages/auth/Login.jsx */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const staticOtp = '123456'; // Static OTP for demonstration

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const loggedInUser = await login(formData.email, formData.password);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem("jl", "yes");

      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      localStorage.setItem('userRole', loggedInUser.user.groupId);
      console.log('User Data', localStorage.getItem('userRole'));

      // Show OTP modal instead of navigating directly
      setShowOtpModal(true);
    } catch (error) {
      setErrorMessage(error.message || 'Login failed. Please check your credentials.');
      console.error('Login Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index, digit) => {
    if (digit.length <= 1 && /^\d*$/.test(digit)) {
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);

      // Move focus to the next input
      if (digit !== "" && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      // Move focus to the previous input on backspace
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp === staticOtp) {
      navigate('/dashboard');
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
            <h2 className="text-xl font-semibold mb-2">Login to continue</h2>
            <p className="text-gray-500 mb-6">Welcome back, enter your credentials to continue</p>
            
            {errorMessage && (
              <div className="text-red-500 align-center center flex justify-center font-semibold w-full h-25 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">
                {
                  errorMessage.includes("401") ? "Invalid credentials" : errorMessage
                }
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
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

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/Register" className="text-blue-600 hover:underline">
                Register here
              </Link>
            </div>
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
            <h3 className="text-lg font-semibold mb-4">Verification Code</h3>
            <p className="text-sm text-gray-500 mb-4">
              We have sent the verification code to your email address
            </p>
            <div className="flex justify-center gap-3 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-2xl text-center border-2 rounded-xl focus:border-orange-400 focus:ring-orange-400"
                  maxLength={1}
                />
              ))}
            </div>
            <button
              onClick={handleOtpSubmit}
              className="w-full py-2 px-4 bg-blue-400 text-white rounded-full hover:bg-orange-500"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
