import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { useTheme } from '../context/ThemeContext';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

const EditUserModal = ({ isOpen, onClose, onEdit, userData }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    reasonForRegistration: '',
    userGroupId: '',
    active: false,
    emailVerified: false,
    federationId: ''
  });

  const [groupOptions, setGroupOptions] = useState([]);
  const [federationOptions, setFederationOptions] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingFederations, setLoadingFederations] = useState(false);
  const [errorGroups, setErrorGroups] = useState(null);
  const [errorFederations, setErrorFederations] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        email: userData?.email || '',
        phoneNumber: userData?.phoneNumber || '',
        gender: userData?.gender || '',
        reasonForRegistration: userData?.reasonForRegistration || '',
        userGroupId: userData?.userGroupId || '',
        active: userData?.active || false,
        emailVerified: userData?.emailVerified || false,
        federationId: userData?.federationId || ''
      });

      // Fetch federations first
      setFederationOptions([]);
      setLoadingFederations(true);
      setErrorFederations(null);

      axiosInstance.get('/federations')
        .then((response) => {
          setFederationOptions(response.data);
        })
        .catch((error) => {
          const errorMessage = error.response?.data?.message || 'Failed to load federations';
          setErrorFederations(errorMessage);
          toast.error(errorMessage);
        })
        .finally(() => {
          setLoadingFederations(false);
        });

      // Then fetch groups
      setGroupOptions([]);
      setLoadingGroups(true);
      setErrorGroups(null);

      axiosInstance.get('/groups')
        .then((response) => {
          if (Array.isArray(response.data.data)) {
            setGroupOptions(response.data.data);
          } else {
            console.error('Unexpected API response format:', response.data);
          }
        })
        .catch((error) => {
          const errorMessage = error.response?.data?.message || 'Failed to load groups';
          setErrorGroups(errorMessage);
          toast.error(errorMessage);
        })
        .finally(() => {
          setLoadingGroups(false);
        });
    }
  }, [isOpen, userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!formData.userGroupId) {
      toast.error('Please select a group');
      setLoading(false);
      return;
    }

    if (!formData.federationId) {
      toast.error('Please select a federation');
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.put(`/users/${userData.id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        reasonForRegistration: formData.reasonForRegistration,
        userGroupId: parseInt(formData.userGroupId),
        active: Boolean(formData.active),
        emailVerified: Boolean(formData.emailVerified),
        federationId: parseInt(formData.federationId)
      });

      onEdit(response.data);
      toast.success('User updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating user:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    onClose();
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      gender: '',
      reasonForRegistration: '',
      userGroupId: '',
      active: false,
      emailVerified: false,
      federationId: ''
    });
  }, [onClose]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 text-left align-middle shadow-xl transition-all`}>
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-xl font-bold">Edit User</Dialog.Title>
                <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {(errorGroups || errorFederations) && (
                <div className="text-red-500 text-sm mb-4">
                  {errorGroups && <div>{errorGroups}</div>}
                  {errorFederations && <div>{errorFederations}</div>}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">First Name</label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Last Name</label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Phone Number</label>
                  <Input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border p-2"
                  >
                    <option value="">Select gender</option>
                    {['Male', 'Female', 'Other'].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Reason for Registration</label>
                  <Input
                    type="text"
                    name="reasonForRegistration"
                    value={formData.reasonForRegistration}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="Enter reason for registration"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Group</label>
                  {loadingGroups ? (
                    <div className="text-sm text-gray-500">Loading groups...</div>
                  ) : (
                    <select
                      name="userGroupId"
                      value={formData.userGroupId}
                      onChange={handleChange}
                      required
                      className="w-full rounded-md border p-2"
                    >
                      <option value="">Select group</option>
                      {groupOptions.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Federation</label>
                  {loadingFederations ? (
                    <div className="text-sm text-gray-500">Loading federations...</div>
                  ) : (
                    <select
                      name="federationId"
                      value={formData.federationId}
                      onChange={handleChange}
                      required
                      className="w-full rounded-md border p-2"
                    >
                      <option value="">Select federation</option>
                      {federationOptions.map((federation) => (
                        <option key={federation.id} value={federation.id}>
                          {federation.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Status</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="active"
                        name="active"
                        checked={formData.active}
                        onChange={(e) => handleChange({
                          target: {
                            name: 'active',
                            value: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="active" className="text-sm">Active</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="emailVerified"
                        name="emailVerified"
                        checked={formData.emailVerified}
                        onChange={(e) => handleChange({
                          target: {
                            name: 'emailVerified',
                            value: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="emailVerified" className="text-sm">Email Verified</label>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-between">
                  <Button type="button" onClick={handleClose} variant="outline">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update User'}
                  </Button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditUserModal;