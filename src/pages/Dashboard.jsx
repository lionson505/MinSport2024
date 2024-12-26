import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, Award, Building2, Flag, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import LiveMatches from '../components/LiveMatches';
import HeaderTwo from '../components/headerTwo';
import federationImage from '../components/liveMatch/federationImgFallBack.png';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';

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
  const [federations, setFederations] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const jl = localStorage.getItem("jl");
  if(jl ){
    window.location.reload();
    window.location.reload();
    localStorage.removeItem("jl");
  }

  const colors = [
    "bg-[#041779]",
    "bg-[#32a8dd]",
    "bg-[#32174c]",
    "bg-[#44ab40]",
    "bg-[#041779]",
  ];

  const isStatsAllowed = (path) => {
    const accessibleLinks = JSON.parse(localStorage.getItem("accessibleLinks") || "[]");
    return accessibleLinks.some((link) => link.path === path);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
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

        const futureAppointments = appointmentData.filter(appointment => new Date(appointment.date) > new Date());
        setUpcomingAppointments(futureAppointments);

        const sortedAppointments = appointmentData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAppointmentRequests(sortedAppointments.slice(0, 3));

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

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
      case 'approved':
        return <span className="text-green-600 font-semibold">Approved</span>;
      case 'pending':
        return <span className="text-yellow-600 font-semibold">Pending</span>;
      default:
        return <span className="text-gray-600">Unknown</span>;
    }
  };

  const statsRow1 = [
    { number: statsData.federations, label: 'Federations', icon: FileText, color: 'bg-blue-100 text-blue-600', path: '/federations' },
    { number: statsData.clubs, label: 'Clubs', icon: Users, color: 'bg-purple-100 text-purple-600', path: '/federations' },
    { number: statsData.clubPlayers, label: 'Club Players', icon: Award, color: 'bg-green-100 text-green-600', path: '/federations' },
    { number: statsData.sportTeams, label: 'Sport Teams', icon: Building2, color: 'bg-orange-100 text-orange-600', path: '/national-teams' },
    { number: statsData.teamPlayers, label: 'Team Players', icon: Flag, color: 'bg-green-100 text-green-600', path: '/national-teams' },
    { number: statsData.officialsAndPlayers, label: 'Officials & Players', icon: Flag, color: 'bg-green-100 text-green-600', path: '/national-teams' },
    { number: statsData.isongaProgram, label: 'Isonga Program', icon: Award, color: 'bg-red-100 text-red-600', path: '/isonga-programs' },
    { number: statsData.students, label: 'Students', icon: FileText, color: 'bg-indigo-100 text-indigo-600', path: '/isonga-programs' },
    { number: statsData.infrastructure, label: 'Infrastructure', icon: Building2, color: 'bg-green-100 text-green-600', path: '/infrastructure' },
    { number: statsData.documents, label: 'Documents', icon: FileText, color: 'bg-indigo-100 text-indigo-600', path: '/documents' },
    { number: statsData.appointments, label: 'Appointments', icon: CalendarIcon, color: 'bg-yellow-100 text-yellow-600', path: '/appointments' },
    { number: statsData.employees, label: 'Employees', icon: FileText, color: 'bg-indigo-100 text-indigo-600', path: '/employee' }
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

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* Existing Dashboard Content */}
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

      {/* New Component */}
      <main className="container mx-auto px-6 pt-24 pb-12">
        {/* Live Matches Section */}
        {/* <div className="mb-16">
          <Link
            to="/match"
            className="text-gray-500 hover:text-gray-600 flex items-center text-base justify-end"
          >
            Explore Matches
            <ChevronRight className="w-5 h-5 ml-2" />
          </Link>
          <LiveMatches />
        </div> */}

        {/* Main Content Grid */}
        <div className="flex gap-12 border-black">
          {/* Left Content */}
          <div className="border-green-400 w-full">
            <div className="flex flex-col md:flex-row space-x-4">
              {/* Leagues Section */}
              <div className="w-full md:w-3/4">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="lg:text-3xl md:text-2xl text-lg font-bold">Federations To Browse</h2>
                  <Link
                    to="/federations"
                    className="text-gray-500 hover:text-gray-600 flex items-center text-base"
                  >
                    View Federations
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>

                {isMobile ? (
                  <Swiper
                    modules={[Pagination, Autoplay, A11y]}
                    spaceBetween={0}
                    slidesPerView={1}
                    centeredSlides={true}
                    pagination={{ clickable: true }}
                    loop={true}
                    autoplay={{
                      delay: 1000,
                      disableOnInteraction: false,
                    }}
                    className="pb-10 px-6 py-4 w-full"
                    breakpoints={{
                      360: {
                        slidesPerView: 1,
                        spaceBetween: 0,
                        centeredSlides: true,
                      },
                      640: {
                        slidesPerView: 2,
                        spaceBetween: 20,
                      },
                      768: {
                        slidesPerView: 3,
                        spaceBetween: 30,
                      },
                    }}
                  >
                    {federations.map((federation, index) => {
                      const color = colors[index % colors.length];

                      return (
                        <SwiperSlide
                          key={federation.id}
                          className={`aspect-square m-4 rounded-xl !w-[250px] !md:w-[280px] ${color} flex flex-col items-center justify-center p-4 cursor-pointer hover:opacity-90 transition-all transform hover:scale-105`}
                        >
                          <img
                            src={federationImage}
                            alt={federation.name}
                            className="h-16 w-16 mb-4 rounded-full"
                          />
                          <span className="text-white text-center font-medium text-sm">
                            {federation.name}
                          </span>
                        </SwiperSlide>
                      )
                    })}
                  </Swiper>

                ) : (
                  <div className="md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 w-full">
                    {federations.map((federation, index) => {
                      const color = colors[index % colors.length];
                      return (
                        <div
                          key={federation.id}
                          className={`aspect-square my-2 rounded-xl w-[175px] lg:w-[265px] xl:w-[230px] 2xl:w-[275px] ${color} flex flex-col items-center justify-center p-4 cursor-pointer hover:opacity-90 transition-all transform hover:scale-105`}
                        >
                          <img
                            src={federationImage || federation.logo}
                            alt={federation.name}
                            className="h-16 w-16 mb-4"
                          />
                          <span className="text-white text-center font-medium text-sm">
                            {federation.name}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
