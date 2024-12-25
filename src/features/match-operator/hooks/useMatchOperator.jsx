import { useState, useEffect } from 'react';
import { matchOperatorService } from '../services/matchOperatorService';

export function useMatchOperator() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await matchOperatorService.getMatches();
      setMatches(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateMatch = async (matchId, updates) => {
    try {
      const updatedMatch = await matchOperatorService.updateMatch(matchId, updates);
      setMatches(prev => prev.map(match => 
        match.id === matchId ? updatedMatch : match
      ));
      return updatedMatch;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const createMatch = async (matchData) => {
    try {
      const newMatch = await matchOperatorService.createMatch(matchData);
      setMatches(prev => [...prev, newMatch]);
      return newMatch;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return {
    matches,
    loading,
    error,
    fetchMatches,
    updateMatch,
    createMatch
  };
} 