import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  AreaChart, Area
} from 'recharts';
import axiosInstance from '../utils/axiosInstance';
import { Loader2, ArrowUpRight, TrendingDown } from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState({
    federations: [],
    clubs: [],
    players: [],
    appointments: [],
    events: [],
    infrastructure: [],
    documents: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get federations
        const federationsRes = await axiosInstance.get('/federations');
        console.log('Federations Response:', federationsRes); // Debug log

        // Get clubs
        const clubsRes = await axiosInstance.get('/clubs');
        console.log('Clubs Response:', clubsRes); // Debug log

        // Get players
        const playersRes = await axiosInstance.get('/player-staff');
        console.log('Players Response:', playersRes); // Debug log

        // Extract data safely
        const federations = Array.isArray(federationsRes.data) ? federationsRes.data : 
                          Array.isArray(federationsRes.data?.data) ? federationsRes.data.data : [];
        
        const clubs = Array.isArray(clubsRes.data) ? clubsRes.data : 
                     Array.isArray(clubsRes.data?.data) ? clubsRes.data.data : [];
        
        const players = Array.isArray(playersRes.data) ? playersRes.data : 
                       Array.isArray(playersRes.data?.data) ? playersRes.data.data : [];

        // Set initial data
        setStatsData({
          federations: federations.map(fed => ({
            ...fed,
            name: fed.name || 'Unnamed Federation',
            activeAthletes: players.filter(p => p.federationId === fed.id).length || 0,
            activeClubs: clubs.filter(c => c.federationId === fed.id).length || 0
          })),
          clubs,
          players,
          appointments: [],
          events: [],
          infrastructure: [],
          documents: []
        });

        // Fetch additional data after setting initial state
        try {
          const [appointmentsRes, eventsRes, infrastructureRes, documentsRes] = await Promise.all([
            axiosInstance.get('/appointments'),
            axiosInstance.get('/sports-tourism-events'),
            axiosInstance.get('/infrastructure'),
            axiosInstance.get('/documents')
          ]);

          // Update with additional data
          setStatsData(prev => ({
            ...prev,
            appointments: Array.isArray(appointmentsRes.data) ? appointmentsRes.data :
                         Array.isArray(appointmentsRes.data?.data) ? appointmentsRes.data.data : [],
            events: Array.isArray(eventsRes.data) ? eventsRes.data :
                    Array.isArray(eventsRes.data?.data) ? eventsRes.data.data : [],
            infrastructure: Array.isArray(infrastructureRes.data) ? infrastructureRes.data :
                          Array.isArray(infrastructureRes.data?.data) ? infrastructureRes.data.data : [],
            documents: Array.isArray(documentsRes.data) ? documentsRes.data :
                      Array.isArray(documentsRes.data?.data) ? documentsRes.data.data : []
          }));
        } catch (additionalError) {
          console.error('Error fetching additional data:', additionalError);
          // Don't set error state here as we already have primary data
        }

      } catch (error) {
        console.error('Error fetching primary stats:', error);
        setError('Unable to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Data processing functions
  const processGenderData = () => {
    const distribution = statsData.players.reduce((acc, player) => {
      const gender = player.gender?.toLowerCase() || 'unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    const data = Object.entries(distribution).map(([gender, count]) => ({
      name: gender === 'unknown' ? 'Not Specified' : gender.charAt(0).toUpperCase() + gender.slice(1),
      value: count
    }));

    return data.length > 0 ? data : [{ name: 'No Data', value: 1 }];
  };

  const processEventData = () => {
    if (!statsData.events.length) {
      return Array.from({ length: 12 }, (_, i) => ({
        month: new Date(0, i).toLocaleString('default', { month: 'short' }),
        events: 0
      }));
    }

    const monthlyEvents = statsData.events.reduce((acc, event) => {
      const month = new Date(event.date).getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString('default', { month: 'short' }),
      events: monthlyEvents[i] || 0
    }));
  };

  const processInfrastructureData = () => {
    if (!statsData.infrastructure.length) {
      return [{ name: 'No Data', value: 1 }];
    }

    const data = statsData.infrastructure.reduce((acc, item) => {
      const type = item.type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(data).map(([type, count]) => ({
      name: type,
      value: count
    }));
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) return <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
  </div>;

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm text-gray-500 font-medium">Total Federations</h3>
              <p className="text-3xl font-bold mt-2">{statsData.federations.length}</p>
            </div>
            <span className="text-sm text-green-500 flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              +2 new
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm text-gray-500 font-medium">Active Clubs</h3>
              <p className="text-3xl font-bold mt-2">{statsData.clubs.length}</p>
            </div>
            <span className="text-sm text-green-500 flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              +5 new
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm text-gray-500 font-medium">Registered Athletes</h3>
              <p className="text-3xl font-bold mt-2">{statsData.players.length}</p>
            </div>
            <span className="text-sm text-red-500 flex items-center">
              <TrendingDown className="h-4 w-4 mr-1" />
              -3%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm text-gray-500 font-medium">Pending Appointments</h3>
              <p className="text-3xl font-bold mt-2">
                {statsData.appointments.filter(a => a.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Federation Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6">Federation Performance</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={statsData.federations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="activeAthletes" name="Active Athletes" fill="#3b82f6" />
              <Bar dataKey="activeClubs" name="Active Clubs" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6">Athletes Demographics</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={processGenderData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => 
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {processGenderData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Events Timeline */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6">Events Timeline</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={processEventData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="events" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Infrastructure Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6">Infrastructure Overview</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={Object.entries(processInfrastructureData()).map(([type, count]) => ({
                  name: type,
                  value: count
                }))}
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {Object.entries(processInfrastructureData()).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
