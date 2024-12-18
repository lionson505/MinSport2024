import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://mis.minisports.gov.rw/api';

export function useAcademies() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAcademies = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/academies`, { params: filters });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch academies');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAcademy = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'logo') {
          formData.append('logo', data.logo);
        } else if (key === 'photos') {
          data.photos.forEach(photo => {
            formData.append('photos', photo);
          });
        } else {
          formData.append(key, data[key]);
        }
      });

      const response = await axios.post(`${API_URL}/academies`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create academy');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAcademy = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'logo') {
          formData.append('logo', data.logo);
        } else if (key === 'photos') {
          data.photos.forEach(photo => {
            formData.append('photos', photo);
          });
        } else {
          formData.append(key, data[key]);
        }
      });

      const response = await axios.put(`${API_URL}/academies/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update academy');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAcademy = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/academies/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete academy');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAcademyStudents = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/academies/${id}/students`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch academy students');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addAcademyStudent = useCallback(async (academyId, studentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/academies/${academyId}/students`, studentData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student to academy');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getAcademies,
    createAcademy,
    updateAcademy,
    deleteAcademy,
    getAcademyStudents,
    addAcademyStudent
  };
} 