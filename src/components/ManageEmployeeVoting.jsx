import React, { useState, useEffect, Fragment } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { Eye, Download, Trash2, X } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import * as employeeVotingService from '../services/employeeVoting';

function ManageEmployeeVoting() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [votingToDelete, setVotingToDelete] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedVoting, setSelectedVoting] = useState(null);
  const [votingData, setVotingData] = useState([]);
  
  // Fetch voting records on component mount
  useEffect(() => {
    const fetchVotingData = async () => {
      try {
        const records = await employeeVotingService.fetchVotingRecords();
        setVotingData(records);
      } catch (error) {
        toast.error('Failed to load voting records');
      }
    };
    fetchVotingData();
  }, []);

  // Filter data based on search
  const filteredData = votingData.filter(voting =>
    Object.values(voting).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Handle delete
  const handleDelete = (voting) => {
    setVotingToDelete(voting);
    setIsDeleteModalOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    try {
      await employeeVotingService.deleteVotingRecord(votingToDelete.id);
      setVotingData(prev => prev.filter(v => v.id !== votingToDelete.id));
      setIsDeleteModalOpen(false);
      toast.success('Voting record deleted successfully');
    } catch (error) {
      toast.error('Failed to delete voting record');
    }
  };

  // Handle view
  const handleView = async (voting) => {
    try {
      const details = await employeeVotingService.fetchVotingDetails(voting.id);
      setSelectedVoting(details);
      setIsViewModalOpen(true);
    } catch (error) {
      toast.error('Failed to load voting details');
    }
  };

  // Handle download
  const handleDownload = (voting) => {
    toast.success('Downloading voting data...');
  };

  // Add function to record a vote
  const recordVote = async (votingId, candidateId, criteriaId, points) => {
    try {
      await employeeVotingService.recordVote(votingId, candidateId, criteriaId, points);
      toast.success('Vote recorded successfully');
    } catch (error) {
      toast.error('Failed to record vote');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search voting records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 pl-10"
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

      {/* Voting Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voting Year</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Candidates</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Votes</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Winner</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Runner Up</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((voting) => (
              <tr key={voting.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{voting.year}</td>
                <td className="px-4 py-3">
                  {voting.period.fromDate} to {voting.period.toDate}
                </td>
                <td className="px-4 py-3">{voting.totalCandidates}</td>
                <td className="px-4 py-3">{voting.totalVotes}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    voting.status === 'Active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {voting.status}
                  </span>
                </td>
                <td className="px-4 py-3">{voting.winners.winner}</td>
                <td className="px-4 py-3">{voting.winners.runnerUp}</td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(voting)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(voting)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(voting)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={() => setIsDeleteModalOpen(false)}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-sm p-6 my-8 bg-white rounded-lg shadow-lg text-left align-middle">
                <Dialog.Title as="h3" className="text-lg font-semibold">
                  Confirm Delete
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm">Are you sure you want to delete this voting record? This action cannot be undone.</p>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button className="ml-2" variant="danger" onClick={handleDeleteConfirm}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* View Voting Details Modal */}
      <Transition appear show={isViewModalOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={() => setIsViewModalOpen(false)}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-lg p-6 my-8 bg-white rounded-lg shadow-lg text-left align-middle">
                <Dialog.Title as="h3" className="text-lg font-semibold">
                  Voting Details
                </Dialog.Title>
                <div className="mt-2">
                  {/* Render voting details here */}
                  <p className="text-sm">Details for voting record ID {selectedVoting?.id}</p>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Close
                  </Button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default ManageEmployeeVoting;
