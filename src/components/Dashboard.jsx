import StatsCards from './StatsCards';

const liveMatches = [
  {
    competition: 'RPL | Match - 8',
    team1: { name: 'APR FC', score: 2 },
    team2: { name: 'Amagaju', score: 4 },
    venue: 'Amahoro Stadium',
    time: '33:30'
  },
  // Add more matches as needed
];

const leagues = [
  { name: 'RPL', color: 'bg-blue-900' },
  { name: 'RBL', color: 'bg-blue-500' },
  { name: 'FRVB', color: 'bg-purple-900' },
  { name: 'Tour Du Rwanda', color: 'bg-yellow-500' },
  { name: 'Rwanda Handball League', color: 'bg-green-600' },
  { name: 'NPC', color: 'bg-gray-500' }
];

function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <StatsCards />
    </div>
  );
}

export default Dashboard; 