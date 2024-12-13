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
    name: '',
    email: '',
    groupId: '',
    active: false,
    emailVerified: false,
  });

  const [groupOptions, setGroupOptions] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [errorGroups, setErrorGroups] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle modal open and reset form
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: userData?.name || '',
        email: userData?.email || '',
        groupId: userData?.groupId || '',
        active: userData?.active || false,
        emailVerified: userData?.emailVerified || false,
      });

      setGroupOptions([]);
      setLoadingGroups(true);
      setErrorGroups(null);

      axiosInstance.get('/groups')
        .then((response) => {
          setGroupOptions(response.data);
        })
        .catch((error) => {
          setErrorGroups(error.response?.data?.message || 'Failed to load groups');
          toast.error(error.response?.data?.message || 'Failed to load groups');
        })
        .finally(() => {
          setLoadingGroups(false);
        });
    }
  }, [isOpen, userData]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!formData.groupId) {
      toast.error('Please select a group');
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.put(`/users/${userData.id}`, {
        ...formData,
        active: Boolean(formData.active),
        emailVerified: Boolean(formData.emailVerified)
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('User updated successfully:', response.data);
      onEdit(response.data);
      toast.success('User updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating user:', error.response);
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close and reset form state
  const handleClose = useCallback(() => {
    onClose();
    setFormData({
      name: '',
      email: '',
      groupId: '',
      active: false,
      emailVerified: false,
    }); // Reset form data when modal closes
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

              {errorGroups && (
                <div className="text-red-500 text-sm mb-4">
                  {errorGroups}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">Name</label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full"
                    placeholder="Enter full name"
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
                  <label className="block mb-1 text-sm font-medium">Group</label>
                  {loadingGroups ? (
                    <div className="text-sm text-gray-500">Loading groups...</div>
                  ) : (
                    <select
                      name="groupId"
                      value={formData.groupId}
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
