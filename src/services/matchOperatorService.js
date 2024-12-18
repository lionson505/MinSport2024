import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Keep track of match operators in memory (for development)
const matchOperators = new Map();

// Define dummy players first
const dummyPlayers = {
  football: {
    team1: [
      { id: 1, number: "1", name: "Jean Bosco", position: "Goalkeeper" },
      { id: 2, number: "4", name: "Eric Ngabo", position: "Defender" },
      { id: 3, number: "5", name: "Patrick Umwali", position: "Defender" },
      { id: 4, number: "3", name: "Claude Niyomugabo", position: "Defender" },
      { id: 5, number: "2", name: "Thierry Manzi", position: "Defender" },
      { id: 6, number: "6", name: "Blaise Itangishaka", position: "Midfielder" },
      { id: 7, number: "8", name: "Djabel Manishimwe", position: "Midfielder" },
      { id: 8, number: "10", name: "Muhadjiri Hakizimana", position: "Midfielder" },
      { id: 9, number: "7", name: "Lague Byiringiro", position: "Forward" },
      { id: 10, number: "9", name: "Meddie Kagere", position: "Forward" },
      { id: 11, number: "11", name: "Jacques Tuyisenge", position: "Forward" }
    ],
    team2: [
      { id: 12, number: "1", name: "Fiacre Ntwari", position: "Goalkeeper" },
      { id: 13, number: "2", name: "Hussein Tchabalala", position: "Defender" },
      { id: 14, number: "4", name: "Ange Mutsinzi", position: "Defender" },
      { id: 15, number: "5", name: "Fitina Omborenga", position: "Defender" },
      { id: 16, number: "3", name: "Emmanuel Imanishimwe", position: "Defender" },
      { id: 17, number: "6", name: "Kevin Muhire", position: "Midfielder" },
      { id: 18, number: "8", name: "Olivier Niyonzima", position: "Midfielder" },
      { id: 19, number: "10", name: "Yannick Mukunzi", position: "Midfielder" },
      { id: 20, number: "7", name: "Gilbert Mugisha", position: "Forward" },
      { id: 21, number: "9", name: "Innocent Nshuti", position: "Forward" },
      { id: 22, number: "11", name: "Fred Muhozi", position: "Forward" }
    ]
  },
  basketball: {
    team1: [
      { id: 23, number: "4", name: "Kenneth Gasana", position: "Point Guard" },
      { id: 24, number: "5", name: "Olivier Shyaka", position: "Shooting Guard" },
      { id: 25, number: "8", name: "Dieudonné Ndizeye", position: "Small Forward" },
      { id: 26, number: "11", name: "William Robeyns", position: "Power Forward" },
      { id: 27, number: "15", name: "Steven Hagumintwari", position: "Center" }
    ],
    team2: [
      { id: 28, number: "7", name: "Jean-Paul Niyongabo", position: "Point Guard" },
      { id: 29, number: "9", name: "Ntore Habimana", position: "Shooting Guard" },
      { id: 30, number: "12", name: "Pascal Karekezi", position: "Small Forward" },
      { id: 31, number: "14", name: "Guibert Nijimbere", position: "Power Forward" },
      { id: 32, number: "21", name: "Patrick Ngabonziza", position: "Center" }
    ]
  },
  volleyball: {
    team1: [
      { id: 33, number: "1", name: "Christophe Mukunzi", position: "Outside Hitter" },
      { id: 34, number: "3", name: "Flavien Ndamukunda", position: "Middle Blocker" },
      { id: 35, number: "6", name: "Vincent Dusabimana", position: "Setter" },
      { id: 36, number: "8", name: "Yves Mutabazi", position: "Opposite" },
      { id: 37, number: "11", name: "Fred Musoni", position: "Middle Blocker" },
      { id: 38, number: "14", name: "Sylvestre Ndayisaba", position: "Libero" }
    ],
    team2: [
      { id: 39, number: "2", name: "Nelson Murangwa", position: "Outside Hitter" },
      { id: 40, number: "4", name: "Placide Sibomana", position: "Middle Blocker" },
      { id: 41, number: "7", name: "Eugene Twagirayezu", position: "Setter" },
      { id: 42, number: "9", name: "Lawrence Yakan", position: "Opposite" },
      { id: 43, number: "12", name: "Theodore Ndagijimana", position: "Middle Blocker" },
      { id: 44, number: "15", name: "Bonnie Mutabazi", position: "Libero" }
    ]
  }
};

