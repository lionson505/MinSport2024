import { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/Button';
import { PlayerStatsDisplay } from '../../../../components/scoreboards/PlayerStatsDisplay';
import { TeamStatsDisplay } from '../../../../components/scoreboards/TeamStatsDisplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import axiosInstance from '../../../../utils/axiosInstance';
import { Timer, Users, ChevronRight, Play, Pause } from 'lucide-react'; // Import Play and Pause icons
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Input } from '../../../../components/ui/input';
import useFetchLiveMatches from '../../../../utils/fetchLiveMatches';
import toast from 'react-hot-toast';
import { usePermissionLogger } from "../../../../utils/permissionLogger.js";
import { useFetchNationalTeam, useFetchPlayers } from './../../../../utils/fetchMatchAndPlayers';


export default function FootballScoreboard({ match, teamAPlayers = [], teamBPlayers = [], onUpdate }) {
  const calculateMatchMinute = (startTime) => {
    if (!startTime) return '0';

    const start = new Date(startTime);
    const now = new Date();

    if (isNaN(start.getTime())) {
      return '0';
    }

    const diffInMinutes = Math.floor((now - start) / (1000 * 60));
    return Math.max(0, diffInMinutes).toString();
  };
  const [matchData, setMatchData] = useState({
    status: 'NOT_STARTED',
    period: 'FIRST_HALF',
    currentTime: '00:00',
    addedTime: 0,
    teamAScore: 0,
    teamBScore: 0,
    events: []
  });

  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { nationalTeam, setNationalTeams } = useFetchNationalTeam();
  const { matches = [], liveMatchError } = useFetchLiveMatches()
  const updatedMatch = matches.filter((updatedMatch) => updatedMatch.id === match.id) 
  const { players, playersError } = useFetchPlayers();
  const [currentMinute, setCurrentMinute] = useState(calculateMatchMinute(match.startTime));
  const [fieldStatus, setFieldStatus] = useState({});
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [lineUpModalOpen, setLineUpModalOpen] = useState();
  const [lineUp, setLineUp] = useState({
        eventType: '',
        eventData:{
          nationalTeamPlayerStaffId: '',
          position: '',
          minute: 9
        }
      });
  

  const permissionLogger = usePermissionLogger('match')
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false
  })

  const fetchPermissions = async () => {
    const currentPermissions = await permissionLogger();
    await setPermissions(currentPermissions);
  }


  useEffect(() => {
    fetchPermissions();
  }, []);








  // Team A players
  const homeTeamName = match.homeTeam;
  const homeTeamId = nationalTeam.filter(nationalTeamName => nationalTeamName.teamName === homeTeamName)
  // console.log("homeTeamId : ", homeTeamId)
  const homeTeamLineUp = players.filter(player => player.teamId === homeTeamId[0]?.id);
  // console.log("homeTeamLineUp:", homeTeamLineUp);


  // Team B players
  const awayTeamName = match.awayTeam;
  const awayTeamId = nationalTeam.filter(nationalTeamName => nationalTeamName.teamName === awayTeamName)
  // console.log("homeTeamId : ", homeTeamId)
  const awayTeamLineUp = players.filter(player => player.teamId === awayTeamId[0]?.id);

  const toggleFieldStatus = (player, isChecked) => {
    // Update fieldStatus state for the player
    setFieldStatus((prev) => ({ ...prev, [player.id]: isChecked }));
  
    // Update the selectedPlayers array based on whether the player is checked or unchecked
    setSelectedPlayers(() => {
    if (isChecked) {
      const updated = [player]; // Replace the array with only the current player
      console.log("Selected Players:", updated);
      setLineUp({
        eventType: 'lineup',
        eventData:{
          nationalTeamPlayerStaffId: updated[0].playerStaff.id || '',
          position: updated[0].playerStaff.positionInClub || '',
          minute: 8
        }
      })

      saveLineup(updated); 
      return updated;
    } else {
      console.log("Selected Players: []"); // Log empty array when unchecked
      return []; // Return an empty array if unchecked
    }
  });
};

const useLineUp = () => {
  setLineUpModalOpen((prev) => !prev); // Toggle the modal open/close state
};


