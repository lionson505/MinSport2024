import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import axios from 'axios';
import { toast } from 'sonner';

const Reports = () => {
  const [statsData, setStatsData] = useState({
    playerDistribution: [],
    clubPerformance: [],
    facilityUsage: [],
    competitionResults: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [players, clubs, federations] = await Promise.all([
        axios.get('https://mis.minisports.gov.rw/api/player-staff'),
        axios.get('https://mis.minisports.gov.rw/api/clubs'),
        axios.get('https://mis.minisports.gov.rw/api/federations')
      ]);

      // Process player distribution data
      const playersByDiscipline = players.data.reduce((acc, player) => {
        const discipline = player.discipline || 'Unspecified';
        acc[discipline] = (acc[discipline] || 0) + 1;
        return acc;
      }, {});

      // Process club performance data
      const clubStats = clubs.data.map(club => ({
        name: club.name,
        players: club.players?.length || 0,
        staff: club.staff?.length || 0
      }));

      // Process facility usage data (using mock data for now)
      const facilityData = [
        { month: 'Jan', usage: 65 },
        { month: 'Feb', usage: 75 },
        { month: 'Mar', usage: 85 },
        { month: 'Apr', usage: 70 },
        { month: 'May', usage: 90 }
      ];

      // Process competition results
      const competitionData = federations.data.map(federation => ({
        name: federation.name,
        events: federation.events?.length || 0,
        participants: federation.participants?.length || 0
      }));

      setStatsData({
        playerDistribution: Object.entries(playersByDiscipline).map(([name, value]) => ({
          name,
          value
        })),
        clubPerformance: clubStats,
        facilityUsage: facilityData,
        competitionResults: competitionData
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sports Analytics Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player Distribution by Sport */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Player Distribution by Sport</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statsData.playerDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statsData.playerDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Club Performance */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Club Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statsData.clubPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="players" fill="#8884d8" />
              <Bar dataKey="staff" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Facility Usage Trends */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Facility Usage Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={statsData.facilityUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="usage" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Competition Results */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Federation Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statsData.competitionResults}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="events" fill="#8884d8" />
              <Bar dataKey="participants" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;