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
    return <div>Loading...</div>;
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
    '/map'
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
                    <Route path="/map" element={<MyMap/>} />

                    {/* Protected Routes */}
                    <Route element={
                      <ProtectedRoute>
                        {token && !isActivated && userRole !== 'admin' ? (
                          <PendingActivation />
                        ) : (
                          <DashboardLayout />
                        )}
                      </ProtectedRoute>
                    }>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/national-teams" element={isPathAllowed('/national-teams') ? <NationalTeams /> : <Navigate to="/unauthorized" />} />
                      <Route path="/federations" element={isPathAllowed('/federations') ? <Federations /> : <Navigate to="/unauthorized" />} />
                      <Route path="/sports-professionals" element={isPathAllowed('/sports-professionals') ? <SportsProfessionals /> : <Navigate to="/unauthorized" />} />
                      <Route path="/trainings" element={isPathAllowed('/trainings') ? <Training /> : <Navigate to="/unauthorized" />} />
                      <Route path="/isonga-programs" element={isPathAllowed('/isonga-programs') ? <IsongaPrograms /> : <Navigate to="/unauthorized" />} />
                      <Route path="/academies" element={isPathAllowed('/academies') ? <Academies /> : <Navigate to="/unauthorized" />} />
                      <Route path="/infrastructure" element={isPathAllowed('/infrastructure') ? <Infrastructure /> : <Navigate to="/unauthorized" />} />
                      <Route path="/sports-tourism" element={isPathAllowed('/sports-tourism') ? <SportsTourism /> : <Navigate to="/unauthorized" />} />
                      <Route path="/documents" element={isPathAllowed('/documents') ? <Documents /> : <Navigate to="/unauthorized" />} />
                      <Route path="/contracts" element={isPathAllowed('/contracts') ? <Contracts /> : <Navigate to="/unauthorized" />} />
                      <Route path="/appointments" element={isPathAllowed('/appointments') ? <Appointments /> : <Navigate to="/unauthorized" />} />
                      <Route path="/employee" element={isPathAllowed('/employee') ? <Employee /> : <Navigate to="/unauthorized" />} />
                      <Route path="/users" element={isPathAllowed('/users') ? <Users /> : <Navigate to="/unauthorized" />} />
                      <Route path="/partners" element={isPathAllowed('/partners') ? <Partners /> : <Navigate to="/unauthorized" />} />
                      <Route path="/reports" element={isPathAllowed('/reports') ? <Reports /> : <Navigate to="/unauthorized" />} />
                      <Route path="/sports-for-all" element={isPathAllowed('/sports-for-all') ? <SportsForAll /> : <Navigate to="/unauthorized" />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/player-transfer-report" element={isPathAllowed('/player-transfer-report') ? <PlayerTransferReport /> : <Navigate to="/unauthorized" />} />
                      <Route path="/match-operator" element={isPathAllowed('/match-operator') ? <MatchOperatorDashboard /> : <Navigate to="/unauthorized" />} />
                      <Route path="/match-operator/teams" element={isPathAllowed('/match-operator/teams') ? <TeamManagement /> : <Navigate to="/unauthorized" />} />
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
