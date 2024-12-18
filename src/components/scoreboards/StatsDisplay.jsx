import { useState } from 'react';
import { Table } from '../../components/ui/table';
import { Button } from '../../components/ui/Button';
import { 
  BarChart, 
  Download,
  Share2
} from 'lucide-react';

function StatsDisplay({ 
  stats,
  teamAName,
  teamBName,
  onExport,
  onShare
}) {
  const [showChart, setShowChart] = useState(false);

  const renderStatRow = (stat) => (
    <tr key={stat.name} className="border-b">
      <td className="py-2 text-right pr-4 w-1/3">{stat.teamA}</td>
      <td className="py-2 px-4 font-medium text-center w-1/3">{stat.name}</td>
      <td className="py-2 pl-4 w-1/3">{stat.teamB}</td>
    </tr>
  );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Match Statistics</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowChart(!showChart)}
          >
            <BarChart className="w-4 h-4 mr-1" />
            {showChart ? 'Hide Chart' : 'Show Chart'}
          </Button>
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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-right pr-4 w-1/3">{teamAName}</th>
              <th className="py-2 px-4 text-center w-1/3">Statistic</th>
              <th className="py-2 pl-4 w-1/3">{teamBName}</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(renderStatRow)}
          </tbody>
        </table>
      </div>

      {showChart && (
        <div className="mt-4 h-64">
          {/* Add chart visualization here */}
        </div>
      )}
    </div>
  );
}

export default StatsDisplay; 