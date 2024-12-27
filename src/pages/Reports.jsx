import React, { useState, useEffect } from 'react';
import ChartDownloadWrapper from '../components/reusable/chartDownloader';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, AreaChart, Area
} from 'recharts';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'sonner';
import { Download, Filter, Printer, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Reports = () => {
  const [rawData, setRawData] = useState({
    players: [],
    clubs: [],
    federations: [],
    transfers: []
  });

  const [filters, setFilters] = useState({
    federation: '',
    discipline: '',
    year: new Date().getFullYear(),
    month: '',
    gender: ''
  });

  const [filterOptions, setFilterOptions] = useState({
    federations: [],
    disciplines: [],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    years: Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()),
    genders: ['MALE', 'FEMALE']
  });

  const [statsData, setStatsData] = useState({
    playerDistribution: [],
    genderDistribution: [],
    clubPerformance: [],
    facilityUsage: [],
    competitionResults: [],
    federationActivity: [],
    monthlyRegistrations: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    processData();
  }, [filters, rawData]);

  const fetchInitialData = async () => {
    try {
      const [players, clubs, federations, transfers] = await Promise.all([
        axiosInstance.get('/player-staff'),
        axiosInstance.get('/clubs'),
        axiosInstance.get('/federations'),
        axiosInstance.get('/transfers')
      ]);

      setRawData({
        players: players.data,
        clubs: clubs.data,
        federations: federations.data,
        transfers: transfers.data
      });

      // Set up filter options from actual data
      const disciplines = [...new Set(players.data.map(p => p.discipline))].filter(Boolean);

      setFilterOptions(prev => ({
        ...prev,
        federations: federations.data.map(f => ({ value: f.id, label: f.name })),
        disciplines: disciplines.map(d => ({ value: d, label: d }))
      }));

      setLoading(false);
    } catch (error) {
      toast.error('Failed to load report data');
      setLoading(false);
    }
  };

  const processData = () => {
    if (!rawData.players.length) return;

    const filteredPlayers = rawData.players.filter(player => {
      const matchesFederation = !filters.federation || player.federationId === filters.federation;
      const matchesDiscipline = !filters.discipline || player.discipline === filters.discipline;
      const matchesGender = !filters.gender || player.gender === filters.gender;
      return matchesFederation && matchesDiscipline && matchesGender;
    });

    setStatsData({
      playerDistribution: processPlayerDistribution(filteredPlayers),
      genderDistribution: processGenderDistribution(filteredPlayers),
      clubPerformance: processClubPerformance(rawData.clubs, filteredPlayers),
      facilityUsage: [
        { month: 'Jan', usage: 65 },
        { month: 'Feb', usage: 75 },
        { month: 'Mar', usage: 85 },
        { month: 'Apr', usage: 70 },
        { month: 'May', usage: 90 }
      ],
      federationActivity: processFederationActivity(rawData.federations, filteredPlayers, rawData.clubs),
      monthlyRegistrations: processMonthlyRegistrations(filteredPlayers),
      competitionResults: rawData.federations.map(federation => ({
        name: federation.name,
        events: federation.events?.length || 0,
        participants: federation.participants?.length || 0
      }))
    });
  };

  // Data processing functions
  const processPlayerDistribution = (players) => {
    const distribution = players.reduce((acc, player) => {
      // Only count players, not staff
      if (player.type === 'PLAYER') {
        const discipline = player.discipline || 'Unspecified';
        acc[discipline] = (acc[discipline] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value
    }));
  };

  const processGenderDistribution = (players) => {
    const genderCount = players.reduce((acc, player) => {
      const gender = player.gender || 'UNKNOWN';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    const total = Object.values(genderCount).reduce((a, b) => a + b, 0);

    return Object.entries(genderCount).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / total) * 100).toFixed(1)
    }));
  };

  const processClubPerformance = (clubs, players) => {
    return clubs.map(club => ({
      name: club.name,
      players: players.filter(p => p.clubId === club.id).length,
      staff: club.staff?.length || 0,
      teams: club.teams?.length || 0
    })).slice(0, 10); // Show top 10 clubs
  };

  const processFederationActivity = (federations, players, clubs) => {
    return federations.map(federation => {
      const federationPlayers = players.filter(p =>
          p.type === 'PLAYER' && p.federationId === federation.id
      );
      const federationClubs = clubs.filter(c => c.federationId === federation.id);

      return {
        name: federation.name || federation.acronym,
        players: federationPlayers.length,
        clubs: federationClubs.length,
        // You might want to add more metrics here based on available data
      };
    });
  };

  const processMonthlyRegistrations = (players) => {
    const monthlyData = players.reduce((acc, player) => {
      if (player.type === 'PLAYER' && player.joinDate) {
        const date = new Date(player.joinDate);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        acc[monthYear] = (acc[monthYear] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(monthlyData)
        .map(([month, count]) => ({
          month,
          registrations: count
        }))
        .sort((a, b) => {
          const [aMonth, aYear] = a.month.split(' ');
          const [bMonth, bYear] = b.month.split(' ');
          return new Date(`${aMonth} 1, ${aYear}`) - new Date(`${bMonth} 1, ${bYear}`);
        });
  };

  const handleExport = async (format) => {
    try {
      const response = await axiosInstance.get(`/reports/export?format=${format}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sports_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(`Failed to export report as ${format}`);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
    );
  }

  return (
      <div className="p-6">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sports Analytics Reports</h1>
          <div className="flex gap-2">
            {/* <Button onClick={() => handleExport('pdf')} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={() => handleExport('excel')} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Excel
          </Button> */}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Federation</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, federation: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Federation" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.federations.map((federation) => (
                      <SelectItem key={federation.value} value={federation.value}>
                        {federation.label}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Discipline</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, discipline: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Discipline" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.disciplines.map((discipline) => (
                      <SelectItem key={discipline.value} value={discipline.value}>
                        {discipline.label}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, year: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, month: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gender</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.genders.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player Distribution by Sport */}
          <div className="bg-white p-4 rounded-lg shadow">

            <h3 className="text-lg font-semibold mb-4">Player Distribution by Sport</h3>
            <ChartDownloadWrapper chartData={statsData.playerDistribution} fileName="player_distribution">
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
            </ChartDownloadWrapper>
          </div>


          {/* Gender Distribution */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
            <ChartDownloadWrapper chartData={statsData.genderDistribution} fileName="gender_distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                      data={statsData.genderDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                  >
                    {statsData.genderDistribution.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.name === 'MALE' ? '#0088FE' :
                                entry.name === 'FEMALE' ? '#FF8042' :
                                    '#CCCCCC'}
                        />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartDownloadWrapper>
          </div>

          {/* Club Performance */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Club Performance</h3>
            <ChartDownloadWrapper chartData={statsData.clubPerformance} fileName="club_performance">
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
            </ChartDownloadWrapper>
          </div>

          {/* Federation Activity with Events and Participants */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Federation Activity</h3>
            <ChartDownloadWrapper chartData={statsData.competitionResults} fileName="federation_activity">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statsData.competitionResults}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="events" fill="#8884d8" name="Events" />
                  <Bar dataKey="participants" fill="#82ca9d" name="Participants" />
                </BarChart>
              </ResponsiveContainer>
            </ChartDownloadWrapper>
          </div>

          {/* Monthly Registrations */}
          {/* <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Monthly Registrations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={statsData.monthlyRegistrations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="registrations"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div> */}

          {/* Facility Usage Trends */}
          {/* <div className="bg-white p-4 rounded-lg shadow">
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
        </div> */}
        </div>
      </div>
  );
};



export default Reports;