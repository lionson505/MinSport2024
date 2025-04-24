import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import toast from 'react-hot-toast';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

function UpdateEmployeeVoting() {
  const { votingId } = useParams();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('employeeId');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [votingData, setVotingData] = useState(null);
  const [formData, setFormData] = useState([]); // Changed to array to store new criteria

  useEffect(() => {
    fetchVotingData();
  }, [votingId]);

  const fetchVotingData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}voting/employee-votings/${votingId}`);
      
      if (response.data && response.data.employeeVoting) {
        const voting = response.data.employeeVoting;
        setVotingData(voting);
        
        // Get the voting period to fetch its criteria
        const periodResponse = await axios.get(`${API_URL}voting/periods/${voting.voting_period_id}`);
        if (periodResponse.data && periodResponse.data.votingPeriod) {
          const period = periodResponse.data.votingPeriod;
          
          // Initialize form data with existing criteria names and empty points
          const initialFormData = Object.entries(period.criteria || {}).map(([name, maxPoints]) => ({
            name,
            maxPoints,
            points: '' // Empty points for user to fill
          }));
          
          setFormData(initialFormData);
        }
      } else {
        toast.error('Voting data not found');
      }
    } catch (error) {
      console.error('Error fetching voting data:', error);
      toast.error('Failed to load voting data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index, field, value) => {
    const newFormData = [...formData];
    newFormData[index] = {
      ...newFormData[index],
      [field]: field === 'points' ? parseInt(value) || 0 : value
    };
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);

      // Validate criteria values
      const validCriteria = formData.filter(criteria => 
        criteria.name && criteria.points !== undefined && criteria.points !== ''
      );

      if (validCriteria.length === 0) {
        toast.error('Please fill in all criteria points');
        return;
      }

      // Validate points against max points
      for (const criteria of validCriteria) {
        if (criteria.points > criteria.maxPoints) {
          toast.error(`Points for ${criteria.name} cannot exceed ${criteria.maxPoints}`);
          return;
        }
      }

      // Format criteria data according to API requirements
      const criteriaData = validCriteria.map(criteria => ({
        name: criteria.name,
        points: criteria.points // Changed from mark to points to match API schema
      }));

      // Add criteria using POST endpoint
      await axios.post(`${API_URL}voting/employee-votings/${votingId}/criteria`, {
        criteria: criteriaData
      });

      toast.success('Criteria added successfully');
      // Refresh voting data
      fetchVotingData();
    } catch (error) {
      console.error('Error adding criteria:', error);
      toast.error('Failed to add criteria');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!votingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">Voting not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Update Employee Voting
            </h2>
            <div className="text-sm text-gray-500 mt-1">
              {votingData.votingPeriod?.voting_year} - {votingData.department}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {votingData.employee?.firstname} {votingData.employee?.lastname}
                </h3>
                <p className="text-sm text-gray-500">
                  {votingData.employee?.position || 'N/A'} • {votingData.employee?.email || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Employee ID: {votingData.employee?.id}</p>
                <p className="text-sm text-gray-500">
                  Period: {votingData.votingPeriod?.from_date 
                    ? new Date(votingData.votingPeriod.from_date).toLocaleDateString() 
                    : 'N/A'} - {votingData.votingPeriod?.to_date 
                    ? new Date(votingData.votingPeriod.to_date).toLocaleDateString() 
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {formData.map((criteria, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 mr-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {criteria.name} (Max: {criteria.maxPoints} points)
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter points"
                        value={criteria.points}
                        onChange={(e) => handleInputChange(index, 'points', e.target.value)}
                        min="0"
                        max={criteria.maxPoints}
                        className="w-full mt-1"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {submitting ? 'Updating...' : 'Update Voting'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateEmployeeVoting; 