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
import {usePermissionLogger} from "../../../../utils/permissionLogger.js";

export default function FootballScoreboard({ match, teamAPlayers = [], teamBPlayers = [], onUpdate }) {
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
  const { matches = [], liveMatchError } = useFetchLiveMatches()
  const updatedMatch = matches.filter((updatedMatch) => updatedMatch.id === match.id)

  const permissionLogger = usePermissionLogger('match_operator')
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false
  })
  // console.log('here is matches : ', updatedMatch)



  /*
  // Fetch updated match data from the API
  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const response = await axiosInstance.get(`/live-matches/${match.id}`);
        const updatedData = response.data;
        setMatchData(prev => ({
          ...prev,
          teamAScore: updatedData.homeScore,
          teamBScore: updatedData.awayScore,
          events: updatedData.events || []
        }));
      } catch (error) {
        console.error('Error fetching match data:', error.response ? error.response.data : error.message);
      }

    };

    fetchMatchData();
  }, [match.id]);
  */
  const fetchPermissions = async ()=> {
    const currentPermissions =await permissionLogger();
    await setPermissions(currentPermissions);
  }


  useEffect(() => {
    fetchPermissions();
  }, []);


  


  const startTimer = () => {
    if (!timerRunning) {
      setTimerRunning(true);
      const id = setInterval(() => {
        setMatchData(prev => {
          const [minutes, seconds] = prev.currentTime.split(':').map(Number);
          const newSeconds = seconds + 1;
          const newMinutes = minutes + Math.floor(newSeconds / 60);
          return {
            ...prev,
            currentTime: `${String(newMinutes).padStart(2, '0')}:${String(newSeconds % 60).padStart(2, '0')}`
          };
        });
      }, 1000);
      setIntervalId(id);
    }
  };

  const stopTimer = () => {
    if (timerRunning) {
      clearInterval(intervalId);
      setTimerRunning(false);
    }
  };


  if (!updatedMatch.length > 0) {
    return <div>no match id found</div>;
  }
  // console.log('updated Match ', updatedMatch[0].homeScore)

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
          updatedMatchData = { awayScore: anotherGoal };
        }

        const endpoint = `/live-matches/${matchId}/score`;
        const response = await axiosInstance.patch(endpoint, updatedMatchData);
        // console.log('API Response:', response.data);
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

  const confirmEventWithPlayer = (playerId) => {
    // console.log('ID of the player who scored:', playerId);

    if (pendingEvent.team === 'A') {
      const player = teamAPlayers.find(p => p.id === playerId);
      const playerDetails = player
        ? {
          id: player.playerStaff.id,
          fullName: `${player.playerStaff.lastName} ${player.playerStaff.firstName}`,
        }
        : null;

      // console.log('Selected player details:', playerDetails);

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

      // console.log('Selected player details:', playerDetails);

      if (playerDetails) {
        addEvent('GOAL', 'B', match.awayScore, match.id);
      }
    }

    setShowPlayerSelect(false);
    setPendingEvent(null);
    setSelectedPlayer(null);
  };

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
          <div className="text-5xl font-bold mb-2">{matchData.currentTime}</div>
          <div className="flex justify-center gap-2">
            {permissions.canUpdate && (

                <Button
                    size="sm"
                    variant={timerRunning ? 'default' : 'outline'}
                    onClick={timerRunning ? stopTimer : startTimer}
                >
                  {timerRunning ? <Pause /> : <Play />} {/* Use icons instead of text */}
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
        {permissions.canUpdate  && (
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

              </div>
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
            <Users className="w-4 h-4 mr-2"/>
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
