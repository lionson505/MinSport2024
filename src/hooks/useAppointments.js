import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.mis.minisports.gov.rw/api';

export function useAppointments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAppointments = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/appointments`, { params: filters });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/appointments`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create appointment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAppointment = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/appointments/${id}`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAppointment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/appointments/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete appointment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAppointmentStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.patch(`${API_URL}/appointments/${id}/status`, { status });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    updateAppointmentStatus
  };
} 