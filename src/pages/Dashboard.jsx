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
import { FileText, Users, Award, Building2, Flag, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../components/ui/Button'; // Assuming Button is a custom component you have

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
  const navigate = useNavigate();
  const jl = localStorage.getItem("jl");
  if(jl ){
    window.location.reload();
    window.location.reload();
    localStorage.removeItem("jl");
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [federations, clubs, students, documents, appointments, employees] = await Promise.all([
          axiosInstance.get('/federations'),
          axiosInstance.get('/clubs'),
          axiosInstance.get('/students'),
          axiosInstance.get('/documents'),
          axiosInstance.get('/appointments'),
          axiosInstance.get('/employees'),
        ]);

        const clubData = clubs.data || [];
        const employeeData = Array.isArray(employees.data?.employees) ? employees.data.employees : [];
        const studentData = Array.isArray(students.data?.data) ? students.data.data : [];
        const documentData = Array.isArray(documents.data?.data) ? documents.data.data : [];
        const appointmentData = appointments.data || [];

        setStatsData({
          federations: federations.data?.length || 0,
          clubs: clubData.length,
          clubPlayers: clubData.reduce((acc, club) => acc + (club.players ? club.players.length : 0), 0),
          sportTeams: clubData.reduce((acc, club) => acc + (club.teams ? club.teams.length : 0), 0),
          teamPlayers: clubData.reduce(
            (acc, club) =>
              acc + (club.teams ? club.teams.reduce((teamAcc, team) => teamAcc + (team.players ? team.players.length : 0), 0) : 0),
            0
          ),
          officialsAndPlayers: employeeData.filter(emp => emp.role === 'official' || emp.role === 'player').length,
          isongaProgram: 9,
          students: studentData.length,
          infrastructure: 12,
          documents: documentData.length,
          appointments: appointmentData.length,
          employees: employeeData.length,
        });

        setAppointmentRequests(appointmentData);

        // Fetch upcoming appointments (filter by date or status)
        const futureAppointments = appointmentData.filter(appointment => new Date(appointment.date) > new Date());
        setUpcomingAppointments(futureAppointments);

        // Sort the appointment requests by date (descending order) and take the last 3
        const sortedAppointments = appointmentData.sort((a, b) => new Date(b.date) - new Date(a.date)); // Latest first
        setAppointmentRequests(sortedAppointments.slice(0, 3)); // Get the last 3 (most recent)

      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
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

  // Stats data for first row
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
  ];

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


  // const allowedPaths = localStorage.getItem("accessibleLinks");

  // const filteredStatsRow1 = statsRow1.filter(stat => 
  //   allowedPaths.some(allowed => allowed.path === stat.path)
  // )
  // console.log(filteredStatsRow1)

// const filteredStatsRow2 = statsRow2
const accessibleLinks = JSON.parse(localStorage.getItem("accessibleLinks"));

const isStatsAllowed = (path) => {
  return accessibleLinks.some((link) => link.path === path);
};



  const filteredStatsRow1 = statsRow1.filter((stat) => isStatsAllowed(stat.path));

  console.log("Original statsRow1:", statsRow1);
  console.log("Filtered statsRow1:", filteredStatsRow1);
  
  // Debugging specific stat for allowed path
  statsRow1.forEach((stat) => {
    console.log(`Is stat "${stat.label}" allowed:`, isStatsAllowed(stat.path));
  });



// Example to filter statsRow1 based on allowed paths



  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* Stats Grid */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {filteredStatsRow1.map((stat, index) => (
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
{/* 
      <div className="space-y-3">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {statsRow2.map((stat, index) => (
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
      </div> */}


      {/* Upcoming Appointments and Appointment Requests Section */}
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
  
      {/* Analytics Grid */}
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
    </div>
  );
};

export default Dashboard;
