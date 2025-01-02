import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import axios from '../lib/axios';
import {secureStorage} from '../utils/crypto.js';
import axiosInstance from "../lib/axios";

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    userGroup: { id: 0, name: '' }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await secureStorage.getItem('user');
        const userData = JSON.parse(response);
        console.log('User data:', userData);

        if (userData) {
          setProfileData({
            firstName: userData.firstName?.trim() || '',
            lastName: userData.lastName?.trim() || '',
            email: userData.email?.trim() || '',
            gender: userData.gender || '',
            userGroup: userData.userGroup || { id: 0, name: '' }
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to load user data');
      }
    };

    fetchUser();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userData = await secureStorage.getItem('user');
      const parsedUser = JSON.parse(userData);

      if (!parsedUser?.id) {
        toast.error('User ID not available');
        return;
      }

      const response = await axiosInstance.put(`/users/${parsedUser.id}`, profileData);

      if (response.status === 200) {
        toast.success('Profile updated successfully');
        await secureStorage.setItem('user', JSON.stringify(response.data));
        updateUser(response.data);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
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
      });

      if (response.status === 200) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="bg-white rounded-lg shadow-sm">
          {/* Tabs */}
          <div className="flex border-b">
            <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 text-sm rounded-sm  shadow-xl font-medium transition-colors ${
                    activeTab === 'profile'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Profile
            </button>
            {/*<button*/}
            {/*    onClick={() => setActiveTab('password')}*/}
            {/*    className={`px-6 py-3 text-sm font-medium transition-colors ${*/}
            {/*        activeTab === 'password'*/}
            {/*            ? 'bg-blue-500 text-white'*/}
            {/*            : 'text-gray-600 hover:text-gray-900'*/}
            {/*    }`}*/}
            {/*>*/}
            {/*  Password*/}
            {/*</button>*/}
          </div>

          <div className="p-6">
            {activeTab === 'profile' ? (
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-600">
                    {profileData.firstName?.charAt(0)}
                  </span>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) =>
                              setProfileData({ ...profileData, firstName: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) =>
                              setProfileData({ ...profileData, lastName: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                            setProfileData({ ...profileData, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                        value={profileData.gender}
                        onChange={(e) =>
                            setProfileData({ ...profileData, gender: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Group
                    </label>
                    <input
                        type="text"
                        value={profileData.userGroup.name}
                        disabled
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>

                  <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
            ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
            )}
          </div>
        </div>
      </div>
  );
};

export default Settings;

