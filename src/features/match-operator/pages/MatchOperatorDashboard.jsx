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
        setMatches(response.data); // Assuming you have a state variable for matches
      } catch (err) {
        setError("Failed to fetch matches. Please try again later.");
        console.error(err);
      }
    };

    fetchMatches();
  }, []); // Ensure the dependency array is empty to run this effect only once


  console.log('it was just a test:', matches[2]?.homeTeam);

  const handleMatchClick = async (match) => {
    try {
      setError(null);
      await checkMatchAvailability(match.id);

      if (match.status === 'UPCOMING') {
        await initializeMatchSetup(match.id);
        setSelectedMatch(match);
        setSetupMode(true);
      } else if (match.status === 'LIVE') {
        setSelectedMatch(match);
        setSetupMode(false);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSetupComplete = () => {
    setSetupMode(false);
  };

  const formatTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '--:--';
    }
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
    if (!Array.isArray(matches)) return []; // Ensuring that matches is an array
    if (status === 'all') return matches; // Show all matches if status is 'all'
    return matches.filter(match => match.status === status); // Filter matches based on the selected status
  };
  
  console.log('some data: ', matches)

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

      {/* <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full"> */}
      <Tabs value={activeTab} onValueChange={setActiveTab}  className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Matches</TabsTrigger>
          <TabsTrigger value="LIVE">Live</TabsTrigger>
          <TabsTrigger value="UPCOMING">Upcoming</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
        </TabsList>

        {['all', 'LIVE', 'UPCOMING', 'COMPLETED'].map((status) => (
          <TabsContent key={status} value={status}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterMatches(status).map((currentMatch) => (
                <div 
                key={currentMatch.id} 
                className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleMatchClick(currentMatch)}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">{currentMatch.competition || 'Unknown Competition'}</span>
                      <div className="text-xs text-gray-400 mt-1">{currentMatch.gameType || 'Unknown Game Type'}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${currentMatch.status === 'LIVE' ? 'bg-red-100 text-red-600' :
                        currentMatch.status === 'UPCOMING' ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-600'
                      }`}>
                      {currentMatch.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{currentMatch.homeTeam || 'Unknown Home Team'}</span>
                      </div>
                      <span className="text-xl font-bold">
                        {currentMatch.awayScore || '0'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{currentMatch.awayTeam || 'Unknown Away Team'}</span>
                      </div>
                      <span className="text-xl font-bold">
                        {currentMatch.homeScore || '0'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{currentMatch.venue || 'TBD'}</span>
                      <span>{formatTime(currentMatch.startTime)}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDate(currentMatch.startTime)}
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Modals */}
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
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
} 