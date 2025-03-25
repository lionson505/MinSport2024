import { useState, useEffect } from 'react';

export function useFetchAwayTeams() {
  const [awayTeams, setAwayTeams] = useState([]);
  const [awayTeamsError, setAwayTeamsError] = useState(null);

  useEffect(() => {
    const fetchAwayTeams = async () => {
      try {
        const response = await fetch('http://localhost:3300/api/away-teams');
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