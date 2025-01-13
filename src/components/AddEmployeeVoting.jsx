import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/Button';
import { Search, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

function AddEmployeeVoting() {
  const [votingYear, setVotingYear] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [criteria, setCriteria] = useState([{ name: '', points: '' }]);
  const [loading, setLoading] = useState(false);

  // Mock employees data (this would come from your API)
  const [employees, setEmployees] = useState([
    { id: 1, firstName: 'Adrie', lastName: 'MUREKATETE', picture: null },
    { id: 2, firstName: 'Adrien', lastName: 'BIMENYIMANA', picture: null },
    // ... add all other employees
  ]);

  // Filtered employees based on search
  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!votingYear || !fromDate || !toDate) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (selectedCandidates.length < 2) {
      toast.error('Please select at least 2 candidates');
      setLoading(false);
      return;
    }

    if (criteria.some(c => !c.name || !c.points)) {
      toast.error('Please fill in all criteria fields');
      setLoading(false);
      return;
    }

    // Submit data
    const votingData = {
      votingYear,
      period: { fromDate, toDate },
      candidates: selectedCandidates,
      criteria
    };

    // console.log('Submitting:', votingData);
    toast.success('Voting created successfully');
    setLoading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Add Employee Voting</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Voting Period Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Voting Period</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Voting Year</label>
              <Input
                type="text"
                placeholder="Ex:- 2023 - 2024"
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

        {/* Candidates Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Candidates</h3>
          
          {/* Search Employees */}
          <div className="relative mb-4">
            <Input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>

          {/* Search Results */}
          {searchTerm && (
            <div className="mb-4 max-h-60 overflow-y-auto border rounded-lg">
              {filteredEmployees.map(employee => (
                <div
                  key={employee.id}
                  className="p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={() => handleSelectCandidate(employee)}
                >
                  <div className="flex items-center gap-2">
                    {employee.picture ? (
                      <img
                        src={employee.picture}
                        alt={`${employee.firstName} ${employee.lastName}`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {employee.firstName[0]}
                      </div>
                    )}
                    <span>{employee.firstName} {employee.lastName}</span>
                  </div>
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
              ))}
            </div>
          )}

          {/* Selected Candidates */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No.</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Picture</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedCandidates.map((candidate, index) => (
                  <tr key={candidate.id}>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{candidate.firstName}</td>
                    <td className="px-4 py-2">{candidate.lastName}</td>
                    <td className="px-4 py-2">
                      {candidate.picture ? (
                        <img
                          src={candidate.picture}
                          alt={`${candidate.firstName} ${candidate.lastName}`}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {candidate.firstName[0]}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveCandidate(candidate.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Voting'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AddEmployeeVoting; 