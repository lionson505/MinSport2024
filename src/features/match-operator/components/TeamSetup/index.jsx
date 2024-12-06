import { useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Plus, X, User } from 'lucide-react';

export function TeamSetup({ match, onComplete }) {
  const [teamAData, setTeamAData] = useState({
    players: [],
    staff: []
  });
  const [teamBData, setTeamBData] = useState({
    players: [],
    staff: []
  });

  const positions = {
    football: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
    basketball: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
    volleyball: ['Setter', 'Outside Hitter', 'Middle Blocker', 'Opposite', 'Libero']
  };

  const addPlayer = (team, data = { name: '', number: '', position: '' }) => {
    const newPlayer = {
      id: Date.now(),
      ...data
    };

    if (team === 'A') {
      setTeamAData(prev => ({
        ...prev,
        players: [...prev.players, newPlayer]
      }));
    } else {
      setTeamBData(prev => ({
        ...prev,
        players: [...prev.players, newPlayer]
      }));
    }
  };

  const removePlayer = (team, playerId) => {
    if (team === 'A') {
      setTeamAData(prev => ({
        ...prev,
        players: prev.players.filter(p => p.id !== playerId)
      }));
    } else {
      setTeamBData(prev => ({
        ...prev,
        players: prev.players.filter(p => p.id !== playerId)
      }));
    }
  };

  const renderTeamSection = (team, data, setData) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">
          {team === 'A' ? match.homeTeam.name : match.awayTeam.name}
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => addPlayer(team)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Player
        </Button>
      </div>

      <div className="space-y-3">
        {data.players.map((player) => (
          <div key={player.id} className="bg-white p-4 rounded-lg border space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 grid grid-cols-3 gap-3">
                <Input
                  placeholder="Player name"
                  value={player.name}
                  onChange={(e) => {
                    const updated = data.players.map(p =>
                      p.id === player.id ? { ...p, name: e.target.value } : p
                    );
                    setData(prev => ({ ...prev, players: updated }));
                  }}
                />
                <Input
                  placeholder="Number"
                  type="number"
                  value={player.number}
                  onChange={(e) => {
                    const updated = data.players.map(p =>
                      p.id === player.id ? { ...p, number: e.target.value } : p
                    );
                    setData(prev => ({ ...prev, players: updated }));
                  }}
                />
                <Select
                  value={player.position}
                  onValueChange={(value) => {
                    const updated = data.players.map(p =>
                      p.id === player.id ? { ...p, position: value } : p
                    );
                    setData(prev => ({ ...prev, players: updated }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions[match.gameType]?.map(pos => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removePlayer(team, player.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Team Setup</h2>
        <p className="text-gray-500">Add players for both teams before starting the match</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {renderTeamSection('A', teamAData, setTeamAData)}
        {renderTeamSection('B', teamBData, setTeamBData)}
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setTeamAData({ players: [], staff: [] });
            setTeamBData({ players: [], staff: [] });
          }}
        >
          Reset
        </Button>
        <Button
          onClick={() => onComplete(teamAData, teamBData)}
          disabled={teamAData.players.length === 0 || teamBData.players.length === 0}
        >
          Continue to Scoreboard
        </Button>
      </div>
    </div>
  );
} 