// Then define matches using the dummyPlayers
let matches = [
  // LIVE Matches
  {
    id: 1,
    competition: 'Rwanda Premier League',
    gameType: 'football',
    homeTeam: { 
      name: 'APR FC', 
      logo: '/teams/apr.png',
      players: dummyPlayers.football.team1,
      score: 2
    },
    awayTeam: { 
      name: 'Rayon Sports', 
      logo: '/teams/rayon.png',
      players: dummyPlayers.football.team2,
      score: 1
    },
    venue: 'Amahoro Stadium',
    status: 'LIVE',
    startTime: new Date().toISOString(),
    score: { home: 2, away: 1 },
    officials: {
      referee: "Thierry Nkurunziza",
      assistantReferee1: "Eric Ruhamiriza",
      assistantReferee2: "Jean Claude Ishimwe",
      fourthOfficial: "Silas Mucyo"
    },
    events: [
      {
        type: 'GOAL',
        team: 'A',
        player: dummyPlayers.football.team1[9], // Meddie Kagere
        minute: '23',
        timestamp: new Date(Date.now() - 40 * 60000).toISOString()
      },
      {
        type: 'GOAL',
        team: 'B',
        player: dummyPlayers.football.team2[9], // Innocent Nshuti
        minute: '35',
        timestamp: new Date(Date.now() - 25 * 60000).toISOString()
      },
      {
        type: 'GOAL',
        team: 'A',
        player: dummyPlayers.football.team1[10], // Jacques Tuyisenge
        minute: '41',
        timestamp: new Date(Date.now() - 19 * 60000).toISOString()
      }
    ]
  },
  {
    id: 2,
    competition: 'Basketball National League',
    gameType: 'basketball',
    homeTeam: { 
      name: 'REG', 
      logo: '/teams/reg.png',
      players: dummyPlayers.basketball.team1,
      score: 78
    },
    awayTeam: { 
      name: 'Patriots', 
      logo: '/teams/patriots.png',
      players: dummyPlayers.basketball.team2,
      score: 72
    },
    venue: 'BK Arena',
    status: 'LIVE',
    startTime: new Date().toISOString(),
    score: { home: 78, away: 72 },
    officials: {
      referee: "Patrick Kalisa",
      assistantReferee1: "Divine Muhire",
      assistantReferee2: "Olivier Rutayisire"
    },
    currentQuarter: 3,
    fouls: { home: 3, away: 4 },
    timeouts: { home: 2, away: 3 }
  },
  // UPCOMING Matches
  {
    id: 3,
    competition: 'Rwanda Premier League',
    gameType: 'football',
    homeTeam: { 
      name: 'Police FC', 
      logo: '/teams/police.png',
      players: dummyPlayers.football.team1
    },
    awayTeam: { 
      name: 'AS Kigali', 
      logo: '/teams/askigali.png',
      players: dummyPlayers.football.team2
    },
    venue: 'Kigali Pele Stadium',
    status: 'UPCOMING',
    startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    officials: {
      referee: "Abdoul Karim",
      assistantReferee1: "Jean Paul Ngabo",
      assistantReferee2: "Eric Mugabo",
      fourthOfficial: "Claude Ishimwe"
    }
  },
  {
    id: 4,
    competition: 'Volleyball National League',
    gameType: 'volleyball',
    homeTeam: { 
      name: 'Gisagara VC', 
      logo: '/teams/gisagara.png',
      players: dummyPlayers.volleyball.team1
    },
    awayTeam: { 
      name: 'UTB VC', 
      logo: '/teams/utb.png',
      players: dummyPlayers.volleyball.team2
    },
    venue: 'Petit Stade',
    status: 'UPCOMING',
    startTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    officials: {
      referee: "Jean de Dieu Mutabazi",
      assistantReferee1: "Alice Uwase",
      assistantReferee2: "Patrick Habiyambere"
    }
  }
];

