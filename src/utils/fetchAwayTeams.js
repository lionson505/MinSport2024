import { useState, useEffect } from 'react';

export function useFetchAwayTeams() {
  const [awayTeams, setAwayTeams] = useState([]);
  const [awayTeamsError, setAwayTeamsError] = useState(null);

  useEffect(() => {
    const fetchAwayTeams = async () => {
      try {
        const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
        const response = await fetch(`${API}/away-teams`);
        if (!response.ok) {
          throw new Error('Failed to fetch away teams');
        }
        const data = await response.json();
        setAwayTeams(data);
      } catch (error) {
        setAwayTeamsError(error.message);
      }
    };

    fetchAwayTeams();
  }, []);

  return { awayTeams, awayTeamsError };
} 