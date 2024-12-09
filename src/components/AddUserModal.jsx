import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { useTheme } from '../context/ThemeContext';
import { X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

const AddUserModal = ({ isOpen, onClose, onAdd }) => {
  const { isDarkMode } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    password: '',
    groupId: '',
  });

  const [groupOptions, setGroupOptions] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [errorGroups, setErrorGroups] = useState(null);

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Password strength validation
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    // Ensure the groupId is selected
    if (!formData.groupId) {
      toast.error('Please select a group');
      return;
    }

    try {
      // Sending data as JSON with appropriate headers
      const response = await axiosInstance.post('/auth/create-user', formData, {
        headers: {
          'Content-Type': 'application/json',  // Ensure JSON content-type
        }
      });

      console.log('Response from API:', response.data);
      onAdd(response.data);
      toast.success('User created successfully');
      setFormData({ name: '', email: '', gender: '', password: '', groupId: '' });
      onClose();
    } catch (error) {
      console.error('Error creating user:', error.response);
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} p-6 text-left align-middle shadow-xl transition-all`}>
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-xl font-bold">Add New User</Dialog.Title>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">Name</label>
                  <Input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter full name" className="w-full" />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Email</label>
                  <Input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter email address" className="w-full" />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full rounded-md border p-2">
                    <option value="">Select gender</option>
                    {['Male', 'Female', 'Other'].map((option) => (
                      <option key={option} value={option.toLowerCase()}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter password"
                      className="w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Group</label>
                  <select name="groupId" value={formData.groupId} onChange={handleChange} required className="w-full rounded-md border p-2">
                    <option value="">Select group</option>
                    {groupOptions.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 flex justify-between">
                  <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                  <Button type="submit">Create User</Button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddUserModal;
