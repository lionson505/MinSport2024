import { useState, useEffect } from 'react';
import { tournamentService } from '../services/tournamentService';
import { toast } from 'react-hot-toast';

const normalizeType = (v) => {
  if (!v) return v;
  const s = String(v);
  if (s === s.toUpperCase()) {
    // Likely Prisma enum
    if (s === 'UMURENGE_KAGAME') return 'umurenge_kagame';
    if (s === 'INTER_UNIVERSITIES') return 'inter_universities';
  }
  return s;
};

const normalizeStatus = (v) => {
  if (!v) return v;
  const s = String(v);
  return s.toLowerCase();
};

const normalizeTournament = (t) => {
  if (!t) return t;
  return {
    ...t,
    type: normalizeType(t.type),
    status: normalizeStatus(t.status),
  };
};

export const useTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all tournaments
  const fetchTournaments = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tournamentService.getTournaments(filters);
      if (response.success) {
        const list = Array.isArray(response.data) ? response.data.map(normalizeTournament) : [];
        setTournaments(list);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch tournaments');
      console.error('Error fetching tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new tournament
  const createTournament = async (tournamentData) => {
    setLoading(true);
    try {
      const response = await tournamentService.createTournament(tournamentData);
      if (response.success) {
        const created = normalizeTournament(response.data);
        setTournaments(prev => [...prev, created]);
        toast.success('Tournament created successfully');
        return response.data;
      } else {
        toast.error(response.message);
        return null;
      }
    } catch (err) {
      toast.error('Failed to create tournament');
      console.error('Error creating tournament:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update tournament
  const updateTournament = async (tournamentId, updateData) => {
    setLoading(true);
    try {
      const response = await tournamentService.updateTournament(tournamentId, updateData);
      if (response.success) {
        const updated = normalizeTournament(response.data);
        setTournaments(prev => prev.map(t => (t.id === tournamentId ? { ...t, ...updated } : t)));
        toast.success('Tournament updated successfully');
        return response.data;
      } else {
        toast.error(response.message);
        return null;
      }
    } catch (err) {
      toast.error('Failed to update tournament');
      console.error('Error updating tournament:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete tournament
  const deleteTournament = async (tournamentId) => {
    setLoading(true);
    try {
      const response = await tournamentService.deleteTournament(tournamentId);
      if (response.success) {
        setTournaments(prev => prev.filter(tournament => tournament.id !== tournamentId));
        toast.success('Tournament deleted successfully');
        return true;
      } else {
        toast.error(response.message);
        return false;
      }
    } catch (err) {
      toast.error('Failed to delete tournament');
      console.error('Error deleting tournament:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get tournament by ID
  const getTournamentById = async (tournamentId) => {
    setLoading(true);
    try {
      const response = await tournamentService.getTournamentById(tournamentId);
      if (response.success) {
        return response.data;
      } else {
        toast.error(response.message);
        return null;
      }
    } catch (err) {
      toast.error('Failed to fetch tournament details');
      console.error('Error fetching tournament:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get tournaments by season
  const getTournamentsBySeason = async (season) => {
    return fetchTournaments({ season });
  };

  // Get tournaments by type
  const getTournamentsByType = async (type) => {
    return fetchTournaments({ type });
  };

  // Check if registration is still open
  const isRegistrationOpen = (tournament) => {
    if (!tournament.registrationDeadline) return true;
    return new Date() < new Date(tournament.registrationDeadline);
  };

  // Get tournament statistics
  const getTournamentStats = () => {
    const stats = {
      total: tournaments.length,
      active: tournaments.filter(t => t.status === 'active').length,
      upcoming: tournaments.filter(t => t.status === 'upcoming').length,
      completed: tournaments.filter(t => t.status === 'completed').length,
      totalTeams: tournaments.reduce((sum, t) => sum + (t.registeredTeams || 0), 0)
    };
    return stats;
  };

  // Load tournaments on mount
  useEffect(() => {
    fetchTournaments();
  }, []);

  return {
    tournaments,
    loading,
    error,
    fetchTournaments,
    createTournament,
    updateTournament,
    deleteTournament,
    getTournamentById,
    getTournamentsBySeason,
    getTournamentsByType,
    isRegistrationOpen,
    getTournamentStats,
    refetch: fetchTournaments
  };
};
