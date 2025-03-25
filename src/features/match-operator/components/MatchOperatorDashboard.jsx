import { useState, useEffect } from 'react';
import axiosInstance from '../../../../utils/axiosInstance';

export default function MatchOperatorDashboard() {
    const [nationalTeams, setNationalTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNationalTeams = async () => {
            try {
                const response = await axiosInstance.get('/national-teams');
                setNationalTeams(response.data);
                console.log('National Teams:', response.data);
            } catch (err) {
                console.error('Problem in getting national teams:', err);
                setError('Failed to fetch national teams');
            }
        };

        const fetchMatches = async () => {
            try {
                const response = await axiosInstance.get('/matches');
                setMatches(response.data);
                console.log('Matches:', response.data);
            } catch (err) {
                console.error('Problem in getting matches:', err);
                setError('Failed to fetch matches');
            }
        };

        fetchNationalTeams();
        fetchMatches();
    }, []);

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            {/* Render your dashboard components here */}
        </div>
    );
} 