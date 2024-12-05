import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
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
import { Toaster } from 'sonner';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Infrastructure from './pages/Infrastructure';
import { InfrastructureProvider } from './contexts/InfrastructureContext';
import SportsTourism from './pages/SportsTourism';
import { TourismProvider } from './contexts/TourismContext';
import AllSportsEvents from './pages/AllSportsEvents';
import EventsPage from './pages/public/EventsPage';
import NoPageFound from './pages/unauthorized';
import { MatchOperatorDashboard, TeamManagement, MatchOperatorProvider } from './features/match-operator';

function App() {
  const [accessibleLinks, setAccessibleLinks] = useState([]);

  // Retrieve accessible links from localStorage and handle potential errors
  useEffect(() => {
    const storedLinks = localStorage.getItem('accessibleLinks');
    try {
      // Parse the stored links, default to an empty array if parsing fails
      setAccessibleLinks(storedLinks ? JSON.parse(storedLinks) : []);
    } catch (error) {
      console.error("Error parsing accessible links from localStorage", error);
      setAccessibleLinks([]);
    }
  }, []);

  // Function to check if the current path is allowed
  const isPathAllowed = (path) => {
    return accessibleLinks.some(link => link.path === path);
  };
  console.log("PATTTTHH", isPathAllowed("/federations"));

  return (
    <ThemeProvider>
      <DarkModeProvider>
        <InfrastructureProvider>
          <TourismProvider>
            <MatchOperatorProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AuthProvider>
                  <Toaster position="top-right" richColors />
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/check-email" element={<CheckEmail />} />
                    <Route path="/landing" element={<LandingPage />} />
                    <Route path="/notAuthorized" element={<NoPageFound />} />
                    <Route path="/sports-events" element={<AllSportsEvents />} />
                    <Route path="/events" element={<EventsPage />} />
                    
                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
                      <Route path="/settings" element={ <Settings />} />
                      <Route path="/player-transfer-report" element={isPathAllowed('/player-transfer-report') ? <PlayerTransferReport /> : <Navigate to="/unauthorized" />} />
                      <Route path="/reports/sports-professionals" element={isPathAllowed('/reports/sports-professionals') ? <Reports /> : <Navigate to="/unauthorized" />} />
                      <Route path="/reports/isonga-program" element={isPathAllowed('/reports/isonga-program') ? <Reports /> : <Navigate to="/unauthorized" />} />
                      <Route path="/reports/infrastructure" element={isPathAllowed('/reports/infrastructure') ? <Reports /> : <Navigate to="/unauthorized" />} />
                      <Route path="/match-operator" element={isPathAllowed('/match-operator') ? <MatchOperatorDashboard /> : <Navigate to="/unauthorized" />} />
                      <Route path="/match-operator/teams" element={isPathAllowed('/match-operator/teams') ? <TeamManagement /> : <Navigate to="/unauthorized" />} />
                    </Route>
                    
                    {/* Fallback Route for non-accessible paths */}
                    <Route path="*" element={<Navigate to="/notAuthorized" replace />} />
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
