import React, { useState, useEffect, Fragment } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Loader2, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import EditGroupModal from '../components/EditGroupModal';
import AddGroupModal from '../components/AddGroupModal';
import axiosInstance from '../utils/axiosInstance';
import PrintButton from '../components/reusable/Print';
import { usePermissionLogger } from '../utils/permissionLogger.js';

function ManageGroups() {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const { isDarkMode } = useTheme();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [isModulesModalOpen, setIsModulesModalOpen] = useState(false);
  const [selectedModules, setSelectedModules] = useState([]);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isManageModulesPermissionsModalOpen, setIsManageModulesPermissionsModalOpen] = useState(false);
  const [availableModules, setAvailableModules] = useState([]);

  const [groupsData, setGroupsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const logPermissions = usePermissionLogger("users")
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false
  })

  const fetchPermissions = async ()=> {
    const currentPermissions =await logPermissions();
    await setPermissions(currentPermissions);
  }

  const fetchGroups = async () => {
    const permissionsCurrent = await logPermissions()
    await setPermissions(permissionsCurrent)
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get('/groups');
      const groups = Array.isArray(response.data.data) ? response.data.data : [];
      // console.log('Fetched groups:', groups);

      // Fetch permissions for each group and count modules
      const groupsWithModuleCounts = await Promise.all(groups.map(async (group) => {
        const permissionsResponse = await axiosInstance.get(`/permissions/groups/${group.id}`);
        const permissions = Array.isArray(permissionsResponse.data) ? permissionsResponse.data : [];
        const moduleCount = permissions.length; // Count the number of modules
        return { ...group, moduleCount, permissions };
      }));

      setGroupsData(groupsWithModuleCounts);
    } catch (err) {
      setError('Failed to load groups data.');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users');
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      // console.log('Fetched users:', data); // Debugging log
      setUsersData(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await axiosInstance.get('/modules');
      const data = Array.isArray(response.data) ? response.data : [];
      const modules = data.map(module => ({
        id: module.id,
        name: module.name
      }));
      setAvailableModules(modules);
    } catch (err) {
      console.error('Error fetching modules:', err);
    }
  };

  const fetchGroupPermissions = async (groupId) => {
    try {
      const response = await axiosInstance.get(`/permissions/groups/${groupId}`);
      const data = Array.isArray(response.data) ? response.data : [];
      const permissionsWithModules = data.map(permission => ({
        ...permission,
        moduleName: permission.module.name
      }));
      setSelectedModules(permissionsWithModules);
    } catch (err) {
      console.error('Error fetching group permissions:', err);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchUsers();
    fetchModules();
  }, []);

  const associateUsersWithGroups = () => {
    // console.log('Associating users with groups...');
    return groupsData.map(group => {
      const usersInGroup = usersData.filter(user => {
        // Ensure userGroup exists and has an id before comparing
        return user.userGroup && user.userGroup.id === group.id;
      });
      // console.log(`Group: ${group.name}, User Count: ${usersInGroup.length}`); // Debugging log
      return { ...group, userCount: usersInGroup.length }; // Count users in the group
    });
  };

  const filteredData = associateUsersWithGroups().filter(group =>
    Object.values(group).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const totalEntries = filteredData.length;
  const firstEntry = totalEntries === 0 ? 0 : startIndex + 1;
  const lastEntry = Math.min(startIndex + entriesPerPage, totalEntries);

  const handleEdit = (group) => {
    const groupToEdit = { ...group, permissions: group.permissions || [] };
    setSelectedGroup(groupToEdit);
    setSelectedModules(groupToEdit.permissions);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (updatedGroup) => {
    try {
      const response = await axiosInstance.put(`/groups/${updatedGroup.id}`, updatedGroup);

      setGroupsData(prev => 
        prev.map(group => group.id === updatedGroup.id ? response.data : group)
      );
      
      setIsEditModalOpen(false);
      toast.success('Group updated successfully');
    window.location.reload();
    } catch (err) {
      toast.error('Failed to update group');
      console.error('Error updating group:', err);
    }
  };

  const handleDelete = (group) => {
    setGroupToDelete(group);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/groups/${groupToDelete.id}`);

      setGroupsData(prev => prev.filter(group => group.id !== groupToDelete.id));
      setIsDeleteModalOpen(false);
      toast.success('Group deleted successfully');
    } catch (err) {
      toast.error('Failed to delete group');
      console.error('Error deleting group:', err);
    }
  };

  const handleAddGroup = () => {
    setIsAddModalOpen(true);
  };

  const handleModulesClick = (groupId) => {
    fetchGroupPermissions(groupId); // Fetch permissions for the selected group
    setIsModulesModalOpen(true); // Open the modal
  };

  const handleUsersClick = (group) => {
    const usersInGroup = usersData.filter(user => user.userGroup && user.userGroup.id === group.id);
    setSelectedUsers(usersInGroup);
    setIsUsersModalOpen(true);
  };

  const handleManageModulesPermissions = (group) => {
    setSelectedGroup(group);
    fetchGroupPermissions(group.id);
    setIsManageModulesPermissionsModalOpen(true);
  };

  const handleAddModule = () => {
    const newModule = { moduleId: '', canRead: false, canCreate: false, canUpdate: false, canDelete: false };
    setSelectedModules([...selectedModules, newModule]);
  };

  const handleModuleChange = (index, field, value) => {
    const updatedModules = [...selectedModules];
    updatedModules[index][field] = value;
    setSelectedModules(updatedModules);
  };

  const handleSavePermissions = async () => {
    try {
      const payload = {
        permissions: selectedModules.map(module => ({
          moduleId: Number(module.moduleId), // Ensure moduleId is a number
          canRead: module.canRead,
          canCreate: module.canCreate,
          canUpdate: module.canUpdate,
          canDelete: module.canDelete
        }))
      };

      // console.log('Payload being sent:', JSON.stringify(payload, null, 2));

      const response = await axiosInstance.post(`/permissions/groups/${selectedGroup.id}`, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success('Permissions updated successfully');
      window.location.reload();
        setIsManageModulesPermissionsModalOpen(false);
      } else {
        toast.error('Failed to update permissions');
      }
    } catch (err) {
      console.error('Error updating permissions:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
      }
      toast.error('Failed to update permissions');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-6">Manage Groups</h1>

        <Button onClick={handleAddGroup} className="mb-4 flex items-center gap-2">
          <Loader2 className="h-5 w-5" />
          Add Group
        </Button>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="mr-2">Show entries:</label>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded p-1"
              >
                <option value={100}>100</option>
                <option value={50}>50</option>
                <option value={25}>25</option>
              </select>
            </div>
            <div className="relative">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
                placeholder="Search..."
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="text-4xl text-blue-500">Loading...</div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : (
            paginatedData.length > 0 ? (
              <PrintButton title='Manage Groups Report'>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modules</th>
                      {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th> */}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedData.map((group) => (
                      <tr key={group.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{group.name}</td>
                        <td className="px-4 py-3">
                          <button
                            className="text-blue-500 underline"
                            onClick={() => handleModulesClick(group.id)} // Pass the group ID
                          >
                            {group.moduleCount} {/* Display the module count */}
                          </button>
                        </td>

                        <td className="px-4 py-3 operation">
                          <div className="flex items-center space-x-2">
                            {[permissions.canDelete && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDelete(group)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            )]}
                            {permissions.canUpdate && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleEdit(group)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                            )}

                            {permissions.canUpdate && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleManageModulesPermissions(group)}
                                >
                                  <span className="h-4 w-4">🔧</span>
                                </Button>
                            )}

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </PrintButton>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
                <p className="text-gray-500">Try adjusting your search</p>
              </div>
            )
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            {totalEntries > 0 ? `Showing ${firstEntry} to ${lastEntry} of ${totalEntries} entries` : 'No entries to show'}
          </div>
          {totalEntries > 0 && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className={currentPage === i + 1 ? 'bg-blue-600 text-white' : ''}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      <EditGroupModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedGroup(null);
        }}
        onEdit={handleEditSubmit}
        groupData={selectedGroup}
      />

      <AddGroupModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={fetchGroups}
      />

      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDeleteModalOpen(false)}>
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
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                    <Dialog.Title className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Confirm Deletion
                    </Dialog.Title>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">
                    Are you sure you want to delete the group "{groupToDelete?.name}"? This will also remove all associated permissions and cannot be undone.
                  </p>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteConfirm}>
                      Delete Group
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isModulesModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModulesModalOpen(false)}>
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
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                    Modules and Permissions
                  </Dialog.Title>
                  <div className="space-y-2">
                    {(selectedModules || []).map((module, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{module.moduleName}</span>
                        <span>{module.canRead ? 'Read' : ''} {module.canCreate ? 'Create' : ''} {module.canUpdate ? 'Update' : ''} {module.canDelete ? 'Delete' : ''}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={() => setIsModulesModalOpen(false)}>Close</Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isUsersModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsUsersModalOpen(false)}>
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
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                    Users
                  </Dialog.Title>
                  <div className="space-y-2">
                    {(selectedUsers || []).map((user, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{user.firstName} {user.lastName}</span>
                        <span>{user.email}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={() => setIsUsersModalOpen(false)}>Close</Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isManageModulesPermissionsModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsManageModulesPermissionsModalOpen(false)}>
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
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                    Manage Modules and Permissions for {selectedGroup?.name}
                  </Dialog.Title>
                  <div className="space-y-4">
                    {(selectedModules || []).map((module, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <select
                          value={module.moduleId}
                          onChange={(e) => handleModuleChange(index, 'moduleId', e.target.value)}
                          className="flex-1 border rounded p-1"
                        >
                          <option value="">Select Module</option>
                          {availableModules.map((mod) => (
                            <option key={mod.id} value={mod.id}>
                              {mod.name}
                            </option>
                          ))}
                        </select>
                        <label>
                          <input
                            type="checkbox"
                            checked={module.canRead}
                            onChange={(e) => handleModuleChange(index, 'canRead', e.target.checked)}
                          />
                          Read
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={module.canCreate}
                            onChange={(e) => handleModuleChange(index, 'canCreate', e.target.checked)}
                          />
                          Create
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={module.canUpdate}
                            onChange={(e) => handleModuleChange(index, 'canUpdate', e.target.checked)}
                          />
                          Update
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={module.canDelete}
                            onChange={(e) => handleModuleChange(index, 'canDelete', e.target.checked)}
                          />
                          Delete
                        </label>
                      </div>
                    ))}
                    <Button variant="outline" onClick={handleAddModule}>Add Module</Button>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={() => setIsManageModulesPermissionsModalOpen(false)}>Cancel</Button>
                    <Button className="ml-2" onClick={handleSavePermissions}>Save</Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default ManageGroups;
