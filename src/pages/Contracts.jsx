import React, { useState, useEffect, Fragment } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import {Search, Plus, Eye, Pencil, Trash2, Download, X, Loader2} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import AddContractModal from '../components/AddContractModal';
import EditContractModal from '../components/EditContractModal';
import PrintButton from "../components/reusable/Print";
import {usePermissionLogger} from "../utils/permissionLogger.js";

function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const logPermissions = usePermissionLogger('contracts')
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false
  })
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    contractNo: '',
    contractTitle: '',
    supplierPercentage: ''
  });
  const setFilter = (k, v) => setFilters((p) => ({ ...p, [k]: v }));
  const fetchPermissions = async ()=> {
    await setLoading(true);
    const currentPermissions =await logPermissions();
    await setPermissions(currentPermissions);
    await setLoading(false);
  }
  // Fetch contracts from API
  useEffect(() => {
    fetchPermissions();
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

  if(loading) {
    return(
        <div className="flex animate-spin animate justify-center items-center h-screen">
          <Loader2/>
        </div>
    )

  }

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
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = Object.values(contract).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (!matchesSearch) return false;

    // Contract No filter
    if (filters.contractNo && !contract.contract_no?.toString().toLowerCase().includes(filters.contractNo.toLowerCase())) {
      return false;
    }
    // Contract Title filter
    if (filters.contractTitle && !contract.contract_title?.toString().toLowerCase().includes(filters.contractTitle.toLowerCase())) {
      return false;
    }
    // Supplier Percentage filter (assumes completion_percentage or similar)
    if (filters.supplierPercentage) {
      const perc = Number(contract.completion_percentage ?? contract.supplierPercentage ?? '');
      const target = Number(filters.supplierPercentage);
      if (!Number.isNaN(target)) {
        if (Number.isNaN(perc) || perc < target) return false; // show >= target
      }
    }
    // Date range filter using start_date
    const fromOk = !filters.dateFrom || new Date(contract.start_date) >= new Date(filters.dateFrom);
    const toOk = !filters.dateTo || new Date(contract.contract_end_date ?? contract.end_date ?? contract.start_date) <= new Date(filters.dateTo);
    return fromOk && toOk;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentContracts = filteredContracts.slice(startIndex, startIndex + itemsPerPage);

  // Add contract
  const handleAddContract = async (newContract) => {
    try {
      // Log the FormData keys and values for debugging
      for (let pair of newContract.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await axiosInstance.post('/contracts', newContract, {
        headers: {
          'Content-Type': 'multipart/form-data', // Ensure the correct content type
        },
      });

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

  // Download contract file
  const handleDownload = async (contract) => {
    try {
      const response = await axiosInstance.get(`/contracts/${contract.id}`, {
        responseType: 'blob', // Important for downloading files
      });

      // Create a URL for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${contract.contract_no}.pdf`); // Set the file name
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Downloading contract file...');
    } catch (error) {
      toast.error('Failed to download contract file');
      console.error('Download error:', error);
    }
  };

  // Update the view modal content with the new detailed layout
  const renderContractDetails = (contract) => {
    if (!contract) return null;

    return (
      <div className="space-y-6">
        {/* Contract Information */}
        <div>
          <h3 className="text-lg font-medium border-b pb-2">Contract Information</h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm text-gray-500">Contract No</label>
              <p className="font-medium">{contract.contract_no}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Title</label>
              <p className="font-medium">{contract.contract_title}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Amount</label>
              <p className="font-medium">{contract.amount} {contract.currency}</p>
            </div>
          </div>
        </div>

        {/* Supplier Information */}
        <div>
          <h3 className="text-lg font-medium border-b pb-2">Supplier Information</h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm text-gray-500">Supplier</label>
              <p className="font-medium">{contract.supplier}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{contract.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Contract Administrator</label>
              <p className="font-medium">{contract.contract_administrator}</p>
            </div>
          </div>
        </div>

        {/* Contract Period */}
        <div>
          <h3 className="text-lg font-medium border-b pb-2">Contract Period</h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm text-gray-500">Start Date</label>
              <p className="font-medium">{contract.start_date}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">End Date</label>
              <p className="font-medium">{contract.contract_end_date}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Progress</label>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${calculateProgress(contract.start_date, contract.contract_end_date)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {calculateProgress(contract.start_date, contract.contract_end_date)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Update the actions renderer to display icons horizontally
  const renderActions = (contract) => (
    <div className="flex items-center space-x-1">

      <Button size="icon" variant="ghost" onClick={() => handleView(contract)}>
        <Eye className="h-4 w-4" />
      </Button>
      {permissions.canUpdate && (
          <Button size="icon" variant="ghost" onClick={() => handleEdit(contract)}>
            <Pencil className="h-4 w-4" />
          </Button>
      )}

      {permissions.canDelete && (<Button size="icon" variant="ghost" onClick={() => handleDelete(contract)}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>)}

      <Button
        size="icon"
        variant="ghost"
        onClick={() => handleDownload(contract)} // Call the download function
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-6">Manage Contracts</h1>

        {/* Search and Add */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          {permissions.canCreate && (
              <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Contract
              </Button>

          )}

        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="text-sm font-semibold mb-3">Search By</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Contract Date From</label>
              <Input type="date" value={filters.dateFrom} onChange={(e) => setFilter('dateFrom', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Contract Date To</label>
              <Input type="date" value={filters.dateTo} onChange={(e) => setFilter('dateTo', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Contract No</label>
              <Input type="text" placeholder="Enter Contract No" value={filters.contractNo} onChange={(e) => setFilter('contractNo', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Contract Title</label>
              <Input type="text" placeholder="Enter Contract Title" value={filters.contractTitle} onChange={(e) => setFilter('contractTitle', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Supplier Percentage</label>
              <Input type="number" placeholder=">= %" value={filters.supplierPercentage} onChange={(e) => setFilter('supplierPercentage', e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Button variant="outline" onClick={() => setFilters({ dateFrom: '', dateTo: '', contractNo: '', contractTitle: '', supplierPercentage: '' })}>View All</Button>
          </div>
        </div>

        {/* Contracts Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <PrintButton title=""><h2 className="text-lg font-semibold mb-2 text-center" style={{ color: 'black', marginBottom: '10px' }}>
            Contracts List
          </h2>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Contract No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 operation">Currency</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Contract Admin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">End Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium operation text-gray-500">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium operation text-gray-500">Actions</th>
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
                    <td className="px-4 py-3">{contract.amount}</td>
                    <td className="px-4 py-3 operation">{contract.currency}</td>
                    <td className="px-4 py-3">{contract.contract_administrator}</td>
                    <td className="px-4 py-3">{contract.start_date}</td>
                    <td className="px-4 py-3">{contract.contract_end_date}</td>
                    <td className="px-4 py-3">{contract.duration_of_contract}</td>
                    <td className="px-4 py-3 operation">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">{progress}%</span>
                    </td>
                    <td className="px-4 py-3 flex items-center operation space-x-1">
                      {renderActions(contract)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </PrintButton>
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
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={() => setIsViewModalOpen(false)}
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-xl font-bold">
                    Contract Details
                  </Dialog.Title>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {renderContractDetails(selectedContract)}

                <div className="flex justify-end mt-6 pt-4 border-t">
                  <Button onClick={() => setIsViewModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </div>
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
