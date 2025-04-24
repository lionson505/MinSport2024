import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/Button';
import { Search, Plus, Trash2, Edit, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

function AddEmployeeVoting() {
  // Voting Period States
  const [votingPeriods, setVotingPeriods] = useState([]);
  const [votingYear, setVotingYear] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [criteria, setCriteria] = useState([{ name: '', points: '' }]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('periods'); // 'periods' or 'votings'
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Modal States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailPeriod, setDetailPeriod] = useState(null);
  const [detailVotings, setDetailVotings] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Employee Voting States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeVotings, setEmployeeVotings] = useState([]);

  // Fetch voting periods on component mount
  useEffect(() => {
    fetchVotingPeriods();
    fetchEmployees();
  }, []);

  // Fetch voting periods from API
  const fetchVotingPeriods = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}voting/periods`);
      // Ensure votingPeriods is always an array
      setVotingPeriods(Array.isArray(response.data) ? response.data : 
                      Array.isArray(response.data.votingPeriods) ? response.data.votingPeriods : []);
    } catch (error) {
      console.error('Error fetching voting periods:', error);
      toast.error('Failed to fetch voting periods');
      // Set empty array on error
      setVotingPeriods([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}employees`);
      // Ensure employees is always an array
      setEmployees(Array.isArray(response.data) ? response.data : 
                  Array.isArray(response.data.employees) ? response.data.employees : []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
      // Set empty array on error
      setEmployees([]);
    }
  };

  // Fetch employee votings for a specific period
  const fetchEmployeeVotings = async (periodId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}voting/employee-votings/by-period/${periodId}`);
      // Ensure employeeVotings is always an array
      setEmployeeVotings(Array.isArray(response.data.employeeVotings) ? response.data.employeeVotings : []);
      setSelectedPeriod(response.data.votingPeriod || null);
    } catch (error) {
      console.error('Error fetching employee votings:', error);
      toast.error('Failed to fetch employee votings');
      // Set empty array on error
      setEmployeeVotings([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle criteria changes
  const handleCriteriaChange = (index, field, value) => {
    const newCriteria = [...criteria];
    newCriteria[index][field] = value;
    setCriteria(newCriteria);
  };

  // Add new criteria
  const addCriteria = () => {
    setCriteria([...criteria, { name: '', points: '' }]);
  };

  // Remove criteria
  const removeCriteria = (index) => {
    const newCriteria = criteria.filter((_, i) => i !== index);
    setCriteria(newCriteria);
  };

  // Reset form
  const resetForm = () => {
    setVotingYear('');
    setFromDate('');
    setToDate('');
    setCriteria([{ name: '', points: '' }]);
    setIsEditing(false);
    setEditId(null);
  };

  // Handle voting period form submission
  const handlePeriodSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!votingYear || !fromDate || !toDate) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (criteria.some(c => !c.name || !c.points)) {
      toast.error('Please fill in all criteria fields');
      setLoading(false);
      return;
    }

    // Format criteria as JSON
    const criteriaJson = criteria.reduce((acc, curr) => {
      acc[curr.name] = parseInt(curr.points);
      return acc;
    }, {});

    // Prepare data
    const votingPeriodData = {
      voting_year: parseInt(votingYear),
      from_date: fromDate,
      to_date: toDate,
      criteria: criteriaJson
    };

    try {
      if (isEditing) {
        // Update existing voting period
        await axios.put(`${API_URL}voting/periods/${editId}`, votingPeriodData);
        toast.success('Voting period updated successfully');
      } else {
        // Create new voting period
        await axios.post(`${API_URL}voting/periods`, votingPeriodData);
        toast.success('Voting period created successfully');
      }
      
      // Refresh voting periods
      fetchVotingPeriods();
      resetForm();
    } catch (error) {
      console.error('Error saving voting period:', error);
      toast.error('Failed to save voting period');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit voting period
  const handleEditPeriod = (period) => {
    setVotingYear(period.voting_year.toString());
    setFromDate(period.from_date.split('T')[0]);
    setToDate(period.to_date.split('T')[0]);
    
    // Convert criteria JSON to array format
    const criteriaArray = Object.entries(period.criteria).map(([name, points]) => ({
      name,
      points: points.toString()
    }));
    
    setCriteria(criteriaArray.length > 0 ? criteriaArray : [{ name: '', points: '' }]);
    setIsEditing(true);
    setEditId(period.id);
    setActiveTab('periods');
  };

  // Handle delete voting period
  const handleDeletePeriod = async (id) => {
    if (window.confirm('Are you sure you want to delete this voting period?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}voting/periods/${id}`);
        toast.success('Voting period deleted successfully');
        fetchVotingPeriods();
      } catch (error) {
        console.error('Error deleting voting period:', error);
        toast.error('Failed to delete voting period');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle view voting details
  const handleViewVotings = async (period) => {
    setDetailPeriod(period);
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}voting/employee-votings/by-period/${period.id}`);
      setDetailVotings(Array.isArray(response.data.employeeVotings) ? response.data.employeeVotings : []);
    } catch (error) {
      console.error('Error fetching voting details:', error);
      toast.error('Failed to fetch voting details');
      setDetailVotings([]);
    } finally {
      setDetailLoading(false);
    }
  };

  // Close detail modal
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setDetailPeriod(null);
    setDetailVotings([]);
  };

  // Filtered employees based on search
  const filteredEmployees = Array.isArray(employees) ? 
    employees.filter(emp => 
      `${emp.firstname} ${emp.lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

  // Handle candidate selection
  const handleSelectCandidate = (employee) => {
    if (selectedCandidates.find(c => c.id === employee.id)) {
      toast.error('Candidate already selected');
      return;
    }
    setSelectedCandidates([...selectedCandidates, employee]);
    setSearchTerm('');
  };

  // Handle candidate removal
  const handleRemoveCandidate = (candidateId) => {
    setSelectedCandidates(selectedCandidates.filter(c => c.id !== candidateId));
  };

  // Handle employee voting form submission
  const handleVotingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!selectedPeriod) {
      toast.error('Please select a voting period');
      setLoading(false);
      return;
    }

    if (selectedCandidates.length === 0) {
      toast.error('Please select at least one candidate');
      setLoading(false);
      return;
    }

    try {
      // Create employee voting for each selected candidate
      for (const candidate of selectedCandidates) {
        const votingData = {
          voting_period_id: selectedPeriod.id,
          employee_id: candidate.id,
          criteria: {} // This would be filled with actual voting criteria
        };
        
        await axios.post(`${API_URL}voting/employee-votings`, votingData);
      }
      
      toast.success('Employee votings created successfully');
      fetchEmployeeVotings(selectedPeriod.id);
      setSelectedCandidates([]);
    } catch (error) {
      console.error('Error creating employee votings:', error);
      toast.error('Failed to create employee votings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Employee Voting Management</h2>

      {/* Detail Modal */}
      {isDetailModalOpen && detailPeriod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  Voting Period Details: {detailPeriod.voting_year}
                </h3>
                <button 
                  onClick={closeDetailModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Period Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">ID:</span> {detailPeriod.id}</p>
                    <p><span className="font-medium">Year:</span> {detailPeriod.voting_year}</p>
                    <p><span className="font-medium">From:</span> {new Date(detailPeriod.from_date).toLocaleDateString()}</p>
                    <p><span className="font-medium">To:</span> {new Date(detailPeriod.to_date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Criteria</h4>
                  <div className="space-y-2">
                    {Object.entries(detailPeriod.criteria).map(([name, points], index) => (
                      <p key={index}>
                        <span className="font-medium">{name}:</span> {points} points
                      </p>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Employee Votings</h4>
                {detailLoading ? (
                  <div className="text-center py-4">Loading votings...</div>
                ) : detailVotings.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No votings found for this period</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {detailVotings.map((voting) => (
                          <tr key={voting.id}>
                            <td className="px-4 py-2">{voting.id}</td>
                            <td className="px-4 py-2">
                              {voting.employee ? `${voting.employee.firstname} ${voting.employee.lastname}` : 'N/A'}
                            </td>
                            <td className="px-4 py-2">
                              {new Date(voting.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={closeDetailModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voting Period Form */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">
          {isEditing ? 'Edit Voting Period' : 'Add New Voting Period'}
        </h3>
        <form onSubmit={handlePeriodSubmit} className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Voting Year</label>
                <Input
                  type="number"
                  placeholder="e.g., 2024"
                  value={votingYear}
                  onChange={(e) => setVotingYear(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">From Date</label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To Date</label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Criteria Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Criteria</h3>
              <Button
                type="button"
                onClick={addCriteria}
                variant="outline"
              >
                Add Criteria
              </Button>
            </div>

            <div className="space-y-4">
              {criteria.map((criterion, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Criteria Name</label>
                    <Input
                      type="text"
                      value={criterion.name}
                      onChange={(e) => handleCriteriaChange(index, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium mb-1">Points</label>
                    <Input
                      type="number"
                      value={criterion.points}
                      onChange={(e) => handleCriteriaChange(index, 'points', e.target.value)}
                      required
                      min="0"
                    />
                  </div>
                  {criteria.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCriteria(index)}
                      className="mt-7 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            {isEditing && (
              <Button
                type="button"
                className="mr-2 bg-gray-500 hover:bg-gray-600 text-white"
                onClick={resetForm}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditing ? 'Update Voting Period' : 'Create Voting Period'}
            </Button>
          </div>
        </form>
      </div>

      {/* Voting Periods Table */}
      <div>
        <h3 className="text-lg font-medium mb-4">Voting Periods</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">From Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">To Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Criteria</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!Array.isArray(votingPeriods) || votingPeriods.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                    No voting periods found
                  </td>
                </tr>
              ) : (
                votingPeriods.map((period) => (
                  <tr key={period.id}>
                    <td className="px-4 py-2">{period.id}</td>
                    <td className="px-4 py-2">{period.voting_year}</td>
                    <td className="px-4 py-2">{new Date(period.from_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{new Date(period.to_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <div className="max-w-xs overflow-hidden text-ellipsis">
                        {Object.keys(period.criteria).join(', ')}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPeriod(period)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleViewVotings(period)}
                          className="text-green-600 hover:text-green-800"
                          title="View Votings"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeletePeriod(period.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AddEmployeeVoting; 