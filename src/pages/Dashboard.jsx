import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {ChevronRight, FileText, Users, Award, Building2, Flag, CalendarIcon, Clock, Loader} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import axiosInstance from '../utils/axiosInstance';
import { Button } from '../components/ui/Button';
import LiveMatches from '../components/LiveMatches';
import HeaderTwo from '../components/headerTwo';
import federationImage from '../components/liveMatch/federationImgFallBack.png';
import { format } from 'date-fns';
import { useDarkMode } from '../contexts/DarkModeContext';
import { usePermissionLogger } from "../utils/permissionLogger.js";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import ChartDownloadWrapper from '../components/reusable/chartDownloader';
import {usePermissions }  from "../utils/permissions.js";
import {MODULE_IDS} from "../constants/modules.js";


const Dashboard = () => {

  const { hasModuleAccess } = usePermissions();

  const checkIfHeCanRead = async(name)=> {
    const canAccess = await hasModuleAccess(name)
    return Boolean(canAccess)
  }



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
  const [isLoading, setIsLoading] = useState(true);
  const [federations, setFederations] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const logPermissions = usePermissionLogger('dashboard');

  const [permissions, setPermissions] = useState({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false
  });
  const [appointmentRequestsM, setAppointmentRequestsM] = useState([]);
  const [AppointmentRequestsPS, setAppointmentRequestsPS] = useState([])


  const colors = [
    "bg-[#041779]",
    "bg-[#32a8dd]",
    "bg-[#32174c]",
    "bg-[#44ab40]",
    "bg-[#041779]",
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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

        const currentPermissions = logPermissions();
        setPermissions(currentPermissions);

        const clubData = clubs.data || [];
        const employeeData = Array.isArray(employees.data?.employees) ? employees.data.employees : [];
        const studentData = Array.isArray(students.data?.data) ? students.data.data : [];
        const documentData = Array.isArray(documents.data?.data) ? documents.data.data : [];
        const appointmentData = appointments.data || [];
        const playerData = players.data || [];

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
          playerDistribution: processPlayerDistribution(playerData),
          genderDistribution: processGenderDistribution(playerData),
          clubPerformance: processClubPerformance(clubData, playerData),
          competitionResults: federations.data.map(federation => ({
            name: federation.name,
            events: federation.events?.length || 0,
            participants: federation.participants?.length || 0
          }))
        });

        setAppointmentRequests(appointmentData);

        const futureAppointments = appointmentData.filter(appointment => new Date(appointment.date) > new Date());
        setUpcomingAppointments(futureAppointments);

        const sortedAppointments = appointmentData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAppointmentRequests(sortedAppointments.slice(0, 3));

        const appointmentRequestForM = appointmentData.filter(appointment =>
            appointment.person_to_meet === 'MINISTER' || appointment.person_to_meet === 'minister'
        );
        const topThreeAppointmentsM = appointmentRequestForM
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);
        setAppointmentRequestsM(topThreeAppointmentsM);

      const appointmentForPS = appointmentData.filter(appointment =>
      appointment.person_to_meet === 'PS' || appointment.person_to_meet === 'ps')


      const topThreePsAppointmentsPS = appointmentForPS
          .sort((a, b )=> new Date(b.date) - new Date(a.date))
          .slice(0,2)

        setAppointmentRequestsPS(topThreePsAppointmentsPS)



      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);
  // const { hasModuleAccess } = usePermissions();


  useEffect(() => {
    const fetchFederations = async () => {
      try {
        const response = await axiosInstance.get('/federations');
        setFederations(response.data);
      } catch (err) {
        console.error('Error fetching federations:', err);
      }
    };

    fetchFederations();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const renderAppointmentStatus = (status) => {
    switch (status) {
      case 'RESCHEDULED':
        return <span className="text-green-600 font-semibold">Approved</span>;
      case 'PENDING':
        return <span className="text-yellow-600 font-semibold">Pending</span>;
      case 'GRANTED':
        return <span className="text-yellow-600 font-semibold">Pending</span>;
      default:
        return <span className="text-red-600 font-semibold">unknown</span>;
    }
  };

  const processPlayerDistribution = (players) => {
    const distribution = players.reduce((acc, player) => {
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

  const statsRow1 = [
    { moduleId: MODULE_IDS.FEDERATIONS  ,number: statsData.federations, label: 'Federations', icon: FileText, color: 'bg-blue-100 text-blue-600', path: '/federations' },
    { moduleId: MODULE_IDS.FEDERATIONS ,number: statsData.clubs, label: 'Clubs', icon: Users, color: 'bg-purple-100 text-purple-600', path: '/federations' },
    { moduleId: MODULE_IDS.FEDERATIONS ,number: statsData.clubPlayers, label: 'Club Players', icon: Award, color: 'bg-green-100 text-green-600', path: '/federations' },
    { moduleId: MODULE_IDS.ISONGA_PROGRAMS ,number: statsData.sportTeams, label: 'Sport Teams', icon: Building2, color: 'bg-orange-100 text-orange-600', path: '/national-teams' },
    { moduleId: MODULE_IDS.FEDERATIONS ,number: statsData.teamPlayers, label: 'Team Players', icon: Flag, color: 'bg-green-100 text-green-600', path: '/national-teams' },
    { moduleId: MODULE_IDS.FEDERATIONS ,number: statsData.officialsAndPlayers, label: 'Officials & Players', icon: Flag, color: 'bg-green-100 text-green-600', path: '/national-teams' },
    { moduleId: MODULE_IDS.ISONGA_PROGRAMS ,number: statsData.isongaProgram, label: 'Isonga Program', icon: Award, color: 'bg-red-100 text-red-600', path: '/isonga-programs' },
    { moduleId: MODULE_IDS.ACADEMIES ,number: statsData.students, label: 'Students', icon: FileText, color: 'bg-indigo-100 text-indigo-600', path: '/isonga-programs' },
    { moduleId: MODULE_IDS.INFRASTRUCTURE ,number: statsData.infrastructure, label: 'Infrastructure', icon: Building2, color: 'bg-green-100 text-green-600', path: '/infrastructure' },
    { moduleId: MODULE_IDS.DOCUMENTS ,number: statsData.documents, label: 'Documents', icon: FileText, color: 'bg-indigo-100 text-indigo-600', path: '/documents' },
    { moduleId: MODULE_IDS.APPOINTMENTS ,number: statsData.appointments, label: 'Appointments', icon: CalendarIcon, color: 'bg-yellow-100 text-yellow-600', path: '/appointments' },
    { moduleId: MODULE_IDS.EMPLOYEE , number: statsData.employees, label: 'Employees', icon: FileText, color: 'bg-indigo-100 text-indigo-600', path: '/employee' }
  ];

  if (isLoading) {
    return <div className="flex animate animate-spin animate-spin justify-center items-center content-center h-screen"><Loader></Loader></div>;
  }

  return (
      <div className="p-6 space-y-6 bg-gray-50">
        <div className="space-y-3">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {statsRow1.map((stat, index) => (
                checkIfHeCanRead(stat.moduleId) && (
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

        {checkIfHeCanRead(MODULE_IDS.APPOINTMENTS) && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          <br/>
                          <p className="text-sm text-gray-500">{appointment.names}</p><br/>
                        </div>
                        <span className="text-sm text-gray-600">{renderAppointmentStatus(appointment.status)}</span>
                      </li>
                  ))}
                </ul>
            )}
          </div>
          {checkIfHeCanRead(MODULE_IDS.APPOINTMENTS) && (
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
                          <p className="text-sm text-gray-500 font-bold ">{appointment.names}</p>
                        </div>
                        <span className="text-sm text-gray-600">{renderAppointmentStatus(appointment.status)}</span>
                      </li>
                  ))}
                </ul>
            )}
            </div>
          )}
        </div>
        )}
        {}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {checkIfHeCanRead(MODULE_IDS.APPOINTMEN_PS) && (
          <div className="bg-white p-6 rounded-lg shadow-sm">

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Appointment Requests PS</h3>
              <Button size="sm" variant="secondary" onClick={() => navigate('/appointments-ps')}>View All</Button>
            </div>
            {AppointmentRequestsPS.length === 0 ? (
                <p className="text-gray-500">No new  appointment  requests. For PS</p>
            ) : (
                <ul>
                  {AppointmentRequestsPS.map((appointment, index) => (
                      <li key={index} className="flex justify-between items-center py-2">
                        <div>
                          <strong>{appointment.title}</strong>
                          <p className="text-sm text-gray-500">{new Date(appointment.request_date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-500 font-bold ">{appointment.names}</p>
                        </div>
                        <span className="text-sm text-gray-600">{renderAppointmentStatus(appointment.status)}</span>
                      </li>
                  ))}
                </ul>
            )}
          </div>
          )}


          {checkIfHeCanRead(MODULE_IDS.APPOINTMENT_MINISTER) && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Appointment Requests Minister</h3>
                  <Button size="sm" variant="secondary" onClick={() => navigate('/appointments-ministers')}>View
                    All</Button>
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
                              <p className="text-sm text-gray-500 font-bold ">{appointment.names}</p>
                            </div>
                            <span className="text-sm text-gray-600">{renderAppointmentStatus(appointment.status)}</span>
                          </li>
                      ))}
                    </ul>
                )}
              </div>
          )}

        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
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


        <main className="container mx-auto px-6 pt-24 pb-12">
          <div className="flex gap-12 border-black">
            <div className="border-green-400 w-full">
              <div className="flex flex-col md:flex-row space-x-4">
                {/*Modules allowed to access*/}
                {/*{checkIfHeCanRead(MODULE_IDS.FEDERATIONS) && (*/}
                {/*    <>HELLO </>*/}
                {/*)}*/}
              </div>


            </div>

          </div>
        </main>
      </div>
  );
}

export default Dashboard;

