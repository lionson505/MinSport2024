import { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/Button';
import { TimerDisplay } from '../../../../components/scoreboards/TimerDisplay';
import { PlayerStatsDisplay } from '../../../../components/scoreboards/PlayerStatsDisplay';
import { TeamStatsDisplay } from '../../../../components/scoreboards/TeamStatsDisplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import { Timer, Users, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Input } from '../../../../components/ui/input';

export default function FootballScoreboard({ match, teamAPlayers = [], teamBPlayers = [], onUpdate }) {
  const [matchData, setMatchData] = useState({
    status: 'NOT_STARTED', // NOT_STARTED, FIRST_HALF, HALF_TIME, SECOND_HALF, ADDED_TIME_1, ADDED_TIME_2, FULL_TIME
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

  const addEvent = (type, team, player = null) => {
    setMatchData(prev => ({
      ...prev,
      events: [...prev.events, {
        type,
        team,
        player,
        minute: prev.currentTime,
        timestamp: new Date().toISOString()
      }],
      ...(type === 'GOAL' && {
        [`team${team}Score`]: prev[`team${team}Score`] + 1
      })
    }));
  };

  const handleEventWithPlayer = (type, team) => {
    setPendingEvent({ type, team });
    setShowPlayerSelect(true);
  };

  // for searching Player 
  const [searchTerm, setSearchTerm] = useState('');

  // Filter players based on the search term
  const filteredPlayers =
    pendingEvent?.team === 'B'
      ? teamBPlayers.filter((player) =>
        `${player.playerStaff.firstName} ${player.playerStaff.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
      : [];


  const confirmEventWithPlayer = (playerId) => {
    console.log('ID of the player who scored:', playerId);

    // Find the player based on the team
    const player = pendingEvent.team === 'A'
      ? teamAPlayers.find(p => p.id === playerId)
      : teamBPlayers.find(p => p.id === playerId);

    // Create a formatted object or string with full name
    const playerDetails = player
      ? {
        id: player.playerStaff.id,
        fullName: `${player.playerStaff.lastName} ${player.playerStaff.firstName}`,
      }
      : null;

    console.log('Selected player details:', playerDetails);

    // Add event and reset states
    if (playerDetails) {
      addEvent(pendingEvent.type, pendingEvent.team, playerDetails.fullName);
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
    </div>
  );

  const renderScoreboard = () => (
    <div className="bg-gray-50 p-6 rounded-xl mb-6">
      <div className="grid grid-cols-3 gap-4">
        {/* Team A */}
        <div className="text-center">
          <h3 className="font-medium mb-2">{match.homeTeam || 'Home Team'}</h3>
          <div className="text-5xl font-bold mb-2">{match.homeScore}</div>
          <div className="flex justify-center gap-2">
            {/* <Button
              size="sm"
              variant="outline"
              onClick={() => addEvent('GOAL', 'A')}
            >
              ⚽ Goal
            </Button> */}
          </div>
        </div>

        {/* Match Info */}
        <div className="text-center">
          <TimerDisplay
            initialTime="00:00"
            isCountdown={false}
            onTimeUpdate={(time) => setMatchData(prev => ({ ...prev, currentTime: time }))}
            disabled={matchData.status === 'FULL_TIME'}
          />
          <div className="mt-2 text-sm text-gray-500">
            {matchData.status.replace(/_/g, ' ')}
          </div>
        </div>

        {/* Team B */}
        <div className="text-center">
          <h3 className="font-medium mb-2">{match.awayTeam || 'Away Team'}</h3>
          <div className="text-5xl font-bold mb-2">{match.awayScore}</div>
          <div className="flex justify-center gap-2">
            {/* <Button
              size="sm"
              variant="outline"
              onClick={() => addEvent('GOAL', 'B')}
            >
              ⚽ Goal
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  );

  const renderControls = () => (
    <div className="grid grid-cols-2 gap-6 mb-6">
      {/* Team A Controls */}
      <div className="space-y-4">
        <h3 className="font-medium">{match.homeTeam || 'Home Team'} Controls</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleEventWithPlayer('GOAL', 'A')}
            className="w-full col-span-2"
          >
            ⚽ Goal
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleEventWithPlayer('YELLOW_CARD', 'A')}
          >
            🟨 Yellow Card
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleEventWithPlayer('RED_CARD', 'A')}
          >
            🟥 Red Card
          </Button>
        </div>
      </div>

      {/* Team B Controls */}
      <div className="space-y-4">
        <h3 className="font-medium">{match.awayTeam || 'Away Team'} Controls</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleEventWithPlayer('GOAL', 'B')}
            className="w-full col-span-2"
          >
            ⚽ Goal
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleEventWithPlayer('YELLOW_CARD', 'B')}
          >
            🟨 Yellow Card
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleEventWithPlayer('RED_CARD', 'B')}
          >
            🟥 Red Card
          </Button>
        </div>
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