import axios from 'axios';
import { toast } from 'sonner';

const API_URL = 'https://mis.minisports.gov.rw/api'; // Replace with the actual API base URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include the token dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common error cases
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Your session has expired. Please login again.');
    }

    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    }

    if (error.response?.status === 500) {
      toast.error('An unexpected error occurred. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// Helper function to handle API errors
const handleApiError = (error, customMessage) => {
  console.error('API Error:', error); // Log full error for debugging
  const message = error.response?.data?.message || customMessage || 'An error occurred';
  toast.error(message);
  throw new Error(message);
};

// SportsForAll-related API calls

// Fetch all sports events
export const getSportsEvents = async (params = {}) => {
  try {
    const response = await api.get('/mass-sports', { params });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to fetch sports events');
  }
};

// Add a new sports event
export const addSportsEvent = async (data) => {
  try {
    const response = await api.post('/mass-sports', data);
    toast.success('Sports event added successfully');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to add sports event');
  }
};

// Edit an existing sports event
export const editSportsEvent = async (id, data) => {
  try {
    const response = await api.put(`/mass-sports/${id}`, data);
    toast.success('Sports event updated successfully');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to update sports event');
  }
};

// Delete a sports event
export const deleteSportsEvent = async (id) => {
  try {
    const response = await api.delete(`/mass-sports/${id}`);
    toast.success('Sports event deleted successfully');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to delete sports event');
  }
};

// Export the axios instance for direct use
export default api;
