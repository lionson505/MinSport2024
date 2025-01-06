import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, FileText, Users, Award, Building2, Flag, CalendarIcon, Clock, Loader } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Button } from '../components/ui/Button';
import { usePermissions } from "../utils/permissions.js";
import { MODULE_IDS } from "../constants/modules.js";
import axiosInstance from '../utils/axiosInstance';

const Dashboard = () => {
  const navigate = useNavigate();
  const { hasModuleAccess } = usePermissions();
  const [modulePermissions, setModulePermissions] = useState({});
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [statsData, setStatsData] = useState({
    federations: 0,
    clubs: 0,
    clubPlayers: 0,
    sportTeams: 0,
    teamPlayers: 0,
    officialsAndPlayers: 0,
    isongaProgram: 0,
    students: 0,
    infrastructure: 0,
    documents: 0,
    appointments: 0,
    employees: 0,
    playerDistribution: [],
    genderDistribution: [],
    clubPerformance: [],
    competitionResults: []
  });

  const [appointmentRequests, setAppointmentRequests] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [appointmentRequestsM, setAppointmentRequestsM] = useState([]);
  const [appointmentRequestsPS, setAppointmentRequestsPS] = useState([]);

  // Check permissions on mount
  useEffect(() => {
    const checkModulePermissions = async () => {
      setIsLoadingPermissions(true);
      const permissions = {};
      
      const moduleIds = [
        MODULE_IDS.FEDERATIONS,
        MODULE_IDS.APPOINTMENTS,
        MODULE_IDS.APPOINTMEN_PS,
        MODULE_IDS.APPOINTMENT_MINISTER,
        MODULE_IDS.ISONGA_PROGRAMS,
        MODULE_IDS.ACADEMIES,
        MODULE_IDS.INFRASTRUCTURE,
        MODULE_IDS.DOCUMENTS,
        MODULE_IDS.EMPLOYEE
      ];

      for (const moduleId of moduleIds) {
        permissions[moduleId] = await hasModuleAccess(moduleId);
      }

      setModulePermissions(permissions);
      setIsLoadingPermissions(false);
    };

    checkModulePermissions();
  }, [hasModuleAccess]);

  // Handle mobile resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [federations, clubs, students, documents, appointments, employees, players] = await Promise.all([
          axiosInstance.get('/federations'),
          axiosInstance.get('/clubs'),
          axiosInstance.get('/students'),
          axiosInstance.get('/documents'),
          axiosInstance.get('/appointments'),
          axiosInstance.get('/employees'),
          axiosInstance.get('/player-staff')
        ]);

        const clubData = clubs.data || [];
        const employeeData = Array.isArray(employees.data?.employees) ? employees.data.employees : [];
        const studentData = Array.isArray(students.data?.data) ? students.data.data : [];
        const documentData = Array.isArray(documents.data?.data) ? documents.data.data : [];
        const appointmentData = appointments.data || [];
        const playerData = players.data || [];

        // Process appointments
        const sortedAppointments = appointmentData.sort((a, b) => new Date(b.date) - new Date(a.date));
        const futureAppointments = appointmentData.filter(appointment => new Date(appointment.date) > new Date());
        
        const ministerAppointments = sortedAppointments
          .filter(appointment => appointment.person_to_meet?.toLowerCase() === 'minister')
          .slice(0, 3);
          
        const psAppointments = sortedAppointments
          .filter(appointment => appointment.person_to_meet?.toLowerCase() === 'ps')
          .slice(0, 2);

        setStatsData({
          federations: federations.data?.length || 0,
          clubs: clubData.length,
          clubPlayers: clubData.reduce((acc, club) => acc + (club.players?.length || 0), 0),
          sportTeams: clubData.reduce((acc, club) => acc + (club.teams?.length || 0), 0),
          teamPlayers: clubData.reduce((acc, club) => 
            acc + (club.teams?.reduce((teamAcc, team) => teamAcc + (team.players?.length || 0), 0) || 0), 0),
          officialsAndPlayers: employeeData.filter(emp => emp.role === 'official' || emp.role === 'player').length,
          isongaProgram: 9,
          students: studentData.length,
          infrastructure: 12,
          documents: documentData.length,
          appointments: appointmentData.length,
          employees: employeeData.length,
          playerDistribution: processPlayerDistribution(playerData),
          genderDistribution: processGenderDistribution(playerData),
          clubPerformance: processClubPerformance(clubData, playerData),
          competitionResults: processCompetitionResults(federations.data)
        });

        setAppointmentRequests(sortedAppointments.slice(0, 3));
        setUpcomingAppointments(futureAppointments);
        setAppointmentRequestsM(ministerAppointments);
        setAppointmentRequestsPS(psAppointments);

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const processPlayerDistribution = (players) => {
    const distribution = players.reduce((acc, player) => {
      if (player.type === 'PLAYER') {
        const discipline = player.discipline || 'Unspecified';
        acc[discipline] = (acc[discipline] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
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
    })).slice(0, 10);
  };

  const processCompetitionResults = (federationsData) => {
    return (federationsData || []).map(federation => ({
      name: federation.name,
      events: federation.events?.length || 0,
      participants: federation.participants?.length || 0
    }));
  };

  const renderAppointmentStatus = (status) => {
    switch (status?.toUpperCase()) {
      case 'RESCHEDULED':
        return <span className="text-green-600 font-semibold">Approved</span>;
      case 'PENDING':
      case 'GRANTED':
        return <span className="text-yellow-600 font-semibold">Pending</span>;
      default:
        return <span className="text-red-600 font-semibold">Unknown</span>;
    }
  };

  const statsRow1 = [
    { moduleId: MODULE_IDS.FEDERATIONS, number: statsData.federations, label: 'Federations', icon: FileText, color: 'bg-blue-100 text-blue-600', path: '/federations' },
    { moduleId: MODULE_IDS.FEDERATIONS, number: statsData.clubs, label: 'Clubs', icon: Users, color: 'bg-purple-100 text-purple-600', path: '/federations' },
    { moduleId: MODULE_IDS.FEDERATIONS, number: statsData.clubPlayers, label: 'Club Players', icon: Award, color: 'bg-green-100 text-green-600', path: '/federations' },
    { moduleId: MODULE_IDS.ISONGA_PROGRAMS, number: statsData.sportTeams, label: 'Sport Teams', icon: Building2, color: 'bg-orange-100 text-orange-600', path: '/national-teams' },
    { moduleId: MODULE_IDS.FEDERATIONS, number: statsData.teamPlayers, label: 'Team Players', icon: Flag, color: 'bg-green-100 text-green-600', path: '/national-teams' },
    { moduleId: MODULE_IDS.FEDERATIONS, number: statsData.officialsAndPlayers, label: 'Officials & Players', icon: Flag, color: 'bg-green-100 text-green-600', path: '/national-teams' },
    { moduleId: MODULE_IDS.ISONGA_PROGRAMS, number: statsData.isongaProgram, label: 'Isonga Program', icon: Award, color: 'bg-red-100 text-red-600', path: '/isonga-programs' },
    { moduleId: MODULE_IDS.ACADEMIES, number: statsData.students, label: 'Students', icon: FileText, color: 'bg-indigo-100 text-indigo-600', path: '/isonga-programs' },
    { moduleId: MODULE_IDS.INFRASTRUCTURE, number: statsData.infrastructure, label: 'Infrastructure', icon: Building2, color: 'bg-green-100 text-green-600', path: '/infrastructure' },
    { moduleId: MODULE_IDS.DOCUMENTS, number: statsData.documents, label: 'Documents', icon: FileText, color: 'bg-indigo-100 text-indigo-600', path: '/documents' },
    { moduleId: MODULE_IDS.APPOINTMENTS, number: statsData.appointments, label: 'Appointments', icon: CalendarIcon, color: 'bg-yellow-100 text-yellow-600', path: '/appointments' },
    { moduleId: MODULE_IDS.EMPLOYEE, number: statsData.employees, label: 'Employees', icon: FileText, color: 'bg-indigo-100 text-indigo-600', path: '/employee' }
  ];

  if (isLoading || isLoadingPermissions) {
    return <div className="flex animate-spin justify-center items-center content-center h-screen"><Loader /></div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* Stats Grid */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {statsRow1.map((stat, index) => (
            modulePermissions[stat.moduleId] && (
              <div
                key={index}
                className="bg-white hover:bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => navigate(stat.path)}
              >
                <div className={`${stat.color} p-2 rounded-full mb-2`}>
                  <stat.icon className="h-5 w-5"/>
                </div>
                <h3 className="text-lg font-semibold">{stat.number}</h3>
                <p className="text-xs">{stat.label}</p>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Appointments Section */}
      {modulePermissions[MODULE_IDS.APPOINTMENTS] && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
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
                      <p className="text-sm text-gray-500">{new Date(appointment.request_date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">{appointment.names}</p>
                    </div>
                    <span className="text-sm text-gray-600">{renderAppointmentStatus(appointment.status)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Appointment Requests */}
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
                      <p className="text-sm text-gray-500 font-bold">{appointment.names}</p>
                    </div>
                    <span className="text-sm text-gray-600">{renderAppointmentStatus(appointment.status)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* PS and Minister Appointments Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PS Appointments */}
        {modulePermissions[MODULE_IDS.APPOINTMEN_PS] && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Appointment Requests PS</h3>
              <Button size="sm" variant="secondary" onClick={() => navigate('/appointments-ps')}>View All</Button>
            </div>
            {appointmentRequestsPS.length === 0 ? (
              <p className="text-gray-500">No new appointment requests for PS.</p>
            ) : (
              <ul>
                {appointmentRequestsPS.map((appointment, index) => (
                  <li key={index} className="flex justify-between items-center py-2">
                    <div>
                      <strong>{appointment.title}</strong>
                      <p className="text-sm text-gray-500">{new Date(appointment.request_date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500 font-bold">{appointment.names}</p>
                    </div>
                    <span className="text-sm text-gray-600">{renderAppointmentStatus(appointment.status)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Minister Appointments */}
        {modulePermissions[MODULE_IDS.APPOINTMENT_MINISTER] && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Appointment Requests Minister</h3>
              <Button size="sm" variant="secondary" onClick={() => navigate('/appointments-ministers')}>View All</Button>
            </div>
            {appointmentRequestsM.length === 0 ? (
              <p className="text-gray-500">No new appointment requests for Minister.</p>
            ) : (
              <ul>
                {appointmentRequestsM.map((appointment, index) => (
                  <li key={index} className="flex justify-between items-center py-2">
                    <div>
                      <strong>{appointment.title}</strong>
                      <p className="text-sm text-gray-500">{new Date(appointment.request_date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500 font-bold">{appointment.names}</p>
                    </div>
                    <span className="text-sm text-gray-600">{renderAppointmentStatus(appointment.status)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player Distribution Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Player Distribution by Sport</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statsData.playerDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statsData.playerDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                ))}
              </Pie>
              <Tooltip/>
              <Legend/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Distribution Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statsData.genderDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percentage}) => `${name} (${percentage}%)`}
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
              <Tooltip/>
              <Legend/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Club Performance Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Club Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statsData.clubPerformance}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="name"/>
              <YAxis/>
              <Tooltip/>
              <Legend/>
              <Bar dataKey="players" fill="#8884d8"/>
              <Bar dataKey="staff" fill="#82ca9d"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Federation Activity Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Federation Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statsData.competitionResults}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60}/>
              <YAxis/>
              <Tooltip/>
              <Legend/>
              <Bar dataKey="events" fill="#8884d8" name="Events"/>
              <Bar dataKey="participants" fill="#82ca9d" name="Participants"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default Dashboard;