import { useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Plus, Users, Search } from 'lucide-react';
import { Input } from '../../../../components/ui/input';

export function TeamManagement() {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: 'APR FC',
      logo: '/teams/apr.png',
      sport: 'football',
      players: 25,
      matches: 12,
      wins: 8,
      draws: 2,
      losses: 2
    },
    {
      id: 2,
      name: 'REG',
      logo: '/teams/reg.png',
      sport: 'basketball',
      players: 15,
      matches: 18,
      wins: 14,
      draws: 0,
      losses: 4
    }
    // Add more teams
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-gray-500">Manage teams and their rosters</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Team
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search teams..." 
            className="pl-10"
          />
        </div>
        {/* Add filters here */}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <div key={team.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-4">
              <img 
                src={team.logo} 
                alt={team.name} 
                className="w-16 h-16 object-contain"
              />
              <div>
                <h3 className="font-semibold">{team.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{team.sport}</p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">{team.players}</div>
                <div className="text-xs text-gray-500">Players</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{team.matches}</div>
                <div className="text-xs text-gray-500">Matches</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-500">{team.wins}</div>
                <div className="text-xs text-gray-500">Wins</div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Manage Roster
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 