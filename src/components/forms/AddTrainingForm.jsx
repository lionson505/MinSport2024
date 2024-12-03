import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import Select from 'react-select';
import axiosInstance from '../../utils/axiosInstance';

const AddTrainingForm = ({ onSubmit, onCancel, isSubmitting, initialData }) => {
  const [availableProfessionals, setAvailableProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch employees from the API
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get('/employees');
        if (response.data && Array.isArray(response.data.employees)) {
          const employees = response.data.employees.map((employee) => ({
            value: employee.id, // Use employee ID as the 'value'
            label: `${employee.firstname} ${employee.lastname}`,
          }));
          setAvailableProfessionals(employees);
        } else {
          setError('Failed to load employees. Invalid data format.');
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Initialize form data
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    fromDate: initialData?.fromDate || '',
    toDate: initialData?.toDate || '',
    organiser: initialData?.organiser || '',
    participants: initialData?.participants || [],
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        fromDate: initialData.fromDate || '',
        toDate: initialData.toDate || '',
        organiser: initialData.organiser || '',
        participants: initialData.participants || [],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle multi-select changes for participants
  const handleParticipantChange = (selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      participants: selectedOptions ? selectedOptions.map(option => option.value) : [],
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.title || !formData.fromDate || !formData.organiser) {
        throw new Error('Please fill in all required fields');
      }

      const submissionData = {
        title: formData.title,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        organiser: formData.organiser,
        participants: formData.participants,
      };

      console.log('Submitting data:', submissionData); // Debugging: log the data being sent

      // Use axiosInstance directly to see if there's an issue with the onSubmit function
      const response = await axiosInstance.post('/trainings', submissionData);
      console.log('Response:', response);

      // Reset form if successful
      setFormData({
        title: '',
        fromDate: '',
        toDate: '',
        organiser: '',
        participants: [],
      });

      // Call onSubmit if provided
      if (onSubmit) {
        await onSubmit(submissionData);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.error || err.message || 'Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  const formTitle = initialData ? 'Edit Training' : 'Add Training';
  const submitButtonText = initialData
    ? (isSubmitting ? 'Saving...' : 'Save Changes')
    : (isSubmitting ? 'Adding...' : 'Add Training');

  return (
    <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-4 space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center space-x-2">
          <Info className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Training Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Training Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter training title"
          disabled={loading}
        />
      </div>

      {/* Training Period */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="fromDate"
            value={formData.fromDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            name="toDate"
            value={formData.toDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            min={formData.fromDate}
          />
        </div>
      </div>

      {/* Training Organiser */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Training Organiser <span className="text-red-500">*</span>
        </label>
        <select
          name="organiser"
          value={formData.organiser}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <option value="">Select Organiser</option>
          <option value="MINISPORTS">MINISPORTS</option>
          <option value="FERWAFA">FERWAFA</option>
          <option value="FERWABA">FERWABA</option>
        </select>
      </div>

      {/* Participants Multi-select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Participants
        </label>
        <Select
          isMulti
          name="participants"
          options={availableProfessionals}
          className="basic-multi-select"
          classNamePrefix="select"
          value={formData.participants.map(id => availableProfessionals.find(p => p.value === id))}
          onChange={handleParticipantChange}
          placeholder="Select participants..."
          isDisabled={loading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t sticky bottom-0 bg-white">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting || loading}
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default AddTrainingForm;
