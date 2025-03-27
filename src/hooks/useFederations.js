import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.mis.minisports.gov.rw/api';

export function useFederations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getFederations = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/federations`, { params: filters });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch federations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createFederation = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/federations`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create federation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFederation = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/federations/${id}`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update federation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFederation = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/federations/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete federation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFederationMembers = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/federations/${id}/members`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch federation members');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addFederationMember = useCallback(async (federationId, memberId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/federations/${federationId}/members`, { memberId });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add federation member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFederationMember = useCallback(async (federationId, memberId) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/federations/${federationId}/members/${memberId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove federation member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getFederations,
    createFederation,
    updateFederation,
    deleteFederation,
    getFederationMembers,
    addFederationMember,
    removeFederationMember
  };
} 