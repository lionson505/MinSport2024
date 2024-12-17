// src/api/federationApi.js

import { toast } from 'sonner';
import axiosInstance from '../utils/axiosInstance';

// Helper function to handle API errors
const handleApiError = (error, customMessage) => {
  const message = error.response?.data?.message || customMessage || 'An error occurred';
  toast.error(message);
  throw new Error(message);
};

// Federation API endpoints
export const federationApi = {
  // Get all federations
  getAllFederations: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/federations', { params: filters });
      return response.data || [];
    } catch (error) {
      handleApiError(error, 'Failed to fetch federations');
    }
  },

  // Get federation by ID
  getFederationById: async (id) => {
    try {
      const response = await axiosInstance.get(`/federations/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch federation details');
    }
  },

  // Create new federation
  createFederation: async (data) => {
    try {
      const response = await axiosInstance.post('/federations', data);
      toast.success('Federation created successfully');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create federation');
    }
  },

  // Update federation
  updateFederation: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/federations/${id}`, data);
      toast.success('Federation updated successfully');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update federation');
    }
  },

  // Delete federation
  deleteFederation: async (id) => {
    try {
      await axiosInstance.delete(`/federations/${id}`);
      toast.success('Federation deleted successfully');
    } catch (error) {
      handleApiError(error, 'Failed to delete federation');
    }
  },

  // Club management endpoints
  getClubs: async (federationId) => {
    try {
      const response = await axiosInstance.get(`/federations/${federationId}/clubs`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch clubs');
    }
  },

  addClub: async (federationId, clubData) => {
    try {
      const response = await axiosInstance.post(`/federations/${federationId}/clubs`, clubData);
      toast.success('Club added successfully');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to add club');
    }
  },

  updateClub: async (federationId, clubId, clubData) => {
    try {
      const response = await axiosInstance.put(`/federations/${federationId}/clubs/${clubId}`, clubData);
      toast.success('Club updated successfully');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update club');
    }
  },

  deleteClub: async (federationId, clubId) => {
    try {
      await axiosInstance.delete(`/federations/${federationId}/clubs/${clubId}`);
      toast.success('Club deleted successfully');
    } catch (error) {
      handleApiError(error, 'Failed to delete club');
    }
  },

  // Federation members
  getFederationMembers: async (id) => {
    try {
      const response = await axiosInstance.get(`/federations/${id}/members`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch federation members');
    }
  },

  addFederationMember: async (federationId, memberId) => {
    try {
      const response = await axiosInstance.post(`/federations/${federationId}/members`, { memberId });
      toast.success('Member added successfully');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to add federation member');
    }
  },

  removeFederationMember: async (federationId, memberId) => {
    try {
      await axiosInstance.delete(`/federations/${federationId}/members/${memberId}`);
      toast.success('Member removed successfully');
    } catch (error) {
      handleApiError(error, 'Failed to remove federation member');
    }
  },

  // Get federation options
  getFederationOptions: async () => {
    try {
      const response = await axiosInstance.get('/federations', {
        params: { fields: 'id,name' }
      });
      return response.data.map(fed => ({
        value: fed.id,
        label: fed.name
      }));
    } catch (error) {
      handleApiError(error, 'Failed to fetch federation options');
      return [];
    }
  },

  // Player/Staff Management endpoints
  getAllPlayersStaff: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/player-staff', { params: filters });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch player/staff');
    }
  },

  getPlayerStaffDetails: async (id) => {
    try {
      const response = await axiosInstance.get(`/player-staff/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch player/staff details');
    }
  },

  createPlayerStaff: async (data) => {
    try {
      const response = await axiosInstance.post('/player-staff', data);
      toast.success('Player/Staff added successfully');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create player/staff');
    }
  },

  updatePlayerStaff: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/player-staff/${id}`, data);
      toast.success('Player/Staff updated successfully');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update player/staff');
    }
  },

  deletePlayerStaff: async (id) => {
    try {
      await axiosInstance.delete(`/player-staff/${id}`);
      toast.success('Player/Staff deleted successfully');
    } catch (error) {
      handleApiError(error, 'Failed to delete player/staff');
    }
  },

  getTransferHistory: async (id) => {
    try {
      const response = await axiosInstance.get(`/player-staff/${id}/transfers`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch transfer history');
    }
  },
};

export default federationApi;
