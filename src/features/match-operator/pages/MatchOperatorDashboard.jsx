import { useState } from 'react';
import { useMatchOperator } from '../../../contexts/MatchOperatorContext';
import { CreateMatchModal } from '../components/CreateMatchModal';
import { MatchSetupWizard } from '../components/MatchSetupWizard';
import { MatchScoreboard } from '../components/MatchScoreboard';
import { Button } from '../../../components/ui/Button';
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';

export function MatchOperatorDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [setupMode, setSetupMode] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const { 
    matches = [],
    initializeMatchSetup,
    checkMatchAvailability 
  } = useMatchOperator();

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Matches</TabsTrigger>
          <TabsTrigger value="LIVE">Live</TabsTrigger>
          <TabsTrigger value="UPCOMING">Upcoming</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
        </TabsList>

        {['all', 'LIVE', 'UPCOMING', 'COMPLETED'].map((status) => (
          <TabsContent key={status} value={status}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterMatches(status).map(match => (
                <div
                  key={match.id}
                  className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleMatchClick(match)}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">{match.competition || 'Unknown Competition'}</span>
                      <div className="text-xs text-gray-400 mt-1">{match.gameType || 'Unknown Game Type'}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      match.status === 'LIVE' ? 'bg-red-100 text-red-600' :
                      match.status === 'UPCOMING' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {match.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{match.homeTeam?.name || 'Home Team'}</span>
                      </div>
                      <span className="text-xl font-bold">
                        {match.score?.home || '0'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{match.awayTeam?.name || 'Away Team'}</span>
                      </div>
                      <span className="text-xl font-bold">
                        {match.score?.away || '0'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{match.venue || 'TBD'}</span>
                      <span>{formatTime(match.startTime)}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDate(match.startTime)}
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