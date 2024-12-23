import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ProfileMenu - User Details:', user);
  }, [user]);

  // Handle clicks outside the dropdown
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
      await logout(); // Perform logout
      toast.success('Logged out successfully');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('accessibleLinks');
      localStorage.removeItem('user');
      
      navigate('/home'); // Navigate after logout
    } catch (error) {
      console.error('Logout error:', error); // Log errors
      toast.error('Failed to logout. Please try again.');
    } finally {
      setIsOpen(false); // Close dropdown
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Dropdown Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt={user.name || 'Profile'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="bg-gray-400 w-full h-full rounded-full flex items-center justify-center">
              <span className="text-white text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
        </div>
        <span>{user?.email || 'Guest'}</span>
        <ChevronRight className="h-5 w-5 text-gray-500" />
      </button>

      {/* Dropdown Menu */}
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
