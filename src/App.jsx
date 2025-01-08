import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import CheckEmail from './pages/auth/CheckEmail';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { AuthProvider } from './contexts/AuthContext';
import SportsProfessionals from './pages/SportsProfessionals';
import Partners from './pages/Partners';
import ProtectedRoute from './components/ProtectedRoute';
import NationalTeams from './pages/NationalTeams';
import Employee from './pages/Employee';
import Appointments from './pages/Appointments';
import Training from './pages/Training';
import IsongaPrograms from './pages/IsongaPrograms';
import PlayerTransferReport from './components/reports/PlayerTransferReport';
import Federations from './pages/Federations';
import { ThemeProvider } from './context/ThemeContext';
import SportsForAll from './pages/SportsForAll';
import Users from './pages/Users';
import Contracts from './pages/Contracts';
import Documents from './pages/Documents';
import Academies from './pages/Academies';
import { Toaster } from 'react-hot-toast';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Infrastructure from './pages/Infrastructure';
import { InfrastructureProvider } from './contexts/InfrastructureContext';
import SportsTourism from './pages/SportsTourism';
import { TourismProvider } from './contexts/TourismContext';
import AllSportsEvents from './pages/AllSportsEvents';
import LandingPageFederation from './pages/public/Federation';
import LandingPageMatch from './pages/public/Match.jsx';
import EventsPage from './pages/public/EventsPage';
import NoPageFound from './pages/unauthorized';
import { MatchOperatorDashboard, TeamManagement, MatchOperatorProvider } from './features/match-operator';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MyMap from './pages/Map.jsx';
import PendingActivation from './pages/PendingActivation';
import { MODULE_IDS } from './constants/modules';
import MinisterAppointments from "./pages/AppointmentsMinister.jsx";
import PSAppointments from "./pages/AppointmentsPs.jsx";
import PasswordReset from './pages/auth/ResetPassword.jsx';

