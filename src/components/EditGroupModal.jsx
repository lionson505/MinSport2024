import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { useTheme } from '../context/ThemeContext';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

// Use the same modules array as AddGroupModal
import { modules } from '../data/modulePermissions';

function EditGroupModal({ isOpen, onClose, onEdit, groupData }) {
  const { isDarkMode } = useTheme();
  const [groupName, setGroupName] = useState('');
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    if (groupData) {
      setGroupName(groupData.name);
      setPermissions(groupData.permissions || {});
    }
  }, [groupData]);

  const handleCheckAll = () => {
    const newPermissions = {};
    modules.forEach(module => {
      newPermissions[module.id] = {
        Add: true,
        Edit: true,
        Delete: true
      };
    });
    setPermissions(newPermissions);
  };

  const handleUncheckAll = () => {
    const newPermissions = {};
    modules.forEach(module => {
      newPermissions[module.id] = {
        Add: false,
        Edit: false,
        Delete: false
      };
    });
    setPermissions(newPermissions);
  };

  const handlePermissionChange = (moduleId, permission) => {
    setPermissions(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [permission]: !prev[moduleId][permission]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    onEdit({
      id: groupData.id,
      name: groupName,
      permissions: permissions
    });

    toast.success('Group updated successfully');
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
                    Edit Group: {groupData?.name}
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
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Accessible Modules</h3>
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCheckAll}
                          className="text-sm"
                        >
                          Check All
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleUncheckAll}
                          className="text-sm"
                        >
                          Un-check All
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left">Module</th>
                            <th className="px-4 py-2 text-center">Add</th>
                            <th className="px-4 py-2 text-center">Edit</th>
                            <th className="px-4 py-2 text-center">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {modules.map(module => (
                            <tr key={module.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2">{module.name}</td>
                              {module.permissions.map(permission => (
                                <td key={permission} className="px-4 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={permissions[module.id]?.[permission] || false}
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