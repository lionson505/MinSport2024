import { useState, useEffect } from 'react';
import { federationService } from '../services/federation';
import { toast } from 'react-hot-toast';

export const useSportsFederations = () => {
  const [federations, setFederations] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load federations on mount
  useEffect(() => {
    loadFederations();
  }, []);

  // Load all federations
  const loadFederations = async () => {
    setLoading(true);
    try {
      const response = await federationService.getFederations();
      if (response.success) {
        setFederations(response.data);
      } else {
        setError('Failed to load federations');
        toast.error('Failed to load sports federations');
      }
    } catch (err) {
      setError('Failed to load federations');
      console.error('Error loading federations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load disciplines by federation
  const loadDisciplines = async (federationId) => {
    if (!federationId) {
      setDisciplines([]);
      return;
    }

    setLoading(true);
    try {
      const response = await federationService.getDisciplinesByFederation(federationId);
      if (response.success) {
        setDisciplines(response.data);
      } else {
        setError('Failed to load disciplines');
        toast.error('Failed to load sport disciplines');
      }
    } catch (err) {
      setError('Failed to load disciplines');
      console.error('Error loading disciplines:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get federation by ID
  const getFederationById = (federationId) => {
    return federations.find(fed => fed.id === federationId);
  };

  // Get discipline by ID
  const getDisciplineById = (disciplineId) => {
    return disciplines.find(disc => disc.id === disciplineId);
  };

  // Get disciplines for tournament type
  const getDisciplinesForTournament = (tournamentType) => {
    if (tournamentType === 'umurenge_kagame') {
      // Only football for Umurenge Kagame Cup
      return disciplines.filter(disc => disc.federationId === 'football');
    } else if (tournamentType === 'inter_universities') {
      // All sports except football for Inter-Universities
      return disciplines.filter(disc => disc.federationId !== 'football');
    }
    return disciplines;
  };

  return {
    federations,
    disciplines,
    loading,
    error,
    loadFederations,
    loadDisciplines,
    getFederationById,
    getDisciplineById,
    getDisciplinesForTournament
  };
};
