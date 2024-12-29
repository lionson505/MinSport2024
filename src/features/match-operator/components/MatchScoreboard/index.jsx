import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import FootballScoreboard from './FootballScoreboard';
import BasketballScoreboard from './BasketballScoreboard';
import VolleyballScoreboard from './VolleyballScoreboard';
export function MatchScoreboard({ match, homeTeamPlayers, awayTeamPlayers, onClose }) {
  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);


  // Load players from match setup data
  useEffect(() => {
    if (match.setupData) {
      setTeamAPlayers(match.setupData.homeTeam?.players || []);
      setTeamBPlayers(match.setupData.awayTeam?.players || []);
    }
  }, [match.setupData]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Match Scoreboard</DialogTitle>
          <DialogDescription>
            {match.competition} - Live match management interface
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {match.gameType === 'Football' && (
            <FootballScoreboard
              match={match}
              onClose={onClose}
              teamAPlayers={homeTeamPlayers}
              teamBPlayers={awayTeamPlayers}
            />
          )}
          {match.gameType === 'Basketball' && (
            <BasketballScoreboard
              match={match}
              onClose={onClose}
              teamAPlayers={homeTeamPlayers}
              teamBPlayers={awayTeamPlayers}
            />
          )}
          {match.gameType === 'Volleyball' && (
            <VolleyballScoreboard
              match={match}
              onClose={onClose}
              teamAPlayers={homeTeamPlayers}
              teamBPlayers={awayTeamPlayers}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 