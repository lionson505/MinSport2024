import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { secureStorage } from "../../utils/crypto.js";

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const [userDetails, setUserDetails] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchUserDetails = async () => {
    if (!user) {
      try {
        const storedUser = await secureStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserDetails(parsedUser);
        } else {
          console.log('No user found, redirecting to login');
          navigate('/login', { state: { from: location }, replace: true });
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast.error('Failed to load user details');
      }
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('accessibleLinks');
      localStorage.removeItem('user');

      navigate('/home');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setIsOpen(false);
    }
  };

  if (!userDetails) {
    return null; // or a loading spinner
  }

  return (
      <div className="relative" ref={menuRef}>
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            {userDetails.profile ? (
                <img
                    src={userDetails.profile}
                    alt={userDetails.firstName || 'Profile'}
                    className="w-full h-full rounded-full object-cover"
                />
            ) : (
                <div className="bg-gray-400 w-full h-full rounded-full flex items-center justify-center">
              <span className="text-white text-sm">
                {userDetails.firstName ? userDetails.firstName.charAt(0).toUpperCase() : 'U'}
              </span>
                </div>
            )}
          </div>
          <span>{userDetails.firstName || 'User'}</span>
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </button>

        {isOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white border border-gray-200">
              <Link
                  to="/settings"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <Settings className="inline-block mr-2" /> Settings
              </Link>
              <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                <LogOut className="inline-block mr-2" />
                Logout
              </button>
            </div>
        )}
      </div>
  );
};

export default ProfileMenu;