export const matchOperatorService = {
  // Get match operator status
  async getMatchOperatorStatus(matchId) {
    try {
      const operator = matchOperators.get(matchId);
      return {
        isBeingManaged: !!operator,
        operatorId: operator?.operatorId,
        operatorName: operator?.operatorName
      };
    } catch (error) {
      console.error('Error getting match operator status:', error);
      throw error;
    }
  },

  // Check match availability
  async checkMatchAvailability(matchId) {
    try {
      const operator = matchOperators.get(matchId);
      if (operator && operator.operatorId !== localStorage.getItem('userId')) {
        throw new Error(`Match is being managed by ${operator.operatorName}`);
      }
      return true;
    } catch (error) {
      console.error('Error checking match availability:', error);
      throw error;
    }
  },

  // Start managing a match
  async startMatch(matchId, setupData) {
    try {
      if (matchOperators.has(matchId)) {
        throw new Error('Match is already being managed by another operator');
      }

      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');

      // Add dummy players based on game type
      const match = matches.find(m => m.id === matchId);
      const players = dummyPlayers[match.gameType];
      
      const enrichedSetupData = {
        ...setupData,
        homeTeam: {
          ...setupData.homeTeam,
          players: players.team1,
          name: match.homeTeam.name
        },
        awayTeam: {
          ...setupData.awayTeam,
          players: players.team2,
          name: match.awayTeam.name
        }
      };

      // Store operator info and match data
      const matchData = {
        id: matchId,
        status: 'LIVE',
        ...match,
        setupData: enrichedSetupData,
        startTime: new Date().toISOString()
      };

      matchOperators.set(matchId, {
        operatorId: userId,
        operatorName: userName || 'Unknown Operator',
        startTime: new Date().toISOString(),
        matchData
      });

      // Update match in the matches array
      const matchIndex = matches.findIndex(m => m.id === matchId);
      if (matchIndex !== -1) {
        matches[matchIndex] = matchData;
      }

      return matchData;
    } catch (error) {
      console.error('Error starting match:', error);
      throw error;
    }
  },

  // Release match management
  async releaseMatch(matchId) {
    try {
      matchOperators.delete(matchId);
      return true;
    } catch (error) {
      console.error('Error releasing match:', error);
      throw error;
    }
  },

  // Update match score
  async updateScore(matchId, scoreData) {
    try {
      const operator = matchOperators.get(matchId);
      if (!operator) {
        throw new Error('Match is not being managed');
      }

      // Update match data
      const updatedMatch = {
        ...operator.setupData,
        id: matchId,
        status: 'LIVE',
        score: scoreData,
        lastUpdate: new Date().toISOString()
      };

      // Store updated data
      matchOperators.set(matchId, {
        ...operator,
        setupData: updatedMatch
      });

      return updatedMatch;
    } catch (error) {
      console.error('Error updating score:', error);
      throw error;
    }
  },

  // Get all matches
  async getMatches() {
    try {
      return matches;
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw error;
    }
  },

  // Create new match
  async createMatch(matchData) {
    try {
      const newMatch = {
        id: matches.length + 1,
        ...matchData,
        homeTeam: { name: matchData.homeTeam },
        awayTeam: { name: matchData.awayTeam },
        status: 'UPCOMING',
        createdAt: new Date().toISOString()
      };
      matches.push(newMatch);
      return newMatch;
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  },

  // Update match
  async updateMatch(matchId, updateData) {
    try {
      const matchIndex = matches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) throw new Error('Match not found');
      
      matches[matchIndex] = {
        ...matches[matchIndex],
        ...updateData,
        lastUpdate: new Date().toISOString()
      };
      
      return matches[matchIndex];
    } catch (error) {
      console.error('Error updating match:', error);
      throw error;
    }
  },

  // Get match data
  async getMatchData(matchId) {
    try {
      const operator = matchOperators.get(matchId);
      if (!operator) {
        throw new Error('Match is not being managed');
      }
      return operator.matchData;
    } catch (error) {
      console.error('Error getting match data:', error);
      throw error;
    }
  },

  // Update match data
  async updateMatchData(matchId, updateData) {
    try {
      const operator = matchOperators.get(matchId);
      if (!operator) {
        throw new Error('Match is not being managed');
      }

      const updatedMatchData = {
        ...operator.matchData,
        ...updateData,
        lastUpdate: new Date().toISOString()
      };

      matchOperators.set(matchId, {
        ...operator,
        matchData: updatedMatchData
      });

      // Update match in the matches array
      const matchIndex = matches.findIndex(m => m.id === matchId);
      if (matchIndex !== -1) {
        matches[matchIndex] = updatedMatchData;
      }

      return updatedMatchData;
    } catch (error) {
      console.error('Error updating match data:', error);
      throw error;
    }
  }
}; 