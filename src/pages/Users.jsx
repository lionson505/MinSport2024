import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Plus, Search, Filter, MoreVertical, Loader2, 
  AlertTriangle, UserPlus, Users as UsersIcon,
  CheckCircle, XCircle 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AddUserModal from '../components/AddUserModal';
import EditUserModal from '../components/EditUserModal';
import ManageGroups from '@/components/ManageGroups';
import { groupService } from '../services/groupService';
import axiosInstance from '../utils/axiosInstance';
import { Label } from "@/components/ui/label";
import { usePermissions } from '../hooks/usePermissions';
import { PermissionGuard } from '../components/PermissionGuard';

function Users() {
  const { canView, canCreate, canEdit, canDelete } = usePermissions();
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    group: 'all'
  });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [isAssignGroupModalOpen, setIsAssignGroupModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [assigningGroup, setAssigningGroup] = useState(false);

  // Module IDs (you can move these to a constants file)
  const MODULES = {
    USERS: 1,
    GROUPS: 2
  };

  // Fetch users and groups data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get all users and filter by status
        const usersResponse = await axiosInstance.get('/users');
        const allUsers = usersResponse.data;

        // Split users into pending and approved based on emailVerified status
        setPendingUsers(allUsers.filter(user => !user.emailVerified));
        setApprovedUsers(allUsers.filter(user => user.emailVerified));

        // Get groups
        const groupsResponse = await groupService.getGroups();
        setGroups(groupsResponse.data || []);
      } catch (error) {
        setError('Failed to fetch data');
        toast.error('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = Object.values(user).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesStatus = filters.status === 'all' || user.active === (filters.status === 'active');
    const matchesGroup = filters.group === 'all' || user.groupId === filters.group;

    return matchesSearch && matchesStatus && matchesGroup;
  });

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
      await axiosInstance.delete(`/users/${selectedUser.id}`);
      setUsers(users.filter(u => u.id !== selectedUser.id));
      toast.success('User deleted successfully');
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleApproveUser = async (user) => {
    try {
      // Update user status using the PUT endpoint with correct format
      await axiosInstance.put(`/users/${user.id}`, {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        gender: user.gender,
        active: true,
        emailVerified: true,
        groupId: user.userGroup?.id || null
      });

      // Update local state
      setPendingUsers(prev => prev.filter(u => u.id !== user.id));
      setApprovedUsers(prev => [...prev, { 
        ...user, 
        emailVerified: true, 
        active: true 
      }]);
      toast.success('User approved successfully');
    } catch (error) {
      console.error('Error approving user:', error);
      const errorMessage = error.message || 'Failed to approve user';
      toast.error(errorMessage);
    }
  };

  const handleRejectUser = async (user) => {
    try {
      // Delete user using the DELETE endpoint
      await axiosInstance.delete(`/users/${user.id}`);
      setPendingUsers(prev => prev.filter(u => u.id !== user.id));
      toast.success('User rejected successfully');
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user');
    }
  };

  const handleAssignGroup = (user) => {
    setSelectedUser(user);
    setSelectedGroupId(user.userGroup?.id || '');
    setIsAssignGroupModalOpen(true);
  };

  const handleGroupAssignment = async () => {
    if (!selectedUser || !selectedGroupId) return;
    
    try {
      setAssigningGroup(true);
      // Update to match API schema
      await axiosInstance.put(`/users/${selectedUser.id}`, {
        name: `${selectedUser.firstName} ${selectedUser.lastName}`,
        email: selectedUser.email,
        gender: selectedUser.gender,
        active: selectedUser.active,
        emailVerified: selectedUser.emailVerified,
        groupId: Number(selectedGroupId)
      });
      
      // Update local state
      setApprovedUsers(prev => prev.map(u => {
        if (u.id === selectedUser.id) {
          return {
            ...u,
            userGroup: {
              id: Number(selectedGroupId),
              name: groups.find(g => g.id === Number(selectedGroupId))?.name
            }
          };
        }
        return u;
      }));
      
      toast.success('Group assigned successfully');
      setIsAssignGroupModalOpen(false);
    } catch (error) {
      console.error('Error assigning group:', error);
      const errorMessage = error.message || 'Failed to assign group';
      toast.error(errorMessage);
    } finally {
      setAssigningGroup(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <PermissionGuard moduleId={MODULES.USERS} action="Read">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Pending Users
                {pendingUsers.length > 0 && (
                  <Badge variant="destructive">{pendingUsers.length}</Badge>
                )}
              </TabsTrigger>
            </PermissionGuard>

            <PermissionGuard moduleId={MODULES.USERS} action="Read">
              <TabsTrigger value="approved">
                <UsersIcon className="h-4 w-4 mr-2" />
                Approved Users
              </TabsTrigger>
            </PermissionGuard>

            <PermissionGuard moduleId={MODULES.GROUPS} action="Read">
              <TabsTrigger value="groups">
                <UserPlus className="h-4 w-4 mr-2" />
                Groups
              </TabsTrigger>
            </PermissionGuard>
          </TabsList>

          <PermissionGuard 
            moduleId={MODULES.USERS} 
            action="Create"
            fallback={
              <Button disabled variant="outline">
                No Permission to Add Users
              </Button>
            }
          >
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </PermissionGuard>
        </div>

        <TabsContent value="pending">
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {showAdvancedSearch ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {showAdvancedSearch && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="w-full rounded-md border-gray-300"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Group</label>
                  <select
                    className="w-full rounded-md border-gray-300"
                    value={filters.group}
                    onChange={(e) => setFilters(prev => ({ ...prev, group: e.target.value }))}
                  >
                    <option value="all">All Groups</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Pending Users Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Registration Reason</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingUsers.map(user => (
                    <tr key={user.id}>
                      <td className="px-4 py-3">{user.firstName} {user.lastName}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.phoneNumber}</td>
                      <td className="px-4 py-3">{user.reasonForRegistration}</td>
                      <td className="px-4 py-3 text-right">
                        <PermissionGuard moduleId={MODULES.USERS} action="Update">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => handleApproveUser(user)}
                              variant="ghost"
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </Button>
                            <Button
                              onClick={() => handleRejectUser(user)}
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-5 w-5" />
                            </Button>
                          </div>
                        </PermissionGuard>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search approved users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Approved Users Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Current Group</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {approvedUsers.map(user => (
                    <tr key={user.id}>
                      <td className="px-4 py-3">{user.firstName} {user.lastName}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.phoneNumber}</td>
                      <td className="px-4 py-3">
                        {user.userGroup?.name || 'No Group Assigned'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAssignGroup(user)}>
                              Assign Group
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user)}
                              className="text-red-600">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="groups">
          <ManageGroups />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        groups={groups}
        onAdd={(newUser) => {
          setUsers(prev => [...prev, newUser]);
          toast.success('User added successfully');
        }}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        groups={groups}
        onEdit={(updatedUser) => {
          setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
          toast.success('User updated successfully');
        }}
      />

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignGroupModalOpen} onOpenChange={setIsAssignGroupModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Group to User</DialogTitle>
            <DialogDescription>
              Select a group to assign to {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Group</Label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full rounded-md border-gray-300"
              >
                <option value="">Select a group...</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAssignGroupModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGroupAssignment} disabled={!selectedGroupId || assigningGroup}>
              {assigningGroup ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Group'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Users;
