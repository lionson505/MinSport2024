import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/Button';
import { TimerDisplay } from '../../../../components/scoreboards/TimerDisplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import { Users } from 'lucide-react';
import { PlayerSelectDialog } from '../PlayerSelectDialog';
import { ScoreInput } from '../../../../components/scoreboards/ScoreInput';
import axiosInstance from '../../../../utils/axiosInstance';
import useFetchLiveMatches from '../../../../utils/fetchLiveMatches';
import toast from 'react-hot-toast';
import { useFetchNationalTeam, useFetchPlayers } from './../../../../utils/fetchMatchAndPlayers';

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
  const { matches, liveMatchError } = useFetchLiveMatches()
  const { players, playersError } = useFetchPlayers();
  const { nationalTeam, setNationalTeams } = useFetchNationalTeam();
  // console.log("nationalTeam : ", nationalTeam)
  const [lineUpModalOpen, setLineUpModalOpen] = useState();
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  // const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [fieldStatus, setFieldStatus] = useState({});
  const [isChecked, setIsChecked] = useState();
  // console.log(" checked : ", isChecked)



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

  // const LineupModal = ({ isOpen, onClose, players }) => {
  //   const [fieldStatus, setFieldStatus] = useState(
  //     players.reduce((acc, player) => ({ ...acc, [player.id]: false }), {})
  //   );

  //   const toggleFieldStatus = (id) => {
  //     setFieldStatus((prev) => ({ ...prev, [id]: !prev[id] }));
  //   };

  //   if (!isOpen) return null;


  // const players = [
  //   { id: 1, name: "John Doe", position: "Defender" },
  //   { id: 2, name: "Jane Smith", position: "Midfielder" },
  //   { id: 3, name: "Mike Johnson", position: "Striker" },
  //   { id: 4, name: "Emily Davis", position: "Goalkeeper" },
  // ];


  // Team A players
  const homeTeamName = match.homeTeam;
  const homeTeamId = nationalTeam.filter(nationalTeamName => nationalTeamName.teamName === homeTeamName)
  // console.log("homeTeamId : ", homeTeamId)
  const homeTeamLineUp = players.filter(player => player.teamId === homeTeamId[0]?.id);
  // console.log("homeTeamLineUp:", homeTeamLineUp);

  //     useEffect(() => {
  // }, [isChecked])
  const toggleFieldStatus = (player, isChecked) => {
    // Update fieldStatus state for the player
    setFieldStatus((prev) => ({ ...prev, [player.id]: isChecked }));
  
    // Update the selectedPlayers array based on whether the player is checked or unchecked
    setSelectedPlayers((prev) => {
      if (isChecked) {
        const updated = [...prev, player];
        console.log("Selected Players:", updated); // Log updated players
        return updated;
      } else {
        const updated = prev.filter((p) => p.id !== player.id);
        console.log("Selected Players:", updated); // Log updated players
        return updated;
      }
    });
  };

  const useLineUp = () => {
    setLineUpModalOpen((prev) => !prev);
  };

  useEffect(() => {
    setSelectedPlayers((prev) => {
      if (isChecked) {
        // Add player to the selected list
        const updated = [...prev, player];
        console.log("Selected Players:", updated);
        return updated;
      } else {
        // Remove player from the selected list
        const updated = prev.filter((p) => p.id !== player.id);
        console.log("Selected Players:", updated);
        return updated;
      }
    });
  }, [isChecked])

  // Team B players
  const awayTeamName = match.awayTeam;
  const awayTeamId = nationalTeam.filter(nationalTeamName => nationalTeamName.teamName === awayTeamName)
  // console.log("homeTeamId : ", homeTeamId)
  const awayTeamLineUp = players.filter(player => player.teamId === awayTeamId[0]?.id);
  // console.log("awayTeamLineUp:", awayTeamLineUp);

  // const [fieldStatus, setFieldStatus] = useState(
  //   players.reduce((acc, player) => ({ ...acc, [player.id]: false }), {})
  // );

  // const toggleFieldStatus = (id) => {
  //   setFieldStatus((prev) => ({ ...prev, [id]: !prev[id] }));
  // };

  // const useLineUp = (team) => {
  //   console.log(`Team ${team} lineup clicked`);
  //   setLineUpModalOpen((prev) => !prev);
  // };

  // end with line up logics




  const confirmEventWithPlayer = (playerName) => {
    // console.log('Player Name:', playerName);


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
    // console.log('handle event with player details : ', { matchId, event, nationalTeamPlayerStaffId })
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
          score: `${pendingEvent.team === 'A' ? prev.teamAScore + pendingEvent.points : prev.teamAScore}-${pendingEvent.team === 'B' ? prev.teamBScore + pendingEvent.points : prev.teamBScore
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



  const updatedMatch = matches.filter((updatedMatch) => updatedMatch.id === match.id)


  if (!updatedMatch.length > 0) {
    return <div>no match id found</div>;
  }
  // console.log('updated Match ', updatedMatch[0].homeScore)

  const handleEventWithPlayer = async (type, team, points = 1, player) => {



    try {
      // // console.log('Event Details:', { player, type, team, points });

      // Update the pending event
      setPendingEvent({ type, team, points, player });
      if (!player) {
        setShowPlayerSelect(true);
        console.error('Player not found or invalid player name.');
        return;
      }

      // Update scores based on the event
      const updatedScores = {
        homeScore: updatedMatch[0].homeScore,
        awayScore: updatedMatch[0].awayScore,
      };

      if (type === 'POINTS') {
        if (team === 'A') updatedScores.homeScore += points;
        else if (team === 'B') updatedScores.awayScore += points;
      }

      // Update the match score via API
      await axiosInstance.patch(`/live-matches/${match.id}/score`, updatedScores);
      // // console.log('Match score updated successfully.');
      console.log('points', points)
      if (points === 1) {
        toast.success('Point added successfully!', {
          description: `Score added successfully`
        });
      } else {
        toast.success('Points added successfully!', {
          description: `Score added successfully`
        });
      }
    } catch (error) {
      if (!points === 1)
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
            value={updatedMatch[0].homeScore || 0}
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
            value={updatedMatch[0].awayScore || 0}
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
        <h3 className="font-medium">{match.homeTeam || 'Home Team'} Controls</h3>
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
          <Button variant="outline" onClick={() => useLineUp("A")}>
            Line Up
          </Button>
        </div>
        <div>
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

      {/* Team B Controls */}
      <div className="space-y-4">
        <h3 className="font-medium">{match.awayTeam || 'Away Team'} Controls</h3>
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
          <Button
            variant="outline"
            onClick={() => useLineUp('B')}
          >
            Line Up
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