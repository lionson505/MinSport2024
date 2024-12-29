import { createContext, useContext, useState, useEffect } from 'react';
import { matchOperatorService } from '../services/matchOperatorService';

export const MatchOperatorContext = createContext(null);

export const useMatchOperator = () => {
  const context = useContext(MatchOperatorContext);
  if (!context) {
    throw new Error('useMatchOperator must be used within a MatchOperatorProvider');
  }
  return context;
};

export function MatchOperatorProvider({ children }) {
  const [matches, setMatches] = useState([]);
  const [activeMatch, setActiveMatch] = useState(null);
  const [operatorStatus, setOperatorStatus] = useState({
    isManagingMatch: false,
    currentMatchId: null,
    operatorId: null
  });

  // Fetch matches on mount
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await matchOperatorService.getMatches();
        setMatches(data);
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };
    fetchMatches();
  }, []);

  // Check if another operator is managing a match
  const checkMatchAvailability = async (matchId) => {
    try {
      const isAvailable = await matchOperatorService.checkMatchAvailability(matchId);
      console.log(`Match ${matchId} availability:`, isAvailable); // Log match availability
      return isAvailable;
    } catch (error) {
      console.error('Match availability check failed:', error);
      throw error;
    }
  };

  // Initialize match setup
  const initializeMatchSetup = async (matchId) => {
    try {
      console.log('Initializing match setup for matchId:', matchId); // Log matchId
      const isAvailable = await checkMatchAvailability(matchId);
      if (!isAvailable) {
        throw new Error('Match is not available for management');
      }

      const match = matches.find(m => m.id === matchId);
      console.log('Found match:', match); // Log found match
      if (!match) throw new Error('Match not found');

      setOperatorStatus({
        isManagingMatch: true,
        currentMatchId: matchId,
        operatorId: localStorage.getItem('userId')
      });

      return match;
    } catch (error) {
      console.error('Match initialization failed:', error);
      throw error;
    }
  };

  // Create new match
  const createMatch = async (matchData) => {
    try {
      const newMatch = await matchOperatorService.createMatch(matchData);
      setMatches(prev => [...prev, newMatch]);
      return newMatch;
    } catch (error) {
      console.error('Failed to create match:', error);
      throw error;
    }
  };

  // Start live match
  const startLiveMatch = async (matchId, setupData) => {
    try {
      const updatedMatch = await matchOperatorService.startMatch(matchId, setupData);
      setMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));
      setActiveMatch(updatedMatch);
      return updatedMatch;
    } catch (error) {
      console.error('Failed to start live match:', error);
      throw error;
    }
  };

  // Update match score
  const updateScore = async (matchId, scoreData) => {
    try {
      const updatedMatch = await matchOperatorService.updateScore(matchId, scoreData);
      setMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));
      if (activeMatch?.id === matchId) {
        setActiveMatch(updatedMatch);
      }
      return updatedMatch;
    } catch (error) {
      console.error('Failed to update score:', error);
      throw error;
    }
  };

  // End match management session
  const endMatchManagement = async () => {
    try {
      if (operatorStatus.currentMatchId) {
        await matchOperatorService.releaseMatch(operatorStatus.currentMatchId);
      }
      setOperatorStatus({
        isManagingMatch: false,
        currentMatchId: null,
        operatorId: null
      });
      setActiveMatch(null);
    } catch (error) {
      console.error('Failed to end match management:', error);
      throw error;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (operatorStatus.currentMatchId) {
        matchOperatorService.releaseMatch(operatorStatus.currentMatchId)
          .catch(console.error);
      }
    };
  }, [operatorStatus.currentMatchId]);

  const contextValue = {
    matches,
    setMatches,
    activeMatch,
    setActiveMatch,
    operatorStatus,
    initializeMatchSetup,
    startLiveMatch,
    endMatchManagement,
    checkMatchAvailability,
    createMatch,
    updateScore
  };

  return (
    <MatchOperatorContext.Provider value={contextValue}>
      {children}
    </MatchOperatorContext.Provider>
  );
}
