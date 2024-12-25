import { useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { TimerDisplay } from '../../../../components/scoreboards/TimerDisplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import { Users } from 'lucide-react';
import { PlayerSelectDialog } from '../PlayerSelectDialog';
import { ScoreInput } from '../../../../components/scoreboards/ScoreInput';

export default function BasketballScoreboard({ match, teamAPlayers = [], teamBPlayers = [], onUpdate }) {
  const [matchData, setMatchData] = useState({
    status: 'NOT_STARTED',
    currentQuarter: 1,
    teamAScore: 0,
    teamBScore: 0,
    teamAFouls: 0,
    teamBFouls: 0,
    timeouts: {
      A: 4,
      B: 4
    },
    events: []
  });

  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(null);
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);

  const addPoints = (team, points) => {
    setMatchData(prev => ({
      ...prev,
      [`team${team}Score`]: prev[`team${team}Score`] + points,
      events: [...prev.events, {
        type: 'POINTS',
        team,
        points,
        time: new Date().toISOString(),
        score: `${team === 'A' ? prev.teamAScore + points : prev.teamAScore}-${team === 'B' ? prev.teamBScore + points : prev.teamBScore}`
      }]
    }));
  };

  const addFoul = (team) => {
    setMatchData(prev => ({
      ...prev,
      [`team${team}Fouls`]: prev[`team${team}Fouls`] + 1,
      events: [...prev.events, {
        type: 'FOUL',
        team,
        time: new Date().toISOString()
      }]
    }));
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

  const handleEventWithPlayer = (type, team, points = null) => {
    setPendingEvent({ type, team, points });
    setShowPlayerSelect(true);
  };

  const confirmEventWithPlayer = (playerId) => {
    const player = pendingEvent.team === 'A' 
      ? teamAPlayers.find(p => p.id === playerId)
      : teamBPlayers.find(p => p.id === playerId);

    if (pendingEvent.type === 'POINTS') {
      setMatchData(prev => ({
        ...prev,
        [`team${pendingEvent.team}Score`]: prev[`team${pendingEvent.team}Score`] + pendingEvent.points,
        events: [...prev.events, {
          type: 'POINTS',
          team: pendingEvent.team,
          player,
          points: pendingEvent.points,
          time: new Date().toISOString(),
          score: `${pendingEvent.team === 'A' ? 
            prev.teamAScore + pendingEvent.points : 
            prev.teamAScore}-${pendingEvent.team === 'B' ? 
            prev.teamBScore + pendingEvent.points : 
            prev.teamBScore}`
        }]
      }));
    } else if (pendingEvent.type === 'FOUL') {
      setMatchData(prev => ({
        ...prev,
        [`team${pendingEvent.team}Fouls`]: prev[`team${pendingEvent.team}Fouls`] + 1,
        events: [...prev.events, {
          type: 'FOUL',
          team: pendingEvent.team,
          player,
          time: new Date().toISOString()
        }]
      }));
    }

    setShowPlayerSelect(false);
    setPendingEvent(null);
  };

  const handleScoreChange = (team, newScore) => {
    const prevScore = matchData[`team${team}Score`];
    const points = newScore - prevScore;
    
    if (points !== 0) {
      setMatchData(prev => ({
        ...prev,
        [`team${team}Score`]: newScore,
        events: [...prev.events, {
          type: 'SCORE_CHANGE',
          team,
          points,
          time: new Date().toISOString(),
          score: `${team === 'A' ? newScore : prev.teamAScore}-${team === 'B' ? newScore : prev.teamBScore}`
        }]
      }));
    }
  };

  const renderScoreboard = () => (
    <div className="bg-gray-50 p-6 rounded-xl">
      <div className="grid grid-cols-3 gap-4">
        {/* Team A */}
        <div className="text-center space-y-4">
          <h3 className="font-medium mb-2">{match.homeTeam?.name || 'Home Team'}</h3>
          <ScoreInput
            value={matchData.teamAScore}
            onChange={(value) => handleScoreChange('A', value)}
            label="Score"
          />
          <div className="text-sm text-gray-500">Fouls: {matchData.teamAFouls}</div>
          <div className="text-sm text-gray-500">Timeouts: {matchData.timeouts.A}</div>
        </div>

        {/* Center Info */}
        <div className="text-center">
          <div className="text-xl font-medium mb-2">Quarter {matchData.currentQuarter}</div>
          <TimerDisplay
            initialTime="10:00"
            isCountdown={true}
            onTimeUpdate={(time) => setMatchData(prev => ({ ...prev, currentTime: time }))}
            disabled={matchData.status === 'FINISHED'}
          />
        </div>

        {/* Team B */}
        <div className="text-center space-y-4">
          <h3 className="font-medium mb-2">{match.awayTeam?.name || 'Away Team'}</h3>
          <ScoreInput
            value={matchData.teamBScore}
            onChange={(value) => handleScoreChange('B', value)}
            label="Score"
          />
          <div className="text-sm text-gray-500">Fouls: {matchData.teamBFouls}</div>
          <div className="text-sm text-gray-500">Timeouts: {matchData.timeouts.B}</div>
        </div>
      </div>
    </div>
  );

  const renderControls = () => (
    <div className="grid grid-cols-2 gap-6">
      {/* Team A Controls */}
      <div className="space-y-4">
        <h3 className="font-medium">{match.homeTeam?.name || 'Home Team'} Controls</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={() => handleEventWithPlayer('POINTS', 'A', 1)}>+1</Button>
          <Button onClick={() => handleEventWithPlayer('POINTS', 'A', 2)}>+2</Button>
          <Button onClick={() => handleEventWithPlayer('POINTS', 'A', 3)}>+3</Button>
          <Button 
            variant="outline" 
            onClick={() => handleEventWithPlayer('FOUL', 'A')}
          >
            Foul
          </Button>
          <Button 
            variant="outline" 
            onClick={() => useTimeout('A')}
          >
            Timeout
          </Button>
        </div>
      </div>

      {/* Team B Controls */}
      <div className="space-y-4">
        <h3 className="font-medium">{match.awayTeam?.name || 'Away Team'} Controls</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={() => handleEventWithPlayer('POINTS', 'B', 1)}>+1</Button>
          <Button onClick={() => handleEventWithPlayer('POINTS', 'B', 2)}>+2</Button>
          <Button onClick={() => handleEventWithPlayer('POINTS', 'B', 3)}>+3</Button>
          <Button 
            variant="outline" 
            onClick={() => handleEventWithPlayer('FOUL', 'B')}
          >
            Foul
          </Button>
          <Button 
            variant="outline" 
            onClick={() => useTimeout('B')}
          >
            Timeout
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderScoreboard()}
      {renderControls()}

      <PlayerSelectDialog
        open={showPlayerSelect}
        onClose={() => setShowPlayerSelect(false)}
        onSelect={confirmEventWithPlayer}
        players={pendingEvent?.team === 'A' ? teamAPlayers : teamBPlayers}
        title={`Select Player for ${pendingEvent?.type}`}
        description={`Choose the player who ${
          pendingEvent?.type === 'POINTS' ? `scored ${pendingEvent.points} points` :
          pendingEvent?.type === 'FOUL' ? 'committed the foul' :
          'for this event'
        }`}
      />
    </div>
  );
} 