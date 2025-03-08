import { toast } from 'sonner';
import axiosInstance from '../utils/axiosInstance';

export const clubApi = {
  getAllClubs: async (filters = {}) => {
    try {
      console.log('Fetching clubs with filters:', filters);  // Log filters being passed
      const response = await axiosInstance.get('/clubs', { params: filters });
      console.log('API response:', response.data);  // Log the response from the API
      return response.data;
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast.error('Failed to fetch clubs');
      throw error;
    }
  },

  getClubDetails: async (id) => {
    try {
      const response = await axiosInstance.get(`/clubs/${id}`);
      console.log('Club details response:', response.data);  // Log the details
      return response.data;
    } catch (error) {
      console.error('Error fetching club details:', error);
      toast.error('Failed to fetch club details');
      throw error;
    }
  },

  getClubPlayers: async (id) => {
    try {
      const response = await axiosInstance.get(`/clubs/${id}/players`);
      console.log('Club players response:', response.data);  // Log the players data
      return response.data;
    } catch (error) {
      console.error('Error fetching club players:', error);
      toast.error('Failed to fetch club players');
      throw error;
    }
  }
};
