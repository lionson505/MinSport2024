import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const sportsEventService = {
  async getAllEvents() {
    try {
      const response = await axios.get(`${API_URL}/sports-events`);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  async getEventById(id) {
    try {
      const response = await axios.get(`${API_URL}/sports-events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  async getEventResults(id) {
    try {
      const response = await axios.get(`${API_URL}/sports-events/${id}/results`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event results:', error);
      throw error;
    }
  }
}; 