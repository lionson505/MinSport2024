import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { useTheme } from '../context/ThemeContext';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { groupService } from '../services/groupService';

const AddGroupModal = ({ isOpen, onClose, onAdd }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDefault: false,
    permissions: []
  });
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const modulesData = await groupService.getModules();
      setModules(modulesData);
      // Initialize permissions array with default values
      setFormData(prev => ({
        ...prev,
        permissions: modulesData.map(module => ({
          moduleId: Number(module.id),
          canRead: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false
        }))
      }));
    } catch (error) {
      toast.error('Failed to fetch modules');
    }
  };

  const handlePermissionChange = (moduleId, permissionType) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map(permission => 
        permission.moduleId === moduleId
          ? { 
              ...permission, 
              [permissionType]: !permission[permissionType],
              // Ensure the value is boolean
              canRead: permissionType === 'canRead' ? !permission.canRead : permission.canRead,
              canCreate: permissionType === 'canCreate' ? !permission.canCreate : permission.canCreate,
              canUpdate: permissionType === 'canUpdate' ? !permission.canUpdate : permission.canUpdate,
              canDelete: permissionType === 'canDelete' ? !permission.canDelete : permission.canDelete,
            }
          : permission
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        toast.error('Group name is required');
        return;
      }

      // Format permissions to match Swagger example
      const submitData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        isDefault: false,
        permissions: formData.permissions
          .filter(p => p.canRead || p.canCreate || p.canUpdate || p.canDelete)
          .map(p => {
            const perm = {
              moduleId: Number(p.moduleId)
            };
            
            // Only include true permissions
            if (p.canRead) perm.canRead = true;
            if (p.canCreate) perm.canCreate = true;
            if (p.canUpdate) perm.canUpdate = true;
            if (p.canDelete) perm.canDelete = true;
            
            return perm;
          })
      };

      // Validate permissions
      if (submitData.permissions.length === 0) {
        toast.error('Please select at least one permission');
        return;
      }

      console.log('Submitting group data:', JSON.stringify(submitData, null, 2));

      await groupService.createGroup(submitData);
      toast.success('Group created successfully');
      onAdd();
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error(error.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
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
              <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 text-left align-middle shadow-xl transition-all`}>
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 mb-4">
                  Add New Group
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      required
                      placeholder="Enter group name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      placeholder="Enter group description"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Module Permissions</h4>
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
                                    checked={formData.permissions.find(p => p.moduleId === module.id)?.[permission] || false}
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
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Group'
                      )}
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
};

export default AddGroupModal;
