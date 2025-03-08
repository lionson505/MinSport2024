import { toast } from 'sonner';
import axiosInstance from '../utils/axiosInstance'; // Import your custom axios instance

// Helper function to handle API errors
const handleApiError = (error, customMessage) => {
  console.error('API Error:', error); // Log full error for debugging
  const message = error.response?.data?.message || customMessage || 'An error occurred';
  toast.error(message);
  throw new Error(message);
};

// SportsForAll-related API calls

/** Fetch all sports events */
export const getSportsEvents = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/sports-for-all', { params });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch sports events');
  }
};

/** Add a new sports event */
export const addSportsEvent = async (data) => {
  try {
    const response = await axiosInstance.post('/sports-for-all', data);
    toast.success('Sports event added successfully');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to add sports event');
  }
};

/** Edit an existing sports event */
export const editSportsEvent = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/sports-for-all/${id}`, data);
    toast.success('Sports event updated successfully');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to update sports event');
  }
};

/** Delete a sports event */
export const deleteSportsEvent = async (id) => {
  try {
    const response = await axiosInstance.delete(`/sports-for-all/${id}`);
    toast.success('Sports event deleted successfully');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to delete sports event');
  }
};

// Partner-related API calls

/** Fetch all partners */
export const getPartners = async () => {
  try {
    const response = await axiosInstance.get('/partners');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch partners');
  }
};

/** Add a new partner */
export const addPartner = async (data) => {
  try {
    // Ensure the payload matches the expected format
    const payload = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response = await axiosInstance.post('/partners', payload, {
      headers: { 'Content-Type': 'application/json' }, // Ensure headers are set
    });
    toast.success('Partner created successfully');
    return response.data;
  } catch (error) {
    console.error('Error details:', error.response?.data); // Log detailed error response
    handleApiError(error, 'Failed to add partner');
  }
};

/** Edit an existing partner */
export const editPartner = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/partners/${id}`, data);
    toast.success('Partner updated successfully');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to edit partner');
  }
};

/** Delete a partner */
export const deletePartner = async (id) => {
  try {
    const response = await axiosInstance.delete(`/partners/${id}`);
    toast.success('Partner deleted successfully');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to delete partner');
  }
};

export default axiosInstance;
