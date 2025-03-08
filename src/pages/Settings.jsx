import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { User, Lock, Camera, Mail, Phone, Building, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import axios from '../lib/axios'; // Assuming axios is being used for API calls

const Settings = () => {
  const { user, updateUser } = useAuth();  // Using user from context
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    groupId: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user?.name || '',
        email: user?.email || '',
        groupId: user?.groupId || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      // Ensure the user object and its id are present
      if (!user || !user.id) {
        toast.error('User ID not available');
        setIsSubmitting(false);
        return;
      }
  
      // Use axios for the PUT request
      const response = await axios.put(
        `/users/${user.id}`, // User ID included in the URL
        profileData, // Data to be updated
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Authorization header
            
          },
        }
      );
        console.log('about if condition',user.id);
      if (response.status === 200) {
        toast.success('Profile updated successfully');
        updateUser(response.data); // Update the user context with new data
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/changePassword', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.status === 200) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error('Failed to change password');
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('photo', file);

      try {
        const response = await axios.post('/uploadPhoto', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.status === 200) {
          setProfileData(prev => ({
            ...prev,
            photo: response.data.photo
          }));
          toast.success('Photo updated successfully');
        } else {
          toast.error('Failed to upload photo');
        }
      } catch (error) {
        toast.error('Failed to upload photo');
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-600 border-l-gray-200 border-r-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex space-x-8">
            <button
              className={`px-4 py-4 ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Settings
            </button>
            <button
              className={`px-4 py-4 ${activeTab === 'password' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('password')}
            >
              Change Password
            </button>
          </div>
        </div>
        <div className="p-6">
          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Profile Settings Form */}
              <div className="flex items-center space-x-4">
                <div className="relative w-20 h-20">
                  <img src={profileData.photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  <label className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer">
                    <Camera className="w-4 h-4 text-white" />
                    <input type="file" className="absolute inset-0 opacity-0" onChange={handlePhotoChange} />
                  </label>
                </div>
                <div>
                  <div className="text-lg font-medium">{profileData.name} {profileData.lastName}</div>
                  <div className="text-sm text-gray-500">{profileData.email}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                {/* <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  />
                </div> */}
              </div>
              <div className="grid grid-cols-2 gap-6">
                {/* <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div> */}
                {/* <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={profileData.department}
                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                  />
                </div> */}
              </div>
              <div className="grid grid-cols-2 gap-6">
                {/* <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  />
                </div> */}
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {/* Password Settings Form */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
                  Change Password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
