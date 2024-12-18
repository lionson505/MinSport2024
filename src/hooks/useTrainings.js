import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://mis.minisports.gov.rw/api';

export function useTrainings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTrainings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/trainings`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch trainings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTraining = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/trainings`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create training');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTraining = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/trainings/${id}`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update training');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTraining = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/trainings/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete training');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getTrainings,
    createTraining,
    updateTraining,
    deleteTraining
  };
} 