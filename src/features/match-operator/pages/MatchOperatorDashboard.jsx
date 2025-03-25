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
import AwayTeam from './AwayTeam';
import { useFetchAwayTeams } from '../../../utils/fetchAwayTeams';
import { calculateMatchMinute } from '../../../utils/matchTimeUtils';

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
  const [currentMatchMinute, setCurrentMatchMinute] = useState('0');

  const {
    oldMatches = [],
    initializeMatchSetup,
    checkMatchAvailability
  } = useMatchOperator();

  const { awayTeams = [], awayTeamsError } = useFetchAwayTeams();

  const fetchPermissions = async () => {
    await setLoading(true);
    const currentPermissions = await permissionsLog();
    await setPermissions(currentPermissions);
    await setLoading(false);
  }

  useEffect(() => {
    fetchPermissions();

  }, []);

  const renderMatchTime = (matchId) => {
    const minutes = matchMinutes[matchId];
    if (!minutes) return '0 min';

    const numericMinutes = Number(minutes);
    if (numericMinutes <= 45) {
      return `${numericMinutes} min`;
    } else if (numericMinutes <= 90) {
      return `${numericMinutes} min (HALFTIME)`;
    } else {
      const extraTime = numericMinutes - 90;
      return `90+${extraTime} min`;
    }
  };

  const handleMatchClick = async (match) => {
    try {
      setError(null);
      await checkMatchAvailability(match.id);

      console.log('National Teams:', nationalTeam);
      console.log('Away Teams:', awayTeams);
      console.log('Match Home Team:', match.homeTeam);
      console.log('Match Away Team:', match.awayTeam);

      if (match.status === 'ONGOING') {
        console.log(`Live match clicked: ${match.id}`);
        const minute = matchMinutes[match.id] || localStorage.getItem(`matchMinute_${match.id}`) || '0';
        console.log(`Current match minute: ${minute} min`);
        setCurrentMatchMinute(minute);
      }

      const awayTeam = nationalTeam.find(team => team.teamName === match.awayTeam) ||
                      awayTeams.find(team => team.teamName === match.awayTeam);
      const homeTeam = nationalTeam.find(team => team.teamName === match.homeTeam);

      if (!homeTeam || !awayTeam) {
        console.warn("No matching national team or away team found for one or both teams.");
        return;
      }

      const homeTeamPlayersId = homeTeam.id;
      const awayTeamPlayersId = awayTeam.id;

      const filteredAPlayers = players.filter(player => player.team?.id === homeTeamPlayersId);
      setNationalTeamAPlayers(filteredAPlayers);

      const awayTeamPlayers = players.filter(player => player.team?.id === awayTeamPlayersId) || 
                              (awayTeam.players ? Object.values(awayTeam.players) : []);
      setNationalTeamBPlayers(awayTeamPlayers);

      // Calculate time passed since match start
      const timePassed = calculateMatchMinute(
        match.startTime,
        match.updatedAt,
        match.firstTime,
        match.firstAddedTime,
        match.secondTime || 0,
        match.secondAddedTime || 0
      );

      setSelectedMatch({ ...match, timePassed });

      if (match.status === 'COMPLETED') {
        await initializeMatchSetup(match.id);
        setSetupMode(true);
      } else if (match.status === 'ONGOING' || match.status === 'UPCOMING' || match.status === 'HALFTIME') {
        setSetupMode(false);
      }
    } catch (error) {
      setError(error.message);
      console.error("Error in handleMatchClick:", error);
    }
  };

  useEffect(() => {
    const initializeMinutes = () => {
      if (!Array.isArray(matches)) return;

      const newMinutes = {};
      matches.forEach(match => {
        if (match.startTime && match.updatedAt) {
          const calculatedMinute = calculateMatchMinute(
            match.startTime,
            match.updatedAt,
            match.firstTime,
            match.firstAddedTime,
            match.secondTime || 0,
            match.secondAddedTime || 0
          );

          if (match.status === 'ONGOING' || match.status === 'HALFTIME') {
            newMinutes[match.id] = calculatedMinute;
            localStorage.setItem(`matchMinute_${match.id}`, calculatedMinute);
          } else if (match.status === 'COMPLETED') {
            const totalAllowedMinutes = match.firstTime + match.firstAddedTime + (match.secondTime || 0) + (match.secondAddedTime || 0);
            newMinutes[match.id] = totalAllowedMinutes.toString();
          } else if (match.status === 'UPCOMING') {
            newMinutes[match.id] = '0';
          }
        }
      });
      setMatchMinutes(newMinutes);
    };

    initializeMinutes();
    const timer = setInterval(initializeMinutes, 60000);
    return () => clearInterval(timer);
  }, [matches]);

  useEffect(() => {
    // console.log('Current matches:', matches);
    // console.log('Match minutes:', matchMinutes);
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
    // console.error("Problem in getting matches")
  }

  if (!matches.length) {
    console.error("Problem in getting matches")
  }

  if (nationalTeamError) {
    // console.error("Problem in getting national teams")
  }

  if (!nationalTeam.length) {
    console.error("No Teams Available")
  }

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Match Operator Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage ONGOING matches and upcoming events</p>
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
          <TabsTrigger value="ONGOING">ONGOING</TabsTrigger>
          <TabsTrigger value="HALFTIME">HALFTIME</TabsTrigger>
          <TabsTrigger value="NOT_STARTED">Upcoming</TabsTrigger>
          <TabsTrigger value="ENDED">Completed</TabsTrigger>
          <TabsTrigger value="awayteam">AwayTeam</TabsTrigger>
        </TabsList>

        {['all', 'ONGOING', 'HALFTIME', 'NOT_STARTED', 'ENDED'].map((status) => (
          <TabsContent key={status} value={status}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterMatches(status).length === 0 ? (

                <div className="flex items-center justify-center col-span-full min-h-[400px]">
                  <Fallback
                    className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg shadow-md"
                    message="No Games Available"
                    onRetry={() => console.log("Retry clicked!")}
                    response={status}
                  />
                </div>
              ) : (
                filterMatches(status).map((currentMatch) => {
                  const dateOnly = currentMatch.updatedAt
                    ? new Date(currentMatch.updatedAt).toISOString().split('T')[0]
                    : 'N/A';

                  const timeOnly = currentMatch.updatedAt
                    ? new Date(currentMatch.updatedAt).toISOString().split('T')[1].split('.')[0]
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
                                    : currentMatch.status === 'HALFTIME'
                                    ? 'bg-yellow-100 text-yellow-600'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {currentMatch.status}
                              </span>
                              {(currentMatch.status === 'ONGOING' || currentMatch.status === 'HALFTIME') && (
                                <span className="text-xs font-medium text-red-600 mt-1">
                                  {renderMatchTime(currentMatch.id)}
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

        <TabsContent value="awayteam">
          <AwayTeam />
        </TabsContent>
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
          matchTime={matchMinutes[selectedMatch.id]}
          currentMatchMinute={currentMatchMinute}
          timePassed={selectedMatch.timePassed}
        />
      )}
    </div>
  );
}

function openMatch(match) {
  if (match.status === 'UPCOMING') {
    // Logic to open the match
    console.log(`Opening match: ${match.id}`);
    // Add your logic here to handle the match opening
  } else {
    console.warn(`Match with status ${match.status} cannot be opened.`);
  }
}
