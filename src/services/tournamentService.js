import axiosInstance from '../utils/axiosInstance';

// Remove demo data; use backend API only
const mockTournaments = [];

const mockPlayers = [];
const mockResults = [];

class TournamentService {
  // Get all tournaments with optional filters (from backend API)
  async getTournaments(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.season) params.append('season', filters.season);
      if (filters.status) params.append('status', filters.status);
      if (filters.location) params.append('location', filters.location);
      const response = await axiosInstance.get(`/tournaments${params.toString() ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      return { success: false, data: [], message: 'Failed to fetch tournaments' };
    }
  }

  // Get tournament by ID (from backend API)
  async getTournamentById(tournamentId) {
    try {
      const response = await axiosInstance.get(`/tournaments/${tournamentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tournament:', error);
      return { success: false, data: null, message: 'Failed to fetch tournament' };
    }
  }

  // Create new tournament
  async createTournament(tournamentData) {
    try {
      const response = await axiosInstance.post('/tournaments', tournamentData);
      return response.data;
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw error;
    }
  }

  // Update tournament
  async updateTournament(tournamentId, updateData) {
    try {
      const response = await axiosInstance.put(`/tournaments/${tournamentId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw error;
    }
  }

  // Delete tournament
  async deleteTournament(tournamentId) {
    try {
      const response = await axiosInstance.delete(`/tournaments/${tournamentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting tournament:', error);
      throw error;
    }
  }

  // Register player for tournament
  async registerPlayer(playerData) {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate unique ID for player
      const playerId = Date.now().toString();
      const newPlayer = {
        id: playerId,
        ...playerData,
        registrationDate: new Date().toISOString()
      };
      
      mockPlayers.push(newPlayer);
      
      return {
        success: true,
        data: newPlayer,
        message: 'Player registered successfully'
      };
    } catch (error) {
      console.error('Error registering player:', error);
      return {
        success: false,
        data: null,
        message: 'Failed to register player'
      };
    }
  }

  // Register match result
  async registerResult(resultData) {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Generate unique ID for result
      const resultId = Date.now().toString();
      const newResult = {
        id: resultId,
        ...resultData,
        registrationDate: new Date().toISOString()
      };
      
      mockResults.push(newResult);
      
      return {
        success: true,
        data: newResult,
        message: 'Match result registered successfully'
      };
    } catch (error) {
      console.error('Error registering result:', error);
      return {
        success: false,
        data: null,
        message: 'Failed to register result'
      };
    }
  }

  // Get tournament results
  async getTournamentResults(tournamentId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.stage) params.append('stage', filters.stage);
      if (filters.team) params.append('team', filters.team);
      if (filters.date) params.append('date', filters.date);
      
      const response = await axiosInstance.get(`/tournaments/${tournamentId}/results?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tournament results:', error);
      throw error;
    }
  }

  // Get registered players for tournament
  async getRegisteredPlayers(tournamentId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.sector) params.append('sector', filters.sector);
      if (filters.university) params.append('university', filters.university);
      if (filters.team) params.append('team', filters.team);
      
      const response = await axiosInstance.get(`/tournaments/${tournamentId}/players?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching registered players:', error);
      throw error;
    }
  }

  // Get tournament statistics
  async getTournamentStatistics(tournamentId) {
    try {
      const response = await axiosInstance.get(`/tournaments/${tournamentId}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tournament statistics:', error);
      throw error;
    }
  }

  // Check registration deadline
  async checkRegistrationDeadline(tournamentId) {
    try {
      const response = await axiosInstance.get(`/tournaments/${tournamentId}/registration-status`);
      return response.data;
    } catch (error) {
      console.error('Error checking registration deadline:', error);
      throw error;
    }
  }

  // Get tournament bracket/draw
  async getTournamentBracket(tournamentId) {
    try {
      const response = await axiosInstance.get(`/tournaments/${tournamentId}/bracket`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tournament bracket:', error);
      throw error;
    }
  }

  // Update tournament stage
  async updateTournamentStage(tournamentId, stage) {
    try {
      const response = await axiosInstance.patch(`/tournaments/${tournamentId}/stage`, { stage });
      return response.data;
    } catch (error) {
      console.error('Error updating tournament stage:', error);
      throw error;
    }
  }

  // Generate tournament report
  async generateTournamentReport(tournamentId, reportType = 'summary') {
    try {
      const response = await axiosInstance.get(`/tournaments/${tournamentId}/report`, {
        params: { type: reportType },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error generating tournament report:', error);
      throw error;
    }
  }

  // Export tournament data
  async exportTournamentData(tournamentId, format = 'excel') {
    try {
      const response = await axiosInstance.get(`/tournaments/${tournamentId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting tournament data:', error);
      throw error;
    }
  }
}

export const tournamentService = new TournamentService();
