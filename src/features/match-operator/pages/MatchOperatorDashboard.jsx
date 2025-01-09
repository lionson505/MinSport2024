import React, {useEffect, useState} from 'react';
import {useMatchOperator} from '../../../contexts/MatchOperatorContext';
import {CreateMatchModal} from '../components/CreateMatchModal';
import {MatchSetupWizard} from '../components/MatchSetupWizard';
import {MatchScoreboard} from '../components/MatchScoreboard';
import {Button} from '../../../components/ui/Button';
import {AlertCircle, Loader2, Plus} from 'lucide-react';
import {Alert, AlertDescription} from '../../../components/ui/alert';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../../../components/ui/tabs';
import useFetchLiveMatches from '../../../utils/fetchLiveMatches';
import {useFetchNationalTeam, useFetchPlayers} from '../../../utils/fetchMatchAndPlayers';
import {usePermissionLogger} from '../../../utils/permissionLogger.js';
import Fallback from '../../../pages/public/fallback.jsx';

export function MatchOperatorDashboard() {
  const [matchMinutes, setMatchMinutes] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState();
  const [setupMode, setSetupMode] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [nationalTeamAPlayers, setNationalTeamAPlayers] = useState([]);
  const [nationalTeamBPlayers, setNationalTeamBPlayers] = useState([]);
  const { matches = [], liveMatchError } = useFetchLiveMatches();
  const { nationalTeam = [], nationalTeamError } = useFetchNationalTeam([])
  const { players = [], playerError } = useFetchPlayers([])
  const [extra, setExtra] = useState(null);
  const [loading, setLoading] = useState(true);
  const permissionsLog = usePermissionLogger('match')
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false
  })

  const {
    oldMatches = [],
    initializeMatchSetup,
    checkMatchAvailability
  } = useMatchOperator();

  const fetchPermissions = async () => {
    await setLoading(true);
    const currentPermissions = await permissionsLog();
    await setPermissions(currentPermissions);
    await setLoading(false);
  }

  useEffect(() => {
    fetchPermissions();

  }, []);

  // Add this new function to calculate match minutes
  const calculateMatchMinute = (startTime) => {
    if (!startTime) return '0';

    const start = new Date(startTime);
    const now = new Date();

    // Check if the date is valid
    if (isNaN(start.getTime())) {
      console.error('Invalid start time:', startTime);
      return '0';
    }



    const diffInMinutes = Math.floor((now - start) / (1000 * 60));

    return Math.max(0, diffInMinutes).toString();
  };




  const renderMatchTime = (matchId) => {
    const minutes = matchMinutes[matchId];
    if (!minutes) return '0 min';

    const numericMinutes = Number(minutes);
    if (numericMinutes <= 90) {
      return `${numericMinutes} min`;
    } else {
      const extraTime = numericMinutes - 90;
      return `90+${extraTime} min`;
    }
  };


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


      const filteredAPlayers = players.filter(player => player.team?.id === homeTeamPlayersId);
      setNationalTeamAPlayers(filteredAPlayers);

      const filteredBPlayers = players.filter(player => player.team?.id === awayTeamPlayersId);
      setNationalTeamBPlayers(filteredBPlayers);

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


  useEffect(() => {
    // Initialize minutes for all ongoing matches
    const initializeMinutes = () => {
      if (!Array.isArray(matches)) return;

      const newMinutes = {};
      matches.forEach(match => {
        if (match.status === 'ONGOING') {
          newMinutes[match.id] = calculateMatchMinute(match.startTime);
        }
      });
      setMatchMinutes(newMinutes);
    };



    // Initial setup
    initializeMinutes();

    // Update every minute
    const timer = setInterval(() => {
      initializeMinutes();
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [matches]);


  useEffect(() => {
    console.log('Current matches:', matches);
    console.log('Match minutes:', matchMinutes);
  }, [matches, matchMinutes]);


  if(loading) {
    return(
        <div className="flex animate-spin animate justify-center items-center h-screen">
          <Loader2/>
        </div>
    )

  }

  const getExtra = (id) => {
    const matchMin = matchMinutes[id];
    return Number(matchMin) - 90;
  };





  if (liveMatchError) {
    console.error("Problem in getting matches")
  }


  if (!matches.length) {
    console.error("Problem in getting matches")
  }

  // national team


  if (nationalTeamError) {
    console.error("Problem in getting national teams")
  }


  // console.log('teams : ', nationalTeam)
  if (!nationalTeam.length) {
    console.error("No Teams Available")
  }

  // nation team players 
  if (playerError) {
    console.error("Problem in getting Players")
  }

  if (!players.length) {
    console.error("No Players")
  }

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


  console.log(matchMinutes)
  // console.log("filterMatches: ", { filterMatches })

  console.log(matches)
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Match Operator Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage live matches and upcoming events</p>
        </div>
        {permissions.canCreate && (
            <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Match
        </Button>)}

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
              {filterMatches(status).length === 0 ? (

                <div className="flex items-center justify-center col-span-full min-h-[400px]">
                  <Fallback
                    className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg shadow-md"
                    message="No Past Games Available"
                    onRetry={() => console.log("Retry clicked!")}
                    response={status}
                  />
                </div>
                // <h1>No matches with status: {status}</h1>
              ) : (
                filterMatches(status).map((currentMatch) => {
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

                        <div className="flex justify-between items-center mb-4">

                          <div className="flex flex-col items-end gap-1">
                            <div className="flex flex-col items-end">
      <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentMatch.status === 'ONGOING'
                  ? 'bg-red-100 text-red-600'
                  : currentMatch.status === 'UPCOMING'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
          }`}
      >
        {currentMatch.status}
      </span>
                              {currentMatch.status === 'ONGOING' && (
                                  <span className="text-xs font-medium text-red-600 mt-1">
          {(matchMinutes[currentMatch.id] > 90) ? `90 + ${getExtra(currentMatch.id)}  `: `${matchMinutes[currentMatch.id]} '`}min
        </span>
                              )}
                            </div>
                          </div>
                        </div>
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
                })
              )}
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
