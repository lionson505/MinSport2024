import { useState } from 'react';
import { 
  BarChart as BarChartIcon, 
  PieChart,
  TrendingUp,
  Activity,
  Users,
  Timer,
  Download,
  Share2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Progress } from '../ui/progress';

export function TeamStatsDisplay({
  teamA,
  teamB,
  gameType,
  onExport,
  onShare
}) {
  const [viewType, setViewType] = useState('general'); // general, possession, comparison

  const getGameSpecificStats = () => {
    switch (gameType) {
      case 'football':
        return {
          teamA: {
            possession: 55,
            shots: 12,
            shotsOnTarget: 6,
            corners: 5,
            fouls: 8,
            yellowCards: 2,
            redCards: 0,
            offsides: 3,
            attacks: {
              total: 45,
              dangerous: 15
            },
            passes: {
              total: 300,
              completed: 255,
              accuracy: 85
            }
          },
          teamB: {
            possession: 45,
            shots: 8,
            shotsOnTarget: 4,
            corners: 3,
            fouls: 10,
            yellowCards: 1,
            redCards: 0,
            offsides: 2,
            attacks: {
              total: 38,
              dangerous: 12
            },
            passes: {
              total: 250,
              completed: 200,
              accuracy: 80
            }
          }
        };
      case 'basketball':
        return {
          teamA: {
            fieldGoals: {
              made: 30,
              attempted: 65,
              percentage: 46.2
            },
            threePointers: {
              made: 8,
              attempted: 22,
              percentage: 36.4
            },
            freeThrows: {
              made: 15,
              attempted: 20,
              percentage: 75
            },
            rebounds: {
              offensive: 12,
              defensive: 25,
              total: 37
            },
            assists: 18,
            steals: 7,
            blocks: 4,
            turnovers: 13,
            fouls: 16
          },
          teamB: {
            fieldGoals: {
              made: 28,
              attempted: 60,
              percentage: 46.7
            },
            threePointers: {
              made: 10,
              attempted: 25,
              percentage: 40
            },
            freeThrows: {
              made: 12,
              attempted: 18,
              percentage: 66.7
            },
            rebounds: {
              offensive: 10,
              defensive: 22,
              total: 32
            },
            assists: 15,
            steals: 5,
            blocks: 3,
            turnovers: 15,
            fouls: 18
          }
        };
      case 'volleyball':
        return {
          teamA: {
            attacks: {
              successful: 45,
              errors: 15,
              total: 75,
              efficiency: 60
            },
            blocks: {
              successful: 12,
              errors: 5,
              touches: 25
            },
            serves: {
              aces: 8,
              errors: 6,
              total: 85,
              efficiency: 9.4
            },
            reception: {
              successful: 55,
              errors: 8,
              total: 70,
              efficiency: 78.6
            },
            digs: 45
          },
          teamB: {
            attacks: {
              successful: 42,
              errors: 18,
              total: 72,
              efficiency: 58.3
            },
            blocks: {
              successful: 10,
              errors: 6,
              touches: 22
            },
            serves: {
              aces: 6,
              errors: 8,
              total: 80,
              efficiency: 7.5
            },
            reception: {
              successful: 50,
              errors: 10,
              total: 65,
              efficiency: 76.9
            },
            digs: 40
          }
        };
      default:
        return {};
    }
  };

  const renderGeneralStats = () => {
    const stats = getGameSpecificStats();
    
    return (
      <div className="grid grid-cols-3 gap-6">
        {/* Team A Stats */}
        <div className="space-y-4">
          <h3 className="font-medium text-center">{teamA.name}</h3>
          {Object.entries(stats.teamA).map(([key, value]) => {
            if (typeof value === 'object') return null;
            return (
              <div key={key} className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-medium">{value}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison View */}
        <div className="space-y-4">
          <h3 className="font-medium text-center">Head to Head</h3>
          {Object.entries(stats.teamA).map(([key, valueA]) => {
            if (typeof valueA === 'object') return null;
            const valueB = stats.teamB[key];
            const total = valueA + valueB;
            const percentageA = (valueA / total) * 100;

            return (
              <div key={key} className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-sm text-center capitalize mb-2">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{valueA}</span>
                  <Progress value={percentageA} className="flex-1" />
                  <span className="text-sm">{valueB}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Team B Stats */}
        <div className="space-y-4">
          <h3 className="font-medium text-center">{teamB.name}</h3>
          {Object.entries(stats.teamB).map(([key, value]) => {
            if (typeof value === 'object') return null;
            return (
              <div key={key} className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-medium">{value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDetailedStats = () => {
    const stats = getGameSpecificStats();
    
    return (
      <div className="space-y-6">
        {Object.entries(stats.teamA).map(([key, valueA]) => {
          if (typeof valueA !== 'object') return null;
          const valueB = stats.teamB[key];

          return (
            <div key={key} className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-medium capitalize mb-4">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(valueA).map(([subKey, subValueA]) => {
                  const subValueB = valueB[subKey];
                  return (
                    <div key={subKey} className="flex justify-between items-center">
                      <span className="text-sm capitalize">
                        {subKey.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex gap-4">
                        <span className="font-medium">{subValueA}</span>
                        <span className="text-gray-400">vs</span>
                        <span className="font-medium">{subValueB}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewType === 'general' ? 'default' : 'outline'}
            onClick={() => setViewType('general')}
          >
            <BarChartIcon className="w-4 h-4 mr-1" />
            General
          </Button>
          <Button
            size="sm"
            variant={viewType === 'detailed' ? 'default' : 'outline'}
            onClick={() => setViewType('detailed')}
          >
            <Activity className="w-4 h-4 mr-1" />
            Detailed
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onExport}
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onShare}
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      {viewType === 'general' ? renderGeneralStats() : renderDetailedStats()}
    </div>
  );
}

export default TeamStatsDisplay; 