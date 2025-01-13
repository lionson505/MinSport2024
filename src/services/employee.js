import axiosInstance from '../utils/axiosInstance';
import { toast } from 'sonner';

// Helper function to handle API errors
const handleApiError = (error, customMessage) => {
  const message = error.response?.data?.message || customMessage || 'An error occurred';
  toast.error(message);
  throw new Error(message);
};

// Employee-related API calls
export const fetchEmployees = async () => {
  try {
    const response = await axiosInstance.get('/employees');
    // console.log('Raw API Response:', response.data);
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data?.employees && Array.isArray(response.data.employees)) {
      return response.data.employees;
    } else {
      console.warn('Unexpected API Response Structure:', response.data);
      toast.error('Unexpected API response format');
      return [];
    }
  } catch (error) {
    handleApiError(error, 'Failed to fetch employees');
    return [];
  }
};
export const createEmployee = async (data) => {
    try {
      // console.log('Payload being sent to API:', data);
      const response = await axiosInstance.post('/employees', data);
      // console.log('Server Response:', response.data);
      toast.success('Employee created successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error.response?.data || error.message);
      handleApiError(error, 'Failed to create employee');
    }
  };
  

export const updateEmployee = async (data) => {
  try {
    if (!data.id) {
      throw new Error('Employee ID is required for updates');
    }
    const response = await axiosInstance.put(`/employees/${data.id}`, data);
    toast.success('Employee updated successfully');
    return response.data;
  } catch (error) {
    console.error('Error updating employee:', error.response?.data || error.message);
    handleApiError(error, 'Failed to update employee');
    return null;
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await axiosInstance.delete(`/employees/${id}`);
    toast.success('Employee deleted successfully');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to delete employee');
  }
};

export default {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};