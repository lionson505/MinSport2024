/* src/pages/ManageGroups.jsx */
import React, { useState, Fragment, useEffect } from 'react';
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
import { ActionButton } from '../components/ActionButton';
import { MODULE_IDS, ACTIONS } from '../constants/modules';
import { withRBAC } from '../hoc/withRBAC';

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

  // State to hold groups data fetched from the API
  const [groupsData, setGroupsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch groups data from the API
  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get('/groups');

      // Access the array of groups from the response
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setGroupsData(data);
    } catch (err) {
      setError('Failed to load groups data.');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Filter function for search term
  const filteredData = groupsData.filter(group =>
    Object.values(group).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage);

  const totalEntries = filteredData.length;
  const firstEntry = totalEntries === 0 ? 0 : startIndex + 1;
  const lastEntry = Math.min(startIndex + entriesPerPage, totalEntries);

  const handleEdit = (group) => {
    const groupToEdit = { ...group, permissions: group.permissions || {} };
    setSelectedGroup(groupToEdit);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (updatedGroup) => {
    try {
      const response = await axiosInstance.put(`/groups/${updatedGroup.id}`, updatedGroup);

      // Update the group data with the updated group
      setGroupsData(prev => 
        prev.map(group => group.id === updatedGroup.id ? response.data : group)
      );
      
      setIsEditModalOpen(false);
      toast.success('Group updated successfully');
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-6">Manage Groups</h1>

        <ActionButton
          moduleId={MODULE_IDS.USERS}
          action={ACTIONS.CREATE}
          onClick={handleAddGroup}
        >
          Add Group
        </ActionButton>

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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                    <th className="px-4 py-3 text-left text-xs font-medium operation text-gray-500 uppercase">Operation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedData.map((group) => (
                    <tr key={group.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{group.name}</td>
                      <td className="px-4 py-3">{group.accessibleModules}</td>
                      <td className="px-4 py-3">{group.users}</td>
                      <td className="px-4 py-3 operation" >
                        <div className="flex items-center space-x-2">
                          <ActionButton
                            moduleId={MODULE_IDS.USERS}
                            action={ACTIONS.UPDATE}
                            onClick={() => handleEdit(group)}
                          >
                            Edit Group
                          </ActionButton>
                          <ActionButton
                            moduleId={MODULE_IDS.USERS}
                            action={ACTIONS.DELETE}
                            onClick={() => handleDelete(group)}
                          >
                            Delete Group
                          </ActionButton>
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
    </div>
  );
}

export default withRBAC(ManageGroups, MODULE_IDS.USERS);
