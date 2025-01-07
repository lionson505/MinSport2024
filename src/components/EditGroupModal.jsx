import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { useTheme } from '../context/ThemeContext';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

function EditGroupModal({ isOpen, onClose, onEdit, groupData }) {
  const { isDarkMode } = useTheme();
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    if (groupData) {
      setGroupName(groupData.name || '');
      setGroupDescription(groupData.description || '');
      setIsDefault(groupData.isDefault || false);
      setPermissions(Array.isArray(groupData.permissions) ? groupData.permissions : []);
    }
  }, [groupData]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await axiosInstance.get('/modules');
        setModules(response.data);

        if (!groupData || !Array.isArray(groupData.permissions)) {
          const initialPermissions = response.data.map(module => ({
            moduleId: module.id,
            canRead: false,
            canCreate: false,
            canUpdate: false,
            canDelete: false
          }));
          setPermissions(initialPermissions);
        }
      } catch (error) {
        toast.error('Failed to fetch modules');
        console.error(error);
      }
    };

    fetchModules();
  }, [groupData]);

  const handlePermissionChange = (moduleId, permission) => {
    setPermissions(prevPermissions =>
      prevPermissions.map(p =>
        p.moduleId === moduleId ? { ...p, [permission]: !p[permission] } : p
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    const updatedGroup = {
      id: groupData.id,
      name: groupName,
      description: groupDescription,
      isDefault: isDefault,
      permissions: permissions
    };

    onEdit(updatedGroup);
    toast.success('Group updated successfully');
    
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full max-w-4xl transform overflow-hidden rounded-lg ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
              } p-6 text-left align-middle shadow-xl transition-all`}>
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-xl font-bold">
                    Edit Group: {groupData?.name || 'N/A'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block mb-1 text-sm font-medium">Name</label>
                    <Input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                      placeholder="Enter group name"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">Description</label>
                    <Input
                      type="text"
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="Enter group description"
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={() => setIsDefault(!isDefault)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label className="ml-2 text-sm font-medium">Is Default</label>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Permissions</h3>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left">Module</th>
                            <th className="px-4 py-2 text-center">Read</th>
                            <th className="px-4 py-2 text-center">Create</th>
                            <th className="px-4 py-2 text-center">Update</th>
                            <th className="px-4 py-2 text-center">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {modules.map(module => (
                            <tr key={module.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2">{module.name}</td>
                              {['canRead', 'canCreate', 'canUpdate', 'canDelete'].map(permission => (
                                <td key={permission} className="px-4 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={Array.isArray(permissions) && permissions.find(p => p.moduleId === module.id)?.[permission] || false}
                                    onChange={() => handlePermissionChange(module.id, permission)}
                                    className="h-4 w-4 rounded border-gray-300"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default EditGroupModal;
