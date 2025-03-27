import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.mis.minisports.gov.rw/api';

export function useProfessionals() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getProfessionals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/professionals`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch professionals');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProfessional = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/professionals`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create professional');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfessional = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/professionals/${id}`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update professional');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProfessional = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/professionals/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete professional');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAvatar = useCallback(async (id, file) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await axios.post(`${API_URL}/professionals/${id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload avatar');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getProfessionals,
    createProfessional,
    updateProfessional,
    deleteProfessional,
    uploadAvatar
  };
} 