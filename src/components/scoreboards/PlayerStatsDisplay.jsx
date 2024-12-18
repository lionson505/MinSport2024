import { useState } from 'react';
import { 
  User,
  Star,
  Award,
  BarChart
} from 'lucide-react';
import { Button } from '../ui/Button';
import { DialogContent } from '../ui/dialog';

export function PlayerStatsDisplay({ 
  players,
  gameType,
  events
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const getStatFields = () => {
    switch (gameType) {
      case 'football':
        return [
          { key: 'goals', label: 'Goals', icon: '⚽' },
          { key: 'assists', label: 'Assists', icon: '👟' },
          { key: 'yellowCards', label: 'Yellow Cards', icon: '🟨' },
          { key: 'redCards', label: 'Red Cards', icon: '🟥' },
          { key: 'minutesPlayed', label: 'Minutes Played', icon: '⏱️' }
        ];
      case 'basketball':
        return [
          { key: 'points', label: 'Points', icon: '🏀' },
          { key: 'rebounds', label: 'Rebounds', icon: '🔄' },
          { key: 'assists', label: 'Assists', icon: '👋' },
          { key: 'steals', label: 'Steals', icon: '🤚' },
          { key: 'blocks', label: 'Blocks', icon: '✋' },
          { key: 'fouls', label: 'Fouls', icon: '❌' }
        ];
      case 'volleyball':
        return [
          { key: 'points', label: 'Points', icon: '🏐' },
          { key: 'serves', label: 'Serves', icon: '💫' },
          { key: 'blocks', label: 'Blocks', icon: '🛡️' },
          { key: 'spikes', label: 'Spikes', icon: '⚡' },
          { key: 'digs', label: 'Digs', icon: '🔽' }
        ];
      default:
        return [];
    }
  };

  const calculatePlayerStats = (player) => {
    const stats = {};
    const fields = getStatFields();

    fields.forEach(field => {
      stats[field.key] = events.filter(event => 
        event.player?.id === player.id && 
        event.type === field.key.toUpperCase()
      ).length;
    });

    return stats;
  };

  const renderPlayerCard = (player) => {
    const stats = calculatePlayerStats(player);

    return (
      <div 
        key={player.id}
        onClick={() => setSelectedPlayer(player)}
        className={`p-4 rounded-lg cursor-pointer transition-all ${
          selectedPlayer?.id === player.id 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-white hover:bg-gray-50'
        } border`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <div className="font-medium">{player.name}</div>
            <div className="text-sm text-gray-500">#{player.number}</div>
          </div>
          {player.isCaptain && (
            <div className="ml-auto">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
          )}
        </div>

        {selectedPlayer?.id === player.id && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {getStatFields().map(field => (
              <div key={field.key} className="text-center p-2 bg-white rounded border">
                <div className="text-lg font-medium">{stats[field.key] || 0}</div>
                <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <span>{field.icon}</span>
                  <span>{field.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <DialogContent className="max-w-2xl">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Player Statistics</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedPlayer(null)}
          >
            <BarChart className="w-4 h-4 mr-1" />
            View All
          </Button>
        </div>

        <div className="space-y-4">
          {players.map(renderPlayerCard)}
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-2 gap-4">
          {getStatFields().map(field => {
            const topPlayer = [...players].sort((a, b) => 
              (calculatePlayerStats(b)[field.key] || 0) - 
              (calculatePlayerStats(a)[field.key] || 0)
            )[0];

            if (!topPlayer) return null;

            const stats = calculatePlayerStats(topPlayer);
            return (
              <div key={field.key} className="bg-white p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium">{field.label} Leader</span>
                </div>
                <div className="mt-2">
                  <div className="font-medium">{topPlayer.name}</div>
                  <div className="text-sm text-gray-500">
                    {stats[field.key] || 0} {field.icon}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DialogContent>
  );
}

export default PlayerStatsDisplay; 