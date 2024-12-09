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
import { Toaster } from 'react-hot-toast';
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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [accessibleLinks, setAccessibleLinks] = useState(null); // Initialize as null to differentiate between loading and empty state
  const [isLoading, setIsLoading] = useState(true); // Add a loading state

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
        setIsLoading(false); // Mark loading as complete
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

  // Display a loading state while accessibleLinks are being fetched
  if (isLoading) {
    return <div>Loading...</div>;
  }


  return (
      <ThemeProvider>
        <DarkModeProvider>
          <InfrastructureProvider>
            <TourismProvider>
              <MatchOperatorProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <AuthProvider>
                    <Toaster 
                      position="top-right"
                      toastOptions={{
                        duration: 3000,  // Toast will be shown for 3 seconds
                        style: {
                          background: '#333',
                          color: '#fff',
                        },
                      }}
                    />
                    <ToastContainer position="top-right" autoClose={3000} />
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
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/player-transfer-report" element={isPathAllowed('/player-transfer-report') ? <PlayerTransferReport /> : <Navigate to="/unauthorized" />} />
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
