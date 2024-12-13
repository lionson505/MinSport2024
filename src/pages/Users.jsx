import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Loader2, Edit, Trash2, Pencil, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import AddUserModal from '../components/AddUserModal';
import EditUserModal from '../components/EditUserModal'; 
import ManageGroups from './ManageGroups';
import axiosInstance from '../utils/axiosInstance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog'; // Assuming Dialog component exists

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);  // State for delete modal
  const navigate = useNavigate();

  // Get the group name based on the groupId
  const getGroupName = (groupId) => {
    const group = groupData.find((group) => group.id === groupId);
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
      setGroupData(groupResponse.data);
    } catch (err) {
      setError(err.message || 'Failed to load users or groups data. Please try again later.');
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Modify the filter for pending users to show inactive users
  const pendingUsers = userData.filter(user => !user.active);

  // Update the status display in the filtered users
  const filteredUsers = userData.filter((user) => {
    const matchesName = user.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesGroup = !searchGroup || getGroupName(user.groupId).toLowerCase().includes(searchGroup.toLowerCase());
    
    // Convert boolean active status to string for filtering
    const userStatus = !user.active ? 'inactive' : 'active';
    const matchesStatus = !searchStatus || userStatus.toLowerCase().includes(searchStatus.toLowerCase());
    
    return matchesName && matchesGroup && matchesStatus;
  });

  // Helper function to get status string
  const getUserStatus = (user) => {
    return user.active ? 'active' : 'inactive';
  };

  // Switch between users and groups tab
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  // Handle Add User Modal
  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };

  // Handle Edit User Modal
  const handleEditUser = (user) => {
    setSelectedUser(user); 
    setIsEditModalOpen(true); 
  };

  // Handle Delete User Modal
  const handleDeleteUser = (user) => {
    setSelectedUser(user); 
    setDeleteModalOpen(true); // Open the delete confirmation modal
  };

  // Handle Delete Confirmation
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

      // After deleting, refresh the user list
      fetchData();
      toast.success('User deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete user. Please try again.');
    } finally {
      setDeleteModalOpen(false);  // Close the delete confirmation modal
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchName('');
    setSearchGroup('');
    setSearchStatus('');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Users and Groups</h1>

      {/* Update Tab navigation to include Pending Users */}
      <div className="flex gap-4 mb-4">
        <Button
          onClick={() => handleTabSwitch('users')}
          className={activeTab === 'users' ? 'bg-blue-600 text-white' : ''}
        >
          Manage Users
        </Button>
        <Button
          onClick={() => handleTabSwitch('pending')}
          className={activeTab === 'pending' ? 'bg-blue-600 text-white' : ''}
        >
          Pending Users
        </Button>
        <Button
          onClick={() => handleTabSwitch('groups')}
          className={activeTab === 'groups' ? 'bg-blue-600 text-white' : ''}
        >
          Manage Groups
        </Button>
      </div>

      {/* Display Filters */}
      {activeTab === 'users' && (
        <div className="mb-4">
          <h2 className="font-semibold text-lg mb-2">Filter Users</h2>
          <div className="flex gap-4">
            {/* Search by Name */}
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

            {/* Search by Group */}
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

            {/* Search by Status */}
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

          {/* Button to Clear Filters */}
          <s onClick={clearFilters}>
            {/* Clear Filters */}
          </s>
        </div>
      )}

      {/* Display Users Tab Content */}
      {activeTab === 'users' && (
        <>
          {/* Button to Add User */}
          <Button onClick={handleAddUser} className="mb-4">
            Add User
          </Button>

          {/* Display Loading Spinner */}
          {loading && (
            <div className="flex justify-center items-center">
              <Loader2 className="animate-spin text-blue-500" size={24} />
            </div>
          )}

          {/* Display Error */}
          {error && (
            <div className="text-red-500 mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Display Filtered User Data in Table */}
          {!loading && !error && filteredUsers.length > 0 && (
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Email</th>
                  <th className="border p-2 text-left">Group</th>
                  <th className="border p-2 text-left">Status</th>
                  <th className="border p-2 text-left">Operation</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="border p-2">{user.name}</td>
                    <td className="border p-2">{user.email}</td>
                    <td className="border p-2">{getGroupName(user.groupId)}</td>
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

          {/* Display Message if No Users Found */}
          {!loading && !error && filteredUsers.length === 0 && (
            <div className="text-center text-gray-500">No users found</div>
          )}
        </>
      )}

      {/* Add Pending Users Tab Content */}
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

          {/* Add Filters for Pending Users Tab */}
          <div className="mb-4">
            <h2 className="font-semibold text-lg mb-2">Filter Pending Users</h2>
            <div className="flex gap-4">
              {/* Search by Name */}
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

              {/* Search by Group */}
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

              {/* Button to Clear Filters */}
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

          {/* Update the pendingUsers display to use filters */}
          {!loading && !error && pendingUsers.length > 0 && (
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Email</th>
                  <th className="border p-2 text-left">Group</th>
                  <th className="border p-2 text-left">Status</th>
                  <th className="border p-2 text-left">Operation</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers
                  .filter((user) => {
                    const matchesName = user.name.toLowerCase().includes(searchName.toLowerCase());
                    const matchesGroup = !searchGroup || getGroupName(user.groupId).toLowerCase().includes(searchGroup.toLowerCase());
                    return matchesName && matchesGroup;
                  })
                  .map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="border p-2">{user.name}</td>
                      <td className="border p-2">{user.email}</td>
                      <td className="border p-2">{getGroupName(user.groupId)}</td>
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

      {/* Display Groups Tab Content */}
      {activeTab === 'groups' && <ManageGroups />}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={() => fetchData()}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEdit={() => fetchData()}
        userData={selectedUser}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="py-4">
              Are you sure you want to delete <span className="font-semibold">{selectedUser?.name}</span>?
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
