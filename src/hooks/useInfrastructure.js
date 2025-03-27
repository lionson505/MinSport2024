import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.mis.minisports.gov.rw/api';

export function useInfrastructure() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getInfrastructures = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/infrastructure`, { params: filters });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch infrastructure');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createInfrastructure = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'images') {
          data.images.forEach(image => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, data[key]);
        }
      });

      const response = await axios.post(`${API_URL}/infrastructure`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create infrastructure');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInfrastructure = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'images') {
          data.images.forEach(image => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, data[key]);
        }
      });

      const response = await axios.put(`${API_URL}/infrastructure/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update infrastructure');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteInfrastructure = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/infrastructure/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete infrastructure');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getInfrastructureBookings = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/infrastructure/${id}/bookings`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch infrastructure bookings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bookInfrastructure = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/infrastructure/${id}/bookings`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book infrastructure');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getInfrastructures,
    createInfrastructure,
    updateInfrastructure,
    deleteInfrastructure,
    getInfrastructureBookings,
    bookInfrastructure
  };
} 