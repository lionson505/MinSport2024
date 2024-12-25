import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, Filler } from 'chart.js';
import axiosInstance from '../utils/axiosInstance'; // Assuming this is the Axios instance to make API calls
import { useNavigate } from 'react-router-dom';
import { FileText, Users, Award, Building2, Flag, Calendar as CalendarIcon, ArrowUpRight } from 'lucide-react';
import { Button } from '../components/ui/Button'; // Assuming Button is a custom component you have
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, Filler
);



const Dashboard = () => {
  const [statsData, setStatsData] = useState({
    federations: 0,
    clubs: 0,
    clubPlayers: 0,
    sportTeams: 0,
    teamPlayers: 0,
    officialsAndPlayers: 0,
    isongaProgram: 9,
    students: 0,
    infrastructure: 12,
    documents: 0,
    appointments: 0,
    employees: 0,
  });

  const [appointmentRequests, setAppointmentRequests] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Single isStatsAllowed function
  const isStatsAllowed = (path) => {
    try {
      // Check if user is admin first
      if (localStorage.getItem('userRole') === 'admin') return true;

      // Get and parse accessible links
      const accessibleLinks = localStorage.getItem('accessibleLinks');
      if (!accessibleLinks) return false;

      const parsedLinks = JSON.parse(accessibleLinks);
      return parsedLinks.some(link => link.path === path);
    } catch (error) {
      console.error('Error checking stats permission:', error);
      return false;
    }
  };

  // Stats data for first row with permission check
  const statsRow1 = [
    { 
      number: statsData.federations,
      label: 'Federations', 
      icon: FileText, 
      color: 'bg-blue-100 text-blue-600',
      path: '/federations'
    },
    { 
      number: statsData.clubs, 
      label: 'Clubs', 
      icon: Users, 
      color: 'bg-purple-100 text-purple-600',
      path: '/federations'
    },
    { 
      number: statsData.clubPlayers, 
      label: 'Club Players', 
      icon: Award, 
      color: 'bg-green-100 text-green-600',
      path: '/federations'
    },
    { 
      number: statsData.sportTeams, 
      label: 'Sport Teams', 
      icon: Building2, 
      color: 'bg-orange-100 text-orange-600',
      path: '/national-teams'
    },
    { 
      number: statsData.teamPlayers, 
      label: 'Team Players', 
      icon: Flag, 
      color: 'bg-green-100 text-green-600',
      path: '/national-teams'
    },
    { 
      number: statsData.officialsAndPlayers, 
      label: 'Officials & Players', 
      icon: Flag, 
      color: 'bg-green-100 text-green-600',
      path: '/national-teams'
    },
    { 
      number: statsData.isongaProgram, 
      label: 'Isonga Program', 
      icon: Award, 
      color: 'bg-red-100 text-red-600',
      path: '/isonga-programs'
    },
    { 
      number: statsData.students, 
      label: 'Students', 
      icon: FileText, 
      color: 'bg-indigo-100 text-indigo-600',
      path: '/isonga-programs'
    },
    { 
      number: statsData.infrastructure, 
      label: 'Infrastructure', 
      icon: Building2, 
      color: 'bg-green-100 text-green-600',
      path: '/infrastructure'
    },
    { 
      number: statsData.documents, 
      label: 'Documents', 
      icon: FileText, 
      color: 'bg-indigo-100 text-indigo-600',
      path: '/documents'
    },
    { 
      number: statsData.appointments, 
      label: 'Appointments', 
      icon: CalendarIcon, 
      color: 'bg-yellow-100 text-yellow-600',
      path: '/appointments'
    },
    { 
      number: statsData.employees, 
      label: 'Employees', 
      icon: FileText, 
      color: 'bg-indigo-100 text-indigo-600',
      path: '/employee'
    }
  ].filter(stat => isStatsAllowed(stat.path));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch stats data
        const statsResponse = await axiosInstance.get('/dashboard/stats');
        if (statsResponse.data) {
          setStatsData(statsResponse.data);
        }

        // Fetch appointments if user has permission
        if (isStatsAllowed('/appointments')) {
          const [requestsResponse, upcomingResponse] = await Promise.all([
            axiosInstance.get('/appointments/requests'),
            axiosInstance.get('/appointments/upcoming')
          ]);

          setAppointmentRequests(requestsResponse.data || []);
          setUpcomingAppointments(upcomingResponse.data || []);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderAppointmentStatus = (status) => {
    switch (status) {
      case 'approved':
        return <span className="text-green-600 font-semibold">Approved</span>;
      case 'pending':
        return <span className="text-yellow-600 font-semibold">Pending</span>;
      default:
        return <span className="text-gray-600">Unknown</span>;
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#000',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#000',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#000',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };


  const federationData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Federations',
        data: [12, 19, 3, 5, 2],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const professionalsData = {
    labels: ['Coaches', 'Referees', 'Athletes'],
    datasets: [
      {
        label: 'Sports Professionals',
        data: [10, 15, 30],
        backgroundColor: ['red', 'blue', 'green'],
      },
    ],
  };

  const teamsPerformanceData = {
    labels: ['Team A', 'Team B', 'Team C', 'Team D'],
    datasets: [
      {
        label: 'National Teams Performance',
        data: [65, 59, 80, 81],
        fill: true,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      
      },
    ],
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {statsRow1.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white hover:bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => navigate(stat.path)}
                >
                  <div className={`${stat.color} p-2 rounded-full mb-2`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{stat.number}</h3>
                  <p className="text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Only show appointments section if user has permission */}
          {isStatsAllowed('/appointments') && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Appointments Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Upcoming Events</h3>
                  <Button size="sm" variant="secondary" onClick={() => navigate('/appointments')}>View All</Button>
                </div>
                {upcomingAppointments.length === 0 ? (
                  <p className="text-gray-500">No upcoming Events.</p>
                ) : (
                  <ul>
                    {upcomingAppointments.map((appointment, index) => (
                      <li key={index} className="flex justify-between items-center py-2">
                        <div>
                          <strong>{appointment.title}</strong>
                          <p className="text-sm text-gray-500">{new Date(appointment.request_date).toLocaleDateString()}</p><br />
                          <p className="text-sm text-gray-500">{appointment.names}</p><br />
                        </div>
                        <span className="text-sm text-gray-600">{renderAppointmentStatus(appointment.status)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Appointment Requests Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Appointment Requests</h3>
                  <Button size="sm" variant="secondary" onClick={() => navigate('/appointments')}>View All</Button>
                </div>
                {appointmentRequests.length === 0 ? (
                  <p className="text-gray-500">No new appointment requests.</p>
                ) : (
                  <ul>
                    {appointmentRequests.map((appointment, index) => (
                      <li key={index} className="flex justify-between items-center py-2">
                        <div>
                          <strong>{appointment.title}</strong>
                          <p className="text-sm text-gray-500">{new Date(appointment.request_date).toLocaleDateString()}</p>
                        </div>
                        <span className="text-sm text-gray-600">{renderAppointmentStatus(appointment.status)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Only show analytics if user has permission */}
          {isStatsAllowed('/reports') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Federation Performance */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Federation Performance
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-500 flex items-center">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      +12.5%
                    </span>
                  </div>
                </div>
                <div className="h-[300px]">
                  <Bar data={federationData} options={chartOptions} />
                </div>
              </div>

              {/* Sports Professionals Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Sports Professionals Distribution
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-500 flex items-center">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      +8.3%
                    </span>
                  </div>
                </div>
                <div className="h-[300px]">
                  <Doughnut 
                    data={professionalsData} 
                    options={{
                      ...chartOptions,
                      cutout: '60%',
                    }} 
                  />
                </div>
              </div>

              {/* National Teams Performance */}
              <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    National Teams Performance Trend
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-500 flex items-center">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      +15.2%
                    </span>
                  </div>
                </div>
                <div className="h-[300px]">
                  <Line data={teamsPerformanceData} options={chartOptions} />
                </div>
              </div>

              {/* Key Performance Metrics */}
              <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Key Performance Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50">
                    <p className="text-sm text-blue-600">Active Athletes</p>
                    <p className="text-2xl font-bold text-blue-700">2,845</p>
                    <p className="text-xs text-blue-500">+12% from last month</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50">
                    <p className="text-sm text-green-600">International Events</p>
                    <p className="text-2xl font-bold text-green-700">42</p>
                    <p className="text-xs text-green-500">+8% from last month</p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50">
                    <p className="text-sm text-purple-600">Professional Staff</p>
                    <p className="text-2xl font-bold text-purple-700">350</p>
                    <p className="text-xs text-purple-500">+5% from last month</p>
                  </div>
                  <div className="p-4 rounded-lg bg-orange-50">
                    <p className="text-sm text-orange-600">Rankings Improved</p>
                    <p className="text-2xl font-bold text-orange-700">15</p>
                    <p className="text-xs text-orange-500">+3 from last month</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
