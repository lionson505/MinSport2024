import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Loader2, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import AddUserModal from '../components/AddUserModal';
import EditUserModal from '../components/EditUserModal'; 
import ManageGroups from './ManageGroups';
import axiosInstance from '../utils/axiosInstance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import {usePermissionLogger} from "../utils/permissionLogger.js";

function Users() {
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  const [selectedUser, setSelectedUser] = useState(null); 
  const [userData, setUserData] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('users'); 
  const [searchName, setSearchName] = useState(''); 
  const [searchGroup, setSearchGroup] = useState(''); 
  const [searchStatus, setSearchStatus] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const navigate = useNavigate();
  const logPermissions = usePermissionLogger("users")
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false
  })
  // Get the group name based on the userGroup object
  const getGroupName = (userGroup) => {
    if (!Array.isArray(groupData)) {
      console.error('groupData is not an array:', groupData);
      return 'N/A';
    }
    if (!userGroup) {
      console.warn('User does not have a userGroup:', userGroup);
      return 'N/A';
    }
    const group = groupData.find((group) => group.id === userGroup.id);
    return group ? group.name : 'N/A';
  };

  // Fetch user and group data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      const userResponse = await axiosInstance.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const groupResponse = await axiosInstance.get('/groups', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserData(userResponse.data);
      setGroupData(Array.isArray(groupResponse.data.data) ? groupResponse.data.data : []); // Adjusted to access the nested data array

      console.log('User Data:', userResponse.data);
      console.log('Group Data:', groupResponse.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load users or groups data. Please try again later.');
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async ()=> {
    const currentPermissions =await logPermissions();
    await setPermissions(currentPermissions);
  }

  useEffect(() => {
    fetchPermissions();
    fetchData();
  }, []);

  const pendingUsers = userData.filter(user => !user.active);

  const filteredUsers = userData.filter((user) => {
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const groupName = getGroupName(user.userGroup) || '';
    const userStatus = user.active ? 'active' : 'inactive';

    const matchesName = userName.toLowerCase().includes(searchName.toLowerCase());
    const matchesGroup = !searchGroup || groupName.toLowerCase().includes(searchGroup.toLowerCase());
    const matchesStatus = !searchStatus || userStatus.toLowerCase().includes(searchStatus.toLowerCase());

    return matchesName && matchesGroup && matchesStatus;
  });

  const getUserStatus = (user) => {
    return user.active ? 'active' : 'inactive';
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user); 
    setIsEditModalOpen(true); 
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user); 
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      await axiosInstance.delete(`/users/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchData();
      toast.success('User deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete user. Please try again.');
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const clearFilters = () => {
    setSearchName('');
    setSearchGroup('');
    setSearchStatus('');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Users and Groups</h1>

      <div className="flex gap-4 mb-4">
        {permissions.canRead && (



            <Button
                onClick={() => handleTabSwitch('users')}
                className={activeTab === 'users' ? 'bg-blue-600 text-white' : ''}
            >
              Manage Users
            </Button>
        )}

        <Button
          onClick={() => handleTabSwitch('pending')}
          className={activeTab === 'pending' ? 'bg-blue-600 text-white' : ''}
        >
          Pending Users
        </Button>
        {permissions.canRead && (
            <Button
                onClick={() => handleTabSwitch('groups')}
                className={activeTab === 'groups' ? 'bg-blue-600 text-white' : ''}
            >
              Manage Groups
            </Button>
        )}

      </div>

      {activeTab === 'users' && (
        <div className="mb-4">
          <h2 className="font-semibold text-lg mb-2">Filter Users</h2>
          <div className="flex gap-4">
            <div className="flex flex-col">
              <label htmlFor="searchName" className="mb-1 text-sm">Search by Name</label>
              <input
                type="text"
                id="searchName"
                placeholder="Search by Name"
                className="p-2 border border-gray-300 rounded"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="searchGroup" className="mb-1 text-sm">Search by Group</label>
              <input
                type="text"
                id="searchGroup"
                placeholder="Search by Group"
                className="p-2 border border-gray-300 rounded"
                value={searchGroup}
                onChange={(e) => setSearchGroup(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="searchStatus" className="mb-1 text-sm">Search by Status</label>
              <input
                type="text"
                id="searchStatus"
                placeholder="Search by Status"
                className="p-2 border border-gray-300 rounded"
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
              />
            </div>
          </div>

          <Button variant="outline" onClick={clearFilters} className="mt-2">
            Clear Filters
          </Button>
        </div>
      )}

      {activeTab === 'users' && (
        <>
          {permissions.canCreate && (<Button onClick={handleAddUser} className="mb-4">
            Add User
          </Button>)
          }


          {loading && (
            <div className="flex justify-center items-center">
              <Loader2 className="animate-spin text-blue-500" size={24} />
            </div>
          )}

          {error && (
            <div className="text-red-500 mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && filteredUsers.length > 0 && (
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">First Name</th>
                  <th className="border p-2 text-left">Last Name</th>
                  <th className="border p-2 text-left">Email</th>
                  <th className="border p-2 text-left">Group</th>
                  <th className="border p-2 text-left">Status</th>
                  <th className="border p-2 text-left">Operation</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="border p-2">{user.firstName}</td>
                    <td className="border p-2">{user.lastName}</td>
                    <td className="border p-2">{user.email}</td>
                    <td className="border p-2">{getGroupName(user.userGroup)}</td>
                    <td className="border p-2">{getUserStatus(user)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {permissions.canUpdate && (
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEditUser(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                        )}

                        {permissions.canDelete && (
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && !error && filteredUsers.length === 0 && (
            <div className="text-center text-gray-500">No users found</div>
          )}
        </>
      )}

      {activeTab === 'pending' && (
        <>
          {loading && (
            <div className="flex justify-center items-center">
              <Loader2 className="animate-spin text-blue-500" size={24} />
            </div>
          )}

          {error && (
            <div className="text-red-500 mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="mb-4">
            <h2 className="font-semibold text-lg mb-2">Filter Pending Users</h2>
            <div className="flex gap-4">
              <div className="flex flex-col">
                <label htmlFor="searchName" className="mb-1 text-sm">Search by Name</label>
                <input
                  type="text"
                  id="searchName"
                  placeholder="Search by Name"
                  className="p-2 border border-gray-300 rounded"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="searchGroup" className="mb-1 text-sm">Search by Group</label>
                <input
                  type="text"
                  id="searchGroup"
                  placeholder="Search by Group"
                  className="p-2 border border-gray-300 rounded"
                  value={searchGroup}
                  onChange={(e) => setSearchGroup(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mb-0"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {!loading && !error && pendingUsers.length > 0 && (
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">First Name</th>
                  <th className="border p-2 text-left">Last Name</th>
                  <th className="border p-2 text-left">Email</th>
                  <th className="border p-2 text-left">Group</th>
                  <th className="border p-2 text-left">Status</th>
                  <th className="border p-2 text-left">Operation</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers
                  .filter((user) => {
                    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                    const groupName = getGroupName(user.userGroup) || '';

                    const matchesName = userName.toLowerCase().includes(searchName.toLowerCase());
                    const matchesGroup = !searchGroup || groupName.toLowerCase().includes(searchGroup.toLowerCase());

                    return matchesName && matchesGroup;
                  })
                  .map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="border p-2">{user.firstName}</td>
                      <td className="border p-2">{user.lastName}</td>
                      <td className="border p-2">{user.email}</td>
                      <td className="border p-2">{getGroupName(user.userGroup)}</td>
                      <td className="border p-2">{getUserStatus(user)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditUser(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {!loading && !error && pendingUsers.length === 0 && (
            <div className="text-center text-gray-500">No pending users found</div>
          )}
        </>
      )}

      {activeTab === 'groups' && <ManageGroups />}

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={() => fetchData()}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEdit={() => fetchData()}
        userData={selectedUser}
      />

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="py-4">
              Are you sure you want to delete <span className="font-semibold">{selectedUser?.firstName} {selectedUser?.lastName}</span>?
              This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Users;
