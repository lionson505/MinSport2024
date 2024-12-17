import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Temporary data for development
const tempMatches = [
  {
    id: 1,
    competition: 'RPL | Match - 8',
    gameType: 'football',
    homeTeam: {
      name: 'APR FC',
      logo: '/teams/apr.png',
      score: 2
    },
    awayTeam: {
      name: 'Amagaju',
      logo: '/teams/amagaju.png',
      score: 1
    },
    status: 'LIVE',
    venue: 'Amahoro Stadium',
    startTime: new Date().toISOString()
  },
  {
    id: 2,
    competition: 'RBL Game - 4',
    gameType: 'basketball',
    homeTeam: {
      name: 'REG',
      logo: '/teams/reg.png',
      score: 78
    },
    awayTeam: {
      name: 'Patriots',
      logo: '/teams/patriots.png',
      score: 72
    },
    status: 'LIVE',
    venue: 'BK Arena',
    startTime: new Date().toISOString()
  },
  {
    id: 3,
    competition: 'FRVB League',
    gameType: 'volleyball',
    homeTeam: {
      name: 'Gisagara VC',
      logo: '/teams/gisagara.png',
      score: 2
    },
    awayTeam: {
      name: 'UTB VC',
      logo: '/teams/utb.png',
      score: 1
    },
    status: 'UPCOMING',
    venue: 'Petit Stade',
    startTime: new Date(Date.now() + 86400000).toISOString() // Tomorrow
  }
];

// Event emitter for real-time updates
const eventEmitter = new EventTarget();

// Keep track of matches in memory for development
let inMemoryMatches = [...tempMatches];

export const matchOperatorService = {
  // Subscribe to match updates
  subscribeToUpdates(callback) {
    const handleUpdate = (event) => callback(event.detail);
    eventEmitter.addEventListener('matchUpdate', handleUpdate);
    return () => eventEmitter.removeEventListener('matchUpdate', handleUpdate);
  },

  // Emit match updates
  emitUpdate(match) {
    eventEmitter.dispatchEvent(new CustomEvent('matchUpdate', { detail: match }));
  },

  async getMatches() {
    try {
      return Promise.resolve(inMemoryMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      return Promise.resolve(inMemoryMatches);
    }
  },

  async createMatch(matchData) {
    try {
      const newMatch = {
        id: inMemoryMatches.length + 1,
        ...matchData,
        status: 'UPCOMING',
        homeTeam: {
          name: matchData.homeTeam,
          logo: '/teams/default.png',
          score: 0
        },
        awayTeam: {
          name: matchData.awayTeam,
          logo: '/teams/default.png',
          score: 0
        }
      };
      inMemoryMatches.push(newMatch);
      this.emitUpdate(newMatch);
      return Promise.resolve(newMatch);
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  },

  async updateMatch(id, updates) {
    try {
      const matchIndex = inMemoryMatches.findIndex(m => m.id === id);
      if (matchIndex !== -1) {
        const updatedMatch = { ...inMemoryMatches[matchIndex], ...updates };
        inMemoryMatches[matchIndex] = updatedMatch;
        this.emitUpdate(updatedMatch);
        return Promise.resolve(updatedMatch);
      }
      throw new Error('Match not found');
    } catch (error) {
      console.error('Error updating match:', error);
      throw error;
    }
  },

  async updateScore(id, scoreData) {
    try {
      const matchIndex = inMemoryMatches.findIndex(m => m.id === id);
      if (matchIndex !== -1) {
        const updatedMatch = {
          ...inMemoryMatches[matchIndex],
          homeTeam: { ...inMemoryMatches[matchIndex].homeTeam, score: scoreData.homeScore },
          awayTeam: { ...inMemoryMatches[matchIndex].awayTeam, score: scoreData.awayScore }
        };
        inMemoryMatches[matchIndex] = updatedMatch;
        this.emitUpdate(updatedMatch);
        return Promise.resolve(updatedMatch);
      }
      throw new Error('Match not found');
    } catch (error) {
      console.error('Error updating score:', error);
      throw error;
    }
  },

  // Start a match
  async startMatch(id) {
    return this.updateMatch(id, { status: 'LIVE' });
  },

  // End a match
  async endMatch(id) {
    return this.updateMatch(id, { status: 'COMPLETED' });
  }
}; 