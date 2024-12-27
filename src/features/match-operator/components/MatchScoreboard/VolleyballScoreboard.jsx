import { useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { TimerDisplay } from '../../../../components/scoreboards/TimerDisplay';
import { PlayerStatsDisplay } from '../../../../components/scoreboards/PlayerStatsDisplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import { Users } from 'lucide-react';
import { PlayerSelectDialog } from '../PlayerSelectDialog';

export default function VolleyballScoreboard({ match, teamAPlayers = [], teamBPlayers = [], onUpdate }) {
  const [matchData, setMatchData] = useState({
    status: 'NOT_STARTED',
    currentSet: 1,
    teamAScore: 0,
    teamBScore: 0,
    teamASets: 0,
    teamBSets: 0,
    setScores: [], // [{teamA: 25, teamB: 23}, {teamA: 25, teamB: 20}, etc]
    serving: null, // 'A' or 'B'
    timeouts: {
      A: 2,
      B: 2
    },
    events: []
  });

  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(null);
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);

  const handleEventWithPlayer = (type, team) => {
    setPendingEvent({ type, team });
    setShowPlayerSelect(true);
  };

  const confirmEventWithPlayer = (playerId) => {
    const player = pendingEvent.team === 'A' 
      ? teamAPlayers.find(p => p.id === playerId)
      : teamBPlayers.find(p => p.id === playerId);

    if (pendingEvent.type === 'POINT') {
      setMatchData(prev => {
        const newScore = prev[`team${pendingEvent.team}Score`] + 1;
        const isSetPoint = (newScore >= 25 && newScore - prev[`team${pendingEvent.team === 'A' ? 'B' : 'A'}Score`] >= 2) ||
                          (prev.currentSet === 5 && newScore >= 15 && newScore - prev[`team${pendingEvent.team === 'A' ? 'B' : 'A'}Score`] >= 2);

        if (isSetPoint) {
          return handleSetWin(pendingEvent.team, prev, player);
        }

        return {
          ...prev,
          [`team${pendingEvent.team}Score`]: newScore,
          serving: pendingEvent.team,
          events: [...prev.events, {
            type: 'POINT',
            team: pendingEvent.team,
            player,
            time: new Date().toISOString(),
            score: `${pendingEvent.team === 'A' ? newScore : prev.teamAScore}-${pendingEvent.team === 'B' ? newScore : prev.teamBScore}`
          }]
        };
      });
    }

    setShowPlayerSelect(false);
    setPendingEvent(null);
  };

  const handleSetWin = (team, prevData, player) => {
    const newSetScores = [...prevData.setScores, {
      teamA: prevData.teamAScore,
      teamB: prevData.teamBScore
    }];

    const newSets = prevData[`team${team}Sets`] + 1;
    const isMatchWin = newSets >= 3;

    return {
      ...prevData,
      [`team${team}Sets`]: newSets,
      setScores: newSetScores,
      status: isMatchWin ? 'FINISHED' : 'IN_PROGRESS',
      currentSet: isMatchWin ? prevData.currentSet : prevData.currentSet + 1,
      teamAScore: 0,
      teamBScore: 0,
      timeouts: {
        A: 2,
        B: 2
      },
      events: [...prevData.events, {
        type: 'SET_WIN',
        team,
        player,
        setNumber: prevData.currentSet,
        score: `${prevData.teamAScore}-${prevData.teamBScore}`,
        time: new Date().toISOString()
      }]
    };
  };

  const useTimeout = (team) => {
    if (matchData.timeouts[team] > 0) {
      setMatchData(prev => ({
        ...prev,
        timeouts: {
          ...prev.timeouts,
          [team]: prev.timeouts[team] - 1
        },
        events: [...prev.events, {
          type: 'TIMEOUT',
          team,
          time: new Date().toISOString()
        }]
      }));
    }
  };

  const renderControls = () => (
    <div className="grid grid-cols-2 gap-6">
      {/* Team A Controls */}
      <div className="space-y-4">
        <h3 className="font-medium">{match.homeTeam?.name || 'Home Team'} Controls</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => handleEventWithPlayer('POINT', 'A')} 
            className="w-full col-span-2 h-16 text-lg"
            disabled={matchData.status === 'FINISHED'}
          >
            Add Point
          </Button>
          <Button 
            onClick={() => useTimeout('A')} 
            variant="outline"
            disabled={matchData.timeouts.A === 0 || matchData.status === 'FINISHED'}
            className="w-full"
          >
            Timeout
          </Button>
          <Button 
            onClick={() => setMatchData(prev => ({ ...prev, serving: 'A' }))}
            variant={matchData.serving === 'A' ? 'default' : 'outline'}
            className="w-full"
          >
            Service
          </Button>
        </div>
      </div>

      {/* Team B Controls */}
      <div className="space-y-4">
        <h3 className="font-medium">{match.awayTeam?.name || 'Away Team'} Controls</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => handleEventWithPlayer('POINT', 'B')} 
            className="w-full col-span-2 h-16 text-lg"
            disabled={matchData.status === 'FINISHED'}
          >
            Add Point
          </Button>
          <Button 
            onClick={() => useTimeout('B')} 
            variant="outline"
            disabled={matchData.timeouts.B === 0 || matchData.status === 'FINISHED'}
            className="w-full"
          >
            Timeout
          </Button>
          <Button 
            onClick={() => setMatchData(prev => ({ ...prev, serving: 'B' }))}
            variant={matchData.serving === 'B' ? 'default' : 'outline'}
            className="w-full"
          >
            Service
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Scoreboard */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <div className="grid grid-cols-3 gap-4">
          {/* Team A */}
          <div className="text-center">
            <h3 className="font-medium mb-2">{match.homeTeam || 'Home Team'}</h3>
            <div className="text-5xl font-bold mb-2">{match.homeScore || 0}</div>
            <div className="text-xl font-semibold">Sets: {matchData.teamASets}</div>
            <div className="mt-2">
              <span className="text-sm">Timeouts: {matchData.timeouts.A}</span>
              {matchData.serving === 'A' && (
                <span className="ml-2 inline-block w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
              )}
            </div>
          </div>

          {/* Center Info */}
          <div className="text-center">
            <div className="text-xl font-medium mb-2">Set {matchData.currentSet}</div>
            <div className="space-y-2">
              {matchData.setScores.map((set, index) => (
                <div key={index} className="text-sm">
                  Set {index + 1}: {set.teamA}-{set.teamB}
                </div>
              ))}
            </div>
          </div>

          {/* Team B */}
          <div className="text-center">
            <h3 className="font-medium mb-2">{match.awayTeam || 'Away Team'}</h3>
            <div className="text-5xl font-bold mb-2">{match.awayScore || 0}</div>
            <div className="text-xl font-semibold">Sets: {matchData.teamBSets}</div>
            <div className="mt-2">
              <span className="text-sm">Timeouts: {matchData.timeouts.B}</span>
              {matchData.serving === 'B' && (
                <span className="ml-2 inline-block w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
              )}
            </div>
          </div>
        </div>
      </div>

      {renderControls()}

      {/* Player Stats Dialog */}
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
              gameType="volleyball"
              events={matchData.events}
            />
          </div>
        </DialogContent>
      </Dialog>

      <PlayerSelectDialog
        open={showPlayerSelect}
        onClose={() => setShowPlayerSelect(false)}
        onSelect={confirmEventWithPlayer}
        players={pendingEvent?.team === 'A' ? teamAPlayers : teamBPlayers}
        title={`Select Player for ${pendingEvent?.type}`}
        description="Choose the player who scored the point"
      />
    </div>
  );
} 