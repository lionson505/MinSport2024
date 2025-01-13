import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import Select from 'react-select';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';

const AddTrainingForm = ({ onSubmit, onCancel, isSubmitting, initialData }) => {
  const [availableProfessionals, setAvailableProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch official referees from the API
  useEffect(() => {
    const fetchOfficialReferees = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get('/official-referees');
        if (response.data && Array.isArray(response.data)) {
          const referees = response.data.map((referee) => ({
            value: referee.id,
            label: `${referee.firstName} ${referee.lastName}`,
          }));
          setAvailableProfessionals(referees);
        } else {
          setError('Failed to load referees. Invalid data format.');
          toast.error('Failed to load referees. Invalid data format.');
        }
      } catch (err) {
        console.error('Error fetching referees:', err);
        setError('Failed to load referees. Please try again later.');
        toast.error('Failed to load referees. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOfficialReferees();
  }, []);

  // Initialize form data
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    fromDate: initialData?.fromDate || '',
    toDate: initialData?.toDate || '',
    organiser: initialData?.organiser || '',
    participants: initialData?.participants?.map(id => {
      const professional = availableProfessionals.find(p => p.value === id);
      return professional ? { value: id, label: professional.label } : { value: id, label: '' };
    }) || [],
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        fromDate: initialData.fromDate || '',
        toDate: initialData.toDate || '',
        organiser: initialData.organiser || '',
        participants: initialData.participants?.map(id => {
          const professional = availableProfessionals.find(p => p.value === id);
          return professional ? { value: id, label: professional.label } : { value: id, label: '' };
        }) || [],
      });
    }
  }, [initialData, availableProfessionals]);

  // Update participant labels once we have the available professionals
  useEffect(() => {
    if (availableProfessionals.length > 0 && formData.participants.length > 0) {
      setFormData(prev => ({
        ...prev,
        participants: prev.participants.map(participant => {
          const professional = availableProfessionals.find(p => p.value === participant.value);
          return professional || participant;
        })
      }));
    }
  }, [availableProfessionals]);

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
      participants: selectedOptions || [],
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

      // Format dates to match YYYY-MM-DD format
      const submissionData = {
        title: formData.title.trim(),
        fromDate: formData.fromDate,
        toDate: formData.toDate || formData.fromDate,
        organiser: formData.organiser.toUpperCase(),
        participants: formData.participants.map(participant => participant.value),
      };

      // Log the exact data being sent
      // console.log('Attempting to submit:', JSON.stringify(submissionData, null, 2));

      let response;
      if (initialData) {
        // Perform PUT request for updating
        response = await axiosInstance.put(`/trainings/${initialData.id}`, submissionData);
        toast.success('Training updated successfully');
        window.location.reload();
      } else {
        // Perform POST request for adding
        response = await axiosInstance.post('/trainings', submissionData);
        toast.success('Training added successfully');
      }

      if (response.data) {
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
          await onSubmit(response.data);
        }
      }
    } catch (err) {
      console.error('Submission error:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
      });

      // Set a more specific error message
      const errorMessage = err.response?.data?.message || 
        err.response?.statusText || 
        err.message || 
        'Failed to submit training. Please check your input and try again.';
      setError(errorMessage);
      toast.error(errorMessage);
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
          value={formData.participants}
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
