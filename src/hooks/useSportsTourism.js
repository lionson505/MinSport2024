import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.mis.minisports.gov.rw/api';

export function useSportsTourism() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getEvents = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/sports-tourism/events`, { params: filters });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'images') {
          data.images.forEach(image => {
            formData.append('images', image);
          });
        } else if (key === 'documents') {
          data.documents.forEach(doc => {
            formData.append('documents', doc);
          });
        } else {
          formData.append(key, data[key]);
        }
      });

      const response = await axios.post(`${API_URL}/sports-tourism/events`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEvent = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'images') {
          data.images.forEach(image => {
            formData.append('images', image);
          });
        } else if (key === 'documents') {
          data.documents.forEach(doc => {
            formData.append('documents', doc);
          });
        } else {
          formData.append(key, data[key]);
        }
      });

      const response = await axios.put(`${API_URL}/sports-tourism/events/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEvent = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/sports-tourism/events/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEventRegistrations = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/sports-tourism/events/${id}/registrations`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch event registrations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerForEvent = useCallback(async (eventId, registrationData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/sports-tourism/events/${eventId}/register`, registrationData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register for event');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventRegistrations,
    registerForEvent
  };
} 