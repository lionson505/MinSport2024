// src/components/StudentTransferForm.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance'; // Ensure this path is correct
import { Button } from './ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { AlertCircle, Eye, Search, Calendar, ArrowRight, Users, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

const StudentTransferForm = ({ schools = [], students = [], isLoading, isSubmitting, setIsSubmitting }) => {
  const [fromSchool, setFromSchool] = useState('');
  const [transferStudent, setTransferStudent] = useState('');
  const [toSchool, setToSchool] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Transfer history states
  const [transfers, setTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [showTransferDetails, setShowTransferDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const validStudents = Array.isArray(students) ? students : [];

  // Filter students based on the selected institution (fromSchool)
  const filteredStudents = validStudents.filter(student => {
    return student.institutionId === parseInt(fromSchool);
  });

  // Load transfer history
  const loadTransfers = async () => {
    setTransfersLoading(true);
    try {
      const response = await axiosInstance.get('/students/transfers');
      const transfersData = response?.data?.data || [];
      setTransfers(transfersData);
      setFilteredTransfers(transfersData);
    } catch (error) {
      console.error('Error loading transfers:', error);
      toast.error('Failed to load transfer history');
    } finally {
      setTransfersLoading(false);
    }
  };

  // Load transfers on component mount
  useEffect(() => {
    loadTransfers();
  }, []);

  // Handle search
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    if (!searchValue) {
      setFilteredTransfers(transfers);
      return;
    }

    const filtered = transfers.filter(transfer => {
      const student = transfer.student;
      const fromInstitution = transfer.fromInstitution;
      const toInstitution = transfer.toInstitution;
      
      return (
        student?.firstName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        student?.lastName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        fromInstitution?.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        toInstitution?.name?.toLowerCase().includes(searchValue.toLowerCase())
      );
    });
    
    setFilteredTransfers(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransfers = filteredTransfers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage);

  const handleViewTransferDetails = (transfer) => {
    setSelectedTransfer(transfer);
    setShowTransferDetails(true);
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!fromSchool) {
      setErrorMessage('Please select the school from which the student is transferring.');
      return;
    }
    if (!transferStudent) {
      setErrorMessage('Please select a student to transfer.');
      return;
    }
    if (!toSchool) {
      setErrorMessage('Please select the destination school.');
      return;
    }
    if (!transferDate) {
      setErrorMessage('Please select a transfer date.');
      return;
    }
    setErrorMessage('');
    setShowTransferConfirm(true);
  };

  const processTransfer = async () => {
    setIsSubmitting(true);

    try {
      const fromSchoolData = schools.find(school => school.id === parseInt(fromSchool));
      const toSchoolData = schools.find(school => school.id === parseInt(toSchool));

      if (!fromSchoolData || !toSchoolData) {
        throw new Error('School data not found');
      }

      const transferData = {
        studentId: parseInt(transferStudent),
        fromInstitutionId: fromSchoolData.id,
        toInstitutionId: toSchoolData.id,
        transferDate: new Date(transferDate).toISOString(),
      };

      console.log('Transfer Data:', transferData);

      const response = await axiosInstance.post('/students/transfers', transferData);
      console.log('Transfer Response:', response.data);
      
      setShowTransferConfirm(false);
      
      // Reset form
      setFromSchool('');
      setTransferStudent('');
      setToSchool('');
      setTransferDate('');
      
      toast.success('Transfer processed successfully!');
      
      // Refresh transfer history
      await loadTransfers();
    } catch (error) {
      console.error('Error processing transfer:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to process transfer. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="transition-all duration-300 ease-in-out space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Student Transfer Form</h2>

        <form onSubmit={handleTransferSubmit} className="space-y-6">
          {errorMessage && (
            <div className="text-red-500 text-sm mb-4">
              {errorMessage}
            </div>
          )}
          {/* Source School */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School From <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={fromSchool}
              onChange={(e) => setFromSchool(e.target.value)}
              required
            >
              <option value="">Select School</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={transferStudent}
              onChange={(e) => setTransferStudent(e.target.value)}
              required
              disabled={!fromSchool || isLoading}
            >
              <option value="">
                {isLoading
                  ? 'Loading students...'
                  : fromSchool
                    ? 'Select Student'
                    : 'Select school first'
                }
              </option>
              {filteredStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} - {student.class}
                </option>
              ))}
            </select>
          </div>

          {/* Destination School */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School To <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={toSchool}
              onChange={(e) => setToSchool(e.target.value)}
              required
              disabled={!transferStudent}
            >
              <option value="">Select School</option>
              {schools
                .filter(school => school.id !== parseInt(fromSchool))
                .map(school => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))
              }
            </select>
          </div>

          {/* Transfer Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transfer Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting || !fromSchool || !transferStudent || !toSchool || !transferDate}
            >
              {isSubmitting ? 'Processing...' : 'Process Transfer'}
            </Button>
          </div>
        </form>
      </div>

      {/* Transfer History Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Transfer History</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {filteredTransfers.length} transfers
            </span>
          </div>
          <Button
            onClick={loadTransfers}
            variant="outline"
            className="flex items-center gap-2"
            disabled={transfersLoading}
          >
            <Calendar className="h-4 w-4" />
            {transfersLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by student name or school..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Transfer Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Transfers</p>
                <p className="text-2xl font-bold text-blue-600">{transfers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-green-600">
                  {transfers.filter(t => {
                    const transferDate = new Date(t.transferDate);
                    const now = new Date();
                    return transferDate.getMonth() === now.getMonth() && 
                           transferDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Active Schools</p>
                <p className="text-2xl font-bold text-orange-600">
                  {new Set([
                    ...transfers.map(t => t.fromInstitution?.name),
                    ...transfers.map(t => t.toInstitution?.name)
                  ].filter(Boolean)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transfer History Table */}
        {transfersLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Loading transfer history...</div>
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No transfers found matching your search.' : 'No transfers recorded yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Student</TableHead>
                    <TableHead className="min-w-[150px]">From School</TableHead>
                    <TableHead className="min-w-[150px]">To School</TableHead>
                    <TableHead className="min-w-[120px]">Transfer Date</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTransfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">
                            {transfer.student?.firstName} {transfer.student?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {transfer.student?.idPassportNo}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>{transfer.fromInstitution?.name || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{transfer.toInstitution?.name || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {new Date(transfer.transferDate).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleViewTransferDetails(transfer)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTransfers.length)} of {filteredTransfers.length} transfers
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transfer Confirmation Dialog */}
      <Dialog open={showTransferConfirm} onOpenChange={setShowTransferConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Confirm Transfer
            </DialogTitle>
            <DialogDescription className="py-4">
              <div className="space-y-4">
                <p>Please confirm the following transfer:</p>
                <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                  <p>
                    <span className="font-semibold">Student:</span>{' '}
                    {filteredStudents.find(s => s.id === parseInt(transferStudent))?.firstName} {filteredStudents.find(s => s.id === parseInt(transferStudent))?.lastName}
                  </p>
                  <p>
                    <span className="font-semibold">From:</span>{' '}
                    {schools.find(s => s.id === parseInt(fromSchool))?.name}
                  </p>
                  <p>
                    <span className="font-semibold">To:</span>{' '}
                    {schools.find(s => s.id === parseInt(toSchool))?.name}
                  </p>
                  <p>
                    <span className="font-semibold">Transfer Date:</span>{' '}
                    {new Date(transferDate).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  This action will transfer all student records to the new school.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowTransferConfirm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={processTransfer}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Transfer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Details Modal */}
      <Dialog open={showTransferDetails} onOpenChange={setShowTransferDetails}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Transfer Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedTransfer && (
            <div className="space-y-6 py-4">
              {/* Transfer Overview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Transfer Overview</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <p className="text-sm font-medium">{selectedTransfer.fromInstitution?.name}</p>
                    <p className="text-xs text-gray-500">From</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <p className="text-sm font-medium">{selectedTransfer.toInstitution?.name}</p>
                    <p className="text-xs text-gray-500">To</p>
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Student Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="mt-1 font-medium">
                      {selectedTransfer.student?.firstName} {selectedTransfer.student?.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">ID/Passport No</label>
                    <p className="mt-1">{selectedTransfer.student?.idPassportNo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Gender</label>
                    <p className="mt-1">{selectedTransfer.student?.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Class</label>
                    <p className="mt-1">{selectedTransfer.student?.class}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nationality</label>
                    <p className="mt-1">{selectedTransfer.student?.nationality}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Type of Game</label>
                    <p className="mt-1">{selectedTransfer.student?.typeOfGame}</p>
                  </div>
                </div>
              </div>

              {/* Transfer Details */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Transfer Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Transfer Date</label>
                    <p className="mt-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(selectedTransfer.transferDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Transfer ID</label>
                    <p className="mt-1 font-mono text-sm">#{selectedTransfer.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created At</label>
                    <p className="mt-1 text-sm">
                      {new Date(selectedTransfer.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Institution Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">From Institution</h4>
                  <div className="bg-red-50 p-3 rounded-lg space-y-2">
                    <p className="font-medium">{selectedTransfer.fromInstitution?.name}</p>
                    <p className="text-sm text-gray-600">{selectedTransfer.fromInstitution?.category}</p>
                    <p className="text-sm text-gray-600">
                      {selectedTransfer.fromInstitution?.location_province}, {selectedTransfer.fromInstitution?.location_district}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">To Institution</h4>
                  <div className="bg-green-50 p-3 rounded-lg space-y-2">
                    <p className="font-medium">{selectedTransfer.toInstitution?.name}</p>
                    <p className="text-sm text-gray-600">{selectedTransfer.toInstitution?.category}</p>
                    <p className="text-sm text-gray-600">
                      {selectedTransfer.toInstitution?.location_province}, {selectedTransfer.toInstitution?.location_district}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={() => setShowTransferDetails(false)}
              variant="outline"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentTransferForm;
