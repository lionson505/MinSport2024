import React, { useState, useEffect, Fragment } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import AddContractModal from '../components/AddContractModal';
import EditContractModal from '../components/EditContractModal';

function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { isDarkMode } = useTheme();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  // Fetch contracts from API
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await axiosInstance.get('/contracts');
        setContracts(response.data);
      } catch (error) {
        toast.error('Failed to fetch contracts');
        console.error('Fetch error:', error);
      }
    };

    fetchContracts();
  }, []);

  // Calculate contract progress
  function calculateProgress(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (today < start) return 0;
    if (today > end) return 100;

    const total = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  }

  // Filter contracts by search term
  const filteredContracts = contracts.filter(contract =>
    Object.values(contract).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentContracts = filteredContracts.slice(startIndex, startIndex + itemsPerPage);

  // Add contract
  const handleAddContract = async (newContract) => {
    try {
      const response = await axiosInstance.post('/contracts', newContract);
      setContracts(prevContracts => [...prevContracts, response.data]);
      setIsAddModalOpen(false);
      toast.success('Contract added successfully');
    } catch (error) {
      toast.error('Failed to add contract');
      console.error('Add error:', error);
    }
  };

  // View contract
  const handleView = (contract) => {
    setSelectedContract(contract);
    setIsViewModalOpen(true);
  };

  // Edit contract
  const handleEdit = (contract) => {
    setSelectedContract(contract);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (updatedContract) => {
    try {
      const response = await axiosInstance.put(`/contracts/${updatedContract.id}`, updatedContract);
      setContracts(prevContracts =>
        prevContracts.map(contract => (contract.id === updatedContract.id ? response.data : contract))
      );
      setIsEditModalOpen(false);
      toast.success('Contract updated successfully');
    } catch (error) {
      toast.error('Failed to update contract');
      console.error('Edit error:', error);
    }
  };

  // Delete contract
  const handleDelete = (contract) => {
    setSelectedContract(contract);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/contracts/${selectedContract.id}`);
      setContracts(prevContracts => prevContracts.filter(contract => contract.id !== selectedContract.id));
      setIsDeleteModalOpen(false);
      toast.success('Contract deleted successfully');
    } catch (error) {
      toast.error('Failed to delete contract');
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-6">Manage Contracts</h1>

        {/* Search and Add */}
        <div className="flex justify-between items-center mb-6">
          <Input
            type="text"
            placeholder="Search contracts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contract
          </Button>
        </div>

        {/* Contracts Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Contract No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Currency</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Contract Admin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">End Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentContracts.map(contract => {
                const progress = calculateProgress(contract.start_date, contract.contract_end_date);
                return (
                  <tr key={contract.id}>
                    <td className="px-4 py-3">{contract.contract_no}</td>
                    <td className="px-4 py-3">{contract.contract_title}</td>
                    <td className="px-4 py-3">{contract.supplier}</td>
                    <td className="px-4 py-3">{contract.email}</td>
                    <td className="px-4 py-3">{contract.amount}</td>
                    <td className="px-4 py-3">{contract.currency}</td>
                    <td className="px-4 py-3">{contract.contract_administrator}</td>
                    <td className="px-4 py-3">{contract.start_date}</td>
                    <td className="px-4 py-3">{contract.contract_end_date}</td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">{progress}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost" onClick={() => handleView(contract)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(contract)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(contract)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contract Modal */}
      <AddContractModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddContract}
      />

      {/* Edit Contract Modal */}
      <EditContractModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEdit={handleEditSubmit}
        contractData={selectedContract} // Pass the selected contract data to the modal
      />

      {/* View Modal */}
      <Transition appear show={isViewModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsViewModalOpen(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="fixed inset-0 flex items-center justify-center">
            <Dialog.Panel className="bg-white p-6 rounded-lg shadow-xl">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                Contract Details
              </Dialog.Title>
              <div className="mt-4">
                <p>Title: {selectedContract?.contract_title}</p>
                <p>Supplier: {selectedContract?.supplier}</p>
                <p>Email: {selectedContract?.email}</p>
                <p>Amount: {selectedContract?.amount}</p>
                <p>Currency: {selectedContract?.currency}</p>
                <p>Contract Administrator: {selectedContract?.contract_administrator}</p>
                <p>Start Date: {selectedContract?.start_date}</p>
                <p>End Date: {selectedContract?.contract_end_date}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setIsViewModalOpen(false)} variant="ghost">
                  Close
                </Button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDeleteModalOpen(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="fixed inset-0 flex items-center justify-center">
            <Dialog.Panel className="bg-white p-6 rounded-lg shadow-xl">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                Confirm Deletion
              </Dialog.Title>
              <div className="mt-4">
                <p>Are you sure you want to delete this contract?</p>
              </div>
              <div className="mt-4 flex justify-end space-x-4">
                <Button onClick={() => setIsDeleteModalOpen(false)} variant="ghost">
                  Cancel
                </Button>
                <Button onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">
                  Delete
                </Button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default Contracts;
