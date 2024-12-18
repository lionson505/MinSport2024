import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://mis.minisports.gov.rw/api';

export function useTeams() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/teams`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch teams');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTeam = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/teams`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTeam = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/teams/${id}`, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update team');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTeam = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/teams/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete team');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTeamPlayers = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/teams/${id}/players`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch team players');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTeamPlayer = useCallback(async (teamId, playerId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/teams/${teamId}/players`, { playerId });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add player to team');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeTeamPlayer = useCallback(async (teamId, playerId) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/teams/${teamId}/players/${playerId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove player from team');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    getTeamPlayers,
    addTeamPlayer,
    removeTeamPlayer
  };
} 