function App() {
  const [accessibleLinks, setAccessibleLinks] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRole = localStorage.getItem('userRole');
  const isActivated = localStorage.getItem('isActivated') === 'true';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAccessibleLinks = async () => {
      try {
        const storedLinks = localStorage.getItem('accessibleLinks');
        const parsedLinks = storedLinks ? JSON.parse(storedLinks) : [];
        setAccessibleLinks(parsedLinks);
      } catch (error) {
        console.error("Error parsing accessible links from localStorage", error);
        setAccessibleLinks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccessibleLinks();
  }, []);

  const isPathAllowed = async (path) => {
    const accessibles = await accessibleLinks
    if(accessibles !== null) {
      return accessibles.some(link => link.path === path);
    }
    else{
      return false
    }
  };

  // Development helper function
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // localStorage.setItem('userRole', 'admin');
    }
  }, []);

  if (isLoading) {
    // return <div>Loading...</div>;
  }

  // Define public routes that should always be accessible
  const publicRoutes = [
    '/',
    '/home',
    '/login',
    '/register',
    '/forgot-password',
    '/check-email',
    '/sports-events',
    '/events',
    '/federation',
    '/match',
    '/map',
    '/reset-password',

  ];

  return (
      <ThemeProvider>
        <DarkModeProvider>
          <InfrastructureProvider>
            <TourismProvider>
              <MatchOperatorProvider>
                <Router>
                  <AuthProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                          duration: 3000,
                          style: {
                            background: '#333',
                            color: '#fff',
                          },
                        }}
                    />
                    <ToastContainer />
                    <Routes>
                      {/* Public Routes - Always Accessible */}
                      <Route path="/register" element={<Register />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/check-email" element={<CheckEmail />} />
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/home" element={<LandingPage />} />
                      <Route path="/sports-events" element={<AllSportsEvents />} />
                      <Route path="/events" element={<EventsPage />} />
                      <Route path="/federation" element={<LandingPageFederation />} />
                      <Route path="/match" element={<LandingPageMatch />} />
                      <Route path="/matchs" element={<MatchOperatorDashboard />} />
                      <Route path="/map" element={<MyMap/>} />
                      <Route path="/pending-activation" element={<PendingActivation />} />
                      <Route path="/notAuthorized" element={<NoPageFound/>} />
                      <Route path="/reset-password" element={<PasswordReset/>} />

                      {/* Protected Routes */}
                      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                        <Route
                            path="/dashboard"
                            element={
                              <ProtectedRoute moduleId={MODULE_IDS.DASHBOARD}>
                                <Dashboard />
                              </ProtectedRoute>
                            }
                        />
                        <Route path="/national-teams" element={
                          <ProtectedRoute moduleId={MODULE_IDS.NATIONAL_TEAMS}>
                            <NationalTeams />
                          </ProtectedRoute>
                        } />
                        <Route path="/federations" element={
                          <ProtectedRoute moduleId={MODULE_IDS.FEDERATIONS}>
                            <Federations />
                          </ProtectedRoute>
                        } />
                        <Route path="/sports-professionals" element={
                          <ProtectedRoute moduleId={MODULE_IDS.SPORTS_PROFESSIONALS}>
                            <SportsProfessionals />
                          </ProtectedRoute>
                        } />
                        <Route path="/trainings" element={
                          <ProtectedRoute moduleId={MODULE_IDS.TRAININGS}>
                            <Training />
                          </ProtectedRoute>
                        } />
                        <Route path="/isonga-programs" element={
                          <ProtectedRoute moduleId={MODULE_IDS.ISONGA_PROGRAMS}>
                            <IsongaPrograms />
                          </ProtectedRoute>
                        } />
                        <Route path="/academies" element={
                          <ProtectedRoute moduleId={MODULE_IDS.ACADEMIES}>
                            <Academies />
                          </ProtectedRoute>
                        } />
                        <Route path="/appointments-ministers" element={
                          <ProtectedRoute moduleId={MODULE_IDS.APPOINTMENT_MINISTER}>
                            <MinisterAppointments />
                          </ProtectedRoute>
                        } />
                        <Route path="/infrastructure" element={
                          <ProtectedRoute moduleId={MODULE_IDS.INFRASTRUCTURE}>
                            <Infrastructure />
                          </ProtectedRoute>
                        } />
                        <Route path="/sports-tourism" element={
                          <ProtectedRoute moduleId={MODULE_IDS.SPORTS_TOURISM}>
                            <SportsTourism />
                          </ProtectedRoute>
                        } />
                        <Route path="/documents" element={
                          <ProtectedRoute moduleId={MODULE_IDS.DOCUMENTS}>
                            <Documents />
                          </ProtectedRoute>
                        } />
                        <Route path="/contracts" element={
                          <ProtectedRoute moduleId={MODULE_IDS.CONTRACTS}>
                            <Contracts />
                          </ProtectedRoute>
                        } />

                        <Route path="/appointments" element={
                          <ProtectedRoute moduleId={MODULE_IDS.APPOINTMENTS}>
                           <Appointments />
                         </ProtectedRoute>
                        } />


                        <Route path="/appointments-ps" element={
                          <ProtectedRoute moduleId={MODULE_IDS.APPOINTMEN_PS}>
                            <PSAppointments/>
                          </ProtectedRoute>
                        } />
                        <Route path="/employee" element={
                          <ProtectedRoute moduleId={MODULE_IDS.EMPLOYEE}>
                            <Employee />
                          </ProtectedRoute>
                        } />
                        <Route path="/users" element={
                          <ProtectedRoute moduleId={MODULE_IDS.USERS}>
                            <Users />
                          </ProtectedRoute>
                        } />
                        <Route path="/partners" element={
                          <ProtectedRoute moduleId={MODULE_IDS.PARTNERS}>
                            <Partners />
                          </ProtectedRoute>
                        } />
                        <Route path="/reports" element={
                          <ProtectedRoute moduleId={MODULE_IDS.REPORTS}>
                            <Reports />
                          </ProtectedRoute>
                        } />
                        <Route path="/sports-for-all" element={
                          <ProtectedRoute moduleId={MODULE_IDS.SPORTS_FOR_ALL}>
                            <SportsForAll />
                          </ProtectedRoute>
                        } />
                        <Route path="/match-operator" element={
                          <ProtectedRoute moduleId={MODULE_IDS.MATCH_OPERATOR}>
                            <MatchOperatorDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/settings" element={
                          <ProtectedRoute moduleId={MODULE_IDS.SETTINGS}>
                            <Settings />
                          </ProtectedRoute>
                        } />
                        <Route path="/player-transfer-report" element={
                          <ProtectedRoute moduleId={MODULE_IDS.Transfers}>
                            <PlayerTransferReport />
                          </ProtectedRoute>
                        } />

                        <Route path="/match-operator/teams" element={
                          <ProtectedRoute moduleId={MODULE_IDS.MATCH_OPERATOR_TEAMS}>
                            <TeamManagement />
                          </ProtectedRoute>
                        } />
                      </Route>

                      {/* Fallback Route */}
                      <Route path="*" element={
                        publicRoutes.includes(window.location.pathname) ? (
                            <Navigate to={window.location.pathname} />
                        ) : (
                            <Navigate to="/notAuthorized" replace />
                        )
                      } />
                    </Routes>
                  </AuthProvider>
                </Router>
              </MatchOperatorProvider>
            </TourismProvider>
          </InfrastructureProvider>
        </DarkModeProvider>
      </ThemeProvider>
  );
}

export default App;

