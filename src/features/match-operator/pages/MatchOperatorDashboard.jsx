import { useState, useEffect } from 'react';
import { useMatchOperator } from '../../../contexts/MatchOperatorContext';
import { CreateMatchModal } from '../components/CreateMatchModal';
import { MatchSetupWizard } from '../components/MatchSetupWizard';
import { MatchScoreboard } from '../components/MatchScoreboard';
import { Button } from '../../../components/ui/Button';
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import axiosInstance from '../../../utils/axiosInstance';

export function MatchOperatorDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [setupMode, setSetupMode] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [matches, setMatches] = useState([]);
  const [nationalTeam, setNationalTeam] = useState([]);
  const [nationalTeamAPlayers, setNationalTeamAPlayers] = useState([]);
  const [nationalTeamBPlayers, setNationalTeamBPlayers] = useState([]);

  const {
    oldMatches = [],
    initializeMatchSetup,
    checkMatchAvailability
  } = useMatchOperator();

  // Fetch matches from API
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axiosInstance.get('/live-matches');
        setMatches(response.data); // Set matches state with the fetched data
        return response.data; // Return the data for additional usage if needed
      } catch (err) {
        setError("Failed to fetch matches. Please try again later."); // Set error state
        console.error("Error fetching matches:", err);
      }
    };
    
    fetchMatches();

    // Set up polling to fetch matches every 30 seconds
    const intervalId = setInterval(fetchMatches, 30000);

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Fetch national teams
  useEffect(() => {
    const fetchNationalTeam = async () => {
      try {
        const response = await axiosInstance.get('/national-teams');
        setNationalTeam(response.data);
      } catch (err) {
        setError("Failed to fetch national teams. Please try again later.");
        console.error(err);
      }
    };

    fetchNationalTeam();
  }, []);

  const handleMatchClick = async (match) => {
    try {
      setError(null);
      await checkMatchAvailability(match.id);

      const awayTeam = nationalTeam.find(team => team.teamName === match.awayTeam);
      const homeTeam = nationalTeam.find(team => team.teamName === match.homeTeam);

      if (!homeTeam || !awayTeam) {
        console.warn("No matching national team found for one or both teams.");
        return;
      }

      const homeTeamPlayersId = homeTeam.id;
      const awayTeamPlayersId = awayTeam.id;

      fetchNationalTeamPlayers(homeTeamPlayersId, awayTeamPlayersId);

      if (match.status === 'UPCOMING') {
        await initializeMatchSetup(match.id);
        setSelectedMatch(match);
        setSetupMode(true);
      } else if (match.status === 'ONGOING') {
        setSelectedMatch(match);
        setSetupMode(false);
      }
    } catch (error) {
      setError(error.message);
      console.error("Error in handleMatchClick:", error);
    }
  };

  const fetchNationalTeamPlayers = async (homeTeamPlayersId, awayTeamPlayersId) => {
    try {
      const response = await axiosInstance.get('/national-team-player-staff');
      const filteredAPlayers = response.data.filter(player => player.team?.id === homeTeamPlayersId);
      setNationalTeamAPlayers(filteredAPlayers);

      const filteredBPlayers = response.data.filter(player => player.team?.id === awayTeamPlayersId);
      setNationalTeamBPlayers(filteredBPlayers);
    } catch (err) {
      setError("Failed to fetch national-team players. Please try again later.");
      console.error(err);
    }
  };

  const handleSetupComplete = () => {
    setSetupMode(false);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString([], {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '--/--';
    }
  };

  const filterMatches = (status) => {
    if (!Array.isArray(matches)) return [];
    if (status === 'all') return matches;
    return matches.filter(match => match.status === status);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Match Operator Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage live matches and upcoming events</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Match
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Matches</TabsTrigger>
          <TabsTrigger value="LIVE">Live</TabsTrigger>
          <TabsTrigger value="UPCOMING">Upcoming</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
        </TabsList>

        {['all', 'LIVE', 'UPCOMING', 'COMPLETED'].map((status) => (
          <TabsContent key={status} value={status}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterMatches(status).map((currentMatch) => {
                const dateOnly = currentMatch.startTime
                  ? new Date(currentMatch.startTime).toISOString().split('T')[0]
                  : 'N/A';

                const timeOnly = currentMatch.startTime
                  ? new Date(currentMatch.startTime).toISOString().split('T')[1].split('.')[0]
                  : 'N/A';

                return (
                  <div
                    key={currentMatch.id}
                    className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleMatchClick(currentMatch)}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          {currentMatch.competition || 'Unknown Competition'}
                        </span>
                        <div className="text-xs text-gray-400 mt-1">
                          {currentMatch.gameType || 'Unknown Game Type'}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${currentMatch.status === 'LIVE'
                          ? 'bg-red-100 text-red-600'
                          : currentMatch.status === 'UPCOMING'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600'
                          }`}
                      >
                        {currentMatch.status}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {currentMatch.homeTeam || 'Unknown Home Team'}
                          </span>
                        </div>
                        <span className="text-xl font-bold">
                          {currentMatch.homeScore || '0'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {currentMatch.awayTeam || 'Unknown Away Team'}
                          </span>
                        </div>
                        <span className="text-xl font-bold">
                          {currentMatch.awayScore || '0'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{currentMatch.venue || 'Unknown venue'}</span>
                        <span>{timeOnly}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {dateOnly}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {showCreateModal && (
        <CreateMatchModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {selectedMatch && setupMode && (
        <MatchSetupWizard
          match={selectedMatch}
          onComplete={handleSetupComplete}
        />
      )}

      {selectedMatch && !setupMode && (
        <MatchScoreboard
          match={selectedMatch}
          homeTeamPlayers={nationalTeamAPlayers}
          awayTeamPlayers={nationalTeamBPlayers}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}
