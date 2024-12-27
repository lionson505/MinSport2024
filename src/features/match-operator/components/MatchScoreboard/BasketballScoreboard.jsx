import { useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { TimerDisplay } from '../../../../components/scoreboards/TimerDisplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import { Users } from 'lucide-react';
import { PlayerSelectDialog } from '../PlayerSelectDialog';
import { ScoreInput } from '../../../../components/scoreboards/ScoreInput';
import axiosInstance from '../../../../utils/axiosInstance';

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





  const confirmEventWithPlayer = (playerName) => {
    console.log('Player Name:', playerName);

  
    if (!playerName) {
      console.error('No player name provided.');
      return;
    }
  
    // Determine the player based on the team
    const player = playerName

    if (!player) {
      console.error('Player not found in the selected team.');
      return;
    }
  
    // Handle the event with the selected player
    handleEventWithPlayer(pendingEvent.type, pendingEvent.team, pendingEvent.points, player);
    let matchId = match.id,
    event = `${pendingEvent.points} ${pendingEvent.type}`,
    nationalTeamPlayerStaffId = player;
    console.log('handle event with player details : ', { matchId, event, nationalTeamPlayerStaffId })
    // Update match data based on event type
    setMatchData(prev => {
      const teamScoreKey = `team${pendingEvent.team}Score`;
      const teamFoulsKey = `team${pendingEvent.team}Fouls`;
      const updatedEvents = [...prev.events];
  
      if (pendingEvent.type === 'POINTS') {
        updatedEvents.push({
          type: 'POINTS',
          team: pendingEvent.team,
          player,
          points: pendingEvent.points,
          time: new Date().toISOString(),
          score: `${pendingEvent.team === 'A' ? prev.teamAScore + pendingEvent.points : prev.teamAScore}-${
            pendingEvent.team === 'B' ? prev.teamBScore + pendingEvent.points : prev.teamBScore
          }`
        });
  
        return {
          ...prev,
          [teamScoreKey]: prev[teamScoreKey] + pendingEvent.points,
          events: updatedEvents
        };
      } else if (pendingEvent.type === 'FOUL') {
        updatedEvents.push({
          type: 'FOUL',
          team: pendingEvent.team,
          player,
          time: new Date().toISOString()
        });
  
        return {
          ...prev,
          [teamFoulsKey]: prev[teamFoulsKey] + 1,
          events: updatedEvents
        };
      }
  
      return prev; // Fallback in case of unknown event type
    });
  
    // Reset states after processing the event
    setShowPlayerSelect(false);
    setPendingEvent(null);
  };
  
  const handleEventWithPlayer = async (type, team, points = 1, player) => {
    /* if (!player) {
      console.error('Player not found or invalid player name.');
      return;
    } */


  
    try {
      console.log('Event Details:', { player, type, team, points });
      
      // Update the pending event
      setPendingEvent({ type, team, points, player });
      setShowPlayerSelect(true);
  
      // Update scores based on the event
      const updatedScores = {
        homeScore: match.homeScore,
        awayScore: match.awayScore,
      };
  
      if (type === 'POINTS') {
        if (team === 'A') updatedScores.homeScore += points;
        else if (team === 'B') updatedScores.awayScore += points;
      }
  
      console.log('Points:', points);
      console.log('Updated Scores:', updatedScores);
  
      // Update the match score via API
      await axiosInstance.patch(`/live-matches/${match.id}/score`, updatedScores);
      console.log('Match score updated successfully.');
    } catch (error) {
      console.error('Failed to update match score:', error);
    }
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
          <h3 className="font-medium mb-2">{match.homeTeam || 'Home Team'}</h3>
          <ScoreInput
            value={match.homeScore || 0}
            match={match}
            team='A'
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
          <h3 className="font-medium mb-2">{match.awayTeam || 'Away Team'}</h3>
          <ScoreInput
            value={match.awayScore || 0}
            match={match}
            team='B'
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
        description={`Choose the player who ${pendingEvent?.type === 'POINTS' ? `scored ${pendingEvent.points} points` :
            pendingEvent?.type === 'FOUL' ? 'committed the foul' :
              'for this event'
          }`}
      />
    </div>
  );
} 