const saveLineup = async (lineUp, matchId) => {
  console.log("Lineup structiure:", lineUp);
};


  const renderMatchTime = (matchId) => {
    const minutes = matchMinutes[matchId];
    if (!minutes) return '0 min';

    const numericMinutes = Number(minutes);
    if (numericMinutes <= 90) {
      return `${numericMinutes} min`;
    } else {
      const extraTime = numericMinutes - 90;
      return `90 + ${extraTime} min`;
    }
  };




  const addEvent = async (type, team, teamScore, matchId, player = null) => {
    if (type === 'GOAL') {
      try {
        let updatedMatchData = {};

        if (team === 'A') {
          let anotherGoal = updatedMatch[0].homeScore + 1;
          setMatchData(prev => ({ ...prev, teamAScore: anotherGoal }));
          updatedMatchData = { homeScore: anotherGoal };
        } else if (team === 'B') {
          let anotherGoal = updatedMatch[0].awayScore + 1;
          setMatchData(prev => ({ ...prev, teamBScore: anotherGoal }));
          updatedMatchData = {
            awayScore: anotherGoal, goals: [
              {
                "nationalTeamPlayerStaffId": 1,
                "minute": 1,
                "liveMatchId": 3
              }
            ],
          };
        }
        console.log("updatedMatchData : ", updatedMatchData)

        const endpoint = `/live-matches/${matchId}/score`;
        const response = await axiosInstance.patch(endpoint, updatedMatchData);
        // console.log('API Response:', response.data);axios
        toast.success('Score added successfully!', {
          description: `Score added successfully`
        });
      } catch (error) {
        console.error('Error updating:', error.response ? error.response.data : error.message);
      }
    }
  };

  const handleEventWithPlayer = (type, team) => {
    setPendingEvent({ type, team });
    setShowPlayerSelect(true);
  };


  const filteredPlayers =
    pendingEvent?.team === 'B'
      ? teamBPlayers.filter((player) =>
        `${player.playerStaff.firstName} ${player.playerStaff.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
      : [];

  useEffect(() => {
    if (match.status === 'LIVE') {
      const minuteInterval = setInterval(() => {
        setCurrentMinute(calculateMatchMinute(match.startTime));
      }, 60000); // Updates every minute

      return () => clearInterval(minuteInterval);
    }
  }, [match.startTime, match.status]);

  const confirmEventWithPlayer = (playerId) => {
    console.log('ID of the player who scored:', playerId);

    if (pendingEvent.team === 'A') {
      const player = teamAPlayers.find(p => p.id === playerId);
      const playerDetails = player
        ? {
          id: player.playerStaff.id,
          fullName: `${player.playerStaff.lastName} ${player.playerStaff.firstName}`,
        }
        : null;

      console.log('Selected player details:', playerDetails);

      if (playerDetails) {
        addEvent('GOAL', 'A', match.awayScore, match.id);
      }
    } else if (pendingEvent.team === 'B') {
      const player = teamBPlayers.find(p => p.id === playerId);
      const playerDetails = player
        ? {
          id: player.playerStaff.id,
          fullName: `${player.playerStaff.lastName} ${player.playerStaff.firstName}`,
        }
        : null;

      console.log('Selected player details:', playerDetails);

      if (playerDetails) {
        addEvent('GOAL', 'B', match.awayScore, match.id);
      }
    }

    setShowPlayerSelect(false);
    setPendingEvent(null);
    setSelectedPlayer(null);
  };


  if (!updatedMatch.length > 0) {
    return <div>no match id found</div>;
  }
  const handlePeriodChange = (newStatus) => {
    setMatchData(prev => ({
      ...prev,
      status: newStatus,
      addedTime: 0,
      currentTime: newStatus === 'SECOND_HALF' ? '45:00' : prev.currentTime
    }));
  };

  const handleAddedTime = (minutes) => {
    setMatchData(prev => ({
      ...prev,
      addedTime: minutes,
      status: prev.period === 'FIRST_HALF' ? 'ADDED_TIME_1' : 'ADDED_TIME_2'
    }));
  };




  const renderMatchControls = () => (
    <div className="bg-white p-4 rounded-lg border mb-4">
      {permissions.canUpdate && (
        <div className="flex items-center justify-between">
          <div className="space-x-2">
            <Button
              size="sm"
              variant={matchData.status === 'FIRST_HALF' ? 'default' : 'outline'}
              onClick={() => handlePeriodChange('FIRST_HALF')}
            >
              1st Half
            </Button>
            <Button
              size="sm"
              variant={matchData.status === 'HALF_TIME' ? 'default' : 'outline'}
              onClick={() => handlePeriodChange('HALF_TIME')}
            >
              Half Time
            </Button>
            <Button
              size="sm"
              variant={matchData.status === 'SECOND_HALF' ? 'default' : 'outline'}
              onClick={() => handlePeriodChange('SECOND_HALF')}
            >
              2nd Half
            </Button>
            <Button
              size="sm"
              variant={matchData.status === 'FULL_TIME' ? 'default' : 'outline'}
              onClick={() => handlePeriodChange('FULL_TIME')}
            >
              Full Time
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Added Time:</span>
            <Input
              type="number"
              min="0"
              max="15"
              value={matchData.addedTime}
              onChange={(e) => handleAddedTime(parseInt(e.target.value, 10))}
              className="w-16"
            />
            <span className="text-sm">min</span>
          </div>
        </div>
      )}
    </div>
  );
  // console.log('home score : ', updatedMatch[0])

  const renderScoreboard = () => (
    <div className="bg-gray-50 p-6 rounded-xl mb-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <h3 className="font-medium mb-2">{match.homeTeam || 'Home Team'}</h3>
          <div className="text-5xl font-bold mb-2">{updatedMatch[0].homeScore || 0}</div>
          <div className="flex justify-center gap-2">
            {/*{permissions.canUpdate && (*/}
            {/*<Button*/}
            {/*  size="sm"*/}
            {/*  variant="outline"*/}
            {/*  onClick={() => addEvent('GOAL', 'A', matchData.teamAScore, match.id)}*/}
            {/*>*/}
            {/*  ⚽ Goal*/}
            {/*</Button>*/}
            {/*)}*/}
          </div>
        </div>

        <div className="text-center">
          <div className="text-5xl font-bold mb-2">{parseInt(currentMinute) > 90
            ? `90+${parseInt(currentMinute) - 90}'`
            : `${currentMinute}'`
          }</div>
          <div className="flex justify-center gap-2">
            {permissions.canUpdate && (

              <Button
                size="sm"
                variant={timerRunning ? 'default' : 'outline'}
              >
                {(currentMinute < 0) ? `Start Match` : (currentMinute === '45') ? `Half Time` : (currentMinute >= '90') ? 'End Match' : 'End Match'}
              </Button>

            )}

          </div>
          <div className="mt-2 text-sm text-gray-500">
            {matchData.status.replace(/_/g, ' ')}
          </div>
        </div>

        <div className="text-center">
          <h3 className="font-medium mb-2">{match.awayTeam || 'Away Team'}</h3>
          <div className="text-5xl font-bold mb-2">{updatedMatch[0].awayScore || 0}</div>
          <div className="flex justify-center gap-2">
            {/*{permissions.canUpdate && (*/}

            {/*    <Button*/}
            {/*        size="sm"*/}
            {/*        variant="outline"*/}
            {/*        onClick={() => addEvent('GOAL', 'B', matchData.teamBScore, match.id)}*/}
            {/*    >*/}
            {/*      ⚽ Goal*/}
            {/*    </Button>*/}
            {/*)}*/}
          </div>
        </div>
      </div>
    </div>
  );

  const renderControls = () => (

    <div className="grid grid-cols-2 gap-6 mb-6">

      <div className="space-y-4">
        {permissions.canUpdate && (
          <>
            <h3 className="font-medium">{match.homeTeam || 'Home Team'} Controls</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleEventWithPlayer('GOAL', 'A', matchData.teamAScore, match.id)}
                className="w-full col-span-2"
              >
                ⚽ Goal
              </Button>

              {permissions.canUpdate && (<Button
                variant="destructive"
                onClick={() => handleEventWithPlayer('YELLOW_CARD', 'A')}
              >
                🟨 Yellow Card
              </Button>)}

              {permissions.canUpdate && (
                <Button
                  variant="destructive"
                  onClick={() => handleEventWithPlayer('RED_CARD', 'A')}
                >
                  🟥 Red Card
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => useLineUp('B')}
              >
                Line Up
              </Button>
              <button
                className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition-transform"
                onClick={() => setLineUpModalOpen(false)}
              >
                Close Lineup
              </button>
            </div>
            {lineUpModalOpen ? (
              <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {match.awayTeam} Lineup
                </h2>
                <div className="space-y-4">
                  {awayTeamLineUp.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                          {player.playerStaff.lastName} {player.playerStaff.firstName}
                        </span>
                        <span className="text-sm text-gray-600 italic">
                          {player.playerStaff.positionInClub}
                        </span>
                      </div>
                      <label
                        className="flex items-center space-x-2 cursor-pointer"
                        title={
                          fieldStatus[player.id]
                            ? "Player is on the field"
                            : "Player is off the field"
                        }
                      >
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={fieldStatus[player.id] || false} // Use checked here
                          onChange={(e) => toggleFieldStatus(player, e.target.checked)} // Pass correct `isChecked` state
                        />
                        <span
                          className={`text-sm ${fieldStatus[player.id]
                            ? "text-green-600 font-semibold"
                            : "text-red-600"
                            }`}
                        >
                          {fieldStatus[player.id] ? "On Field" : "Off Field"}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
                <button
                  className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition-transform"
                  onClick={() => setLineUpModalOpen(false)}
                >
                  Close Lineup
                </button>
              </div>
            ) : null}
          </>
        )}

      </div>

      <div className="space-y-4">
        {permissions.canUpdate && (<> <h3 className="font-medium">{match.awayTeam || 'Away Team'} Controls</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleEventWithPlayer('GOAL', 'B')}
              className="w-full col-span-2"
            >
              ⚽ Goal
            </Button>
            {permissions.canUpdate && (<Button
              variant="destructive"
              onClick={() => handleEventWithPlayer('YELLOW_CARD', 'B')}
            >
              🟨 Yellow Card
            </Button>)}

            {permissions.canUpdate && (
              <Button
                variant="destructive"
                onClick={() => handleEventWithPlayer('RED_CARD', 'B')}
              >
                🟥 Red Card
              </Button>
            )}
          </div>
        </>)}
        <Button variant="outline" onClick={() => useLineUp("A")}>
          Line Up
        </Button>
        {lineUpModalOpen ? (
          <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {match.homeTeam} Lineup
            </h2>
            <div className="space-y-4">
              {homeTeamLineUp.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                      {player.playerStaff.lastName} {player.playerStaff.firstName}
                    </span>
                    <span className="text-sm text-gray-600 italic">
                      {player.playerStaff.positionInClub}
                    </span>
                  </div>
                  <label
                    className="flex items-center space-x-2 cursor-pointer"
                    title={
                      fieldStatus[player.id]
                        ? "Player is on the field"
                        : "Player is off the field"
                    }
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={fieldStatus[player.id] || false} // Use checked here
                      onChange={(e) => toggleFieldStatus(player, e.target.checked)} // Pass correct `isChecked` state
                    />
                    <span
                      className={`text-sm ${fieldStatus[player.id]
                        ? "text-green-600 font-semibold"
                        : "text-red-600"
                        }`}
                    >
                      {fieldStatus[player.id] ? "On Field" : "Off Field"}
                    </span>
                  </label>
                </div>
              ))}
            </div>
            <button
              className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition-transform"
              onClick={() => setLineUpModalOpen(false)}
            >
              Close Lineup
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium">Match Events</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowPlayerStats(true)}
        >
          <Users className="w-4 h-4 mr-2" />
          Player Stats
        </Button>
      </div>
      <div className="p-4">
        {matchData.events.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No events recorded yet
          </div>
        ) : (
          <div className="space-y-2">
            {matchData.events.map((event, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  {event.type === 'GOAL' && '⚽'}
                  {event.type === 'YELLOW_CARD' && '🟨'}
                  {event.type === 'RED_CARD' && '🟥'}
                  <span>
                    {event.team === 'A' ? match.homeTeam?.name : match.awayTeam?.name}
                    {event.player && ` - ${event.player.name}`}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{event.minute}'</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );


  const renderPlayerSelect = () => (
    <Dialog open={showPlayerSelect} onOpenChange={setShowPlayerSelect}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Player</DialogTitle>
          <DialogDescription>
            Choose the player for this event
          </DialogDescription>
        </DialogHeader>

        <Select value={selectedPlayer} onValueChange={(value) => confirmEventWithPlayer(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select player" />
          </SelectTrigger>
          <SelectContent className="border-2 border-blue-500 h-80 overflow-y-auto mt-2">
            {pendingEvent?.team === 'A' &&
              teamAPlayers?.map(player => (
                <SelectItem key={player.id} value={player.id}>
                  #{player.playerStaff.id} - {player.playerStaff.lastName} {player.playerStaff.firstName}
                </SelectItem>
              ))}
            {pendingEvent?.team === 'B' &&
              teamBPlayers?.map(player => (
                <SelectItem key={player.id} value={player.id}>
                  #{player.playerStaff.id} - {player.playerStaff.lastName} {player.playerStaff.firstName}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {renderMatchControls()}
      {renderScoreboard()}
      {renderControls()}
      {renderEvents()}
      {renderPlayerSelect()}

      <Dialog open={showPlayerStats} onOpenChange={setShowPlayerStats}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Player Statistics</DialogTitle>
            <DialogDescription>
              View detailed statistics for all players in the match.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <PlayerStatsDisplay
              players={[...(teamAPlayers || []), ...(teamBPlayers || [])]}
              gameType="football"
              events={matchData.events}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
