import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import NationalTeams from './pages/NationalTeams';
import SportsProfessionals from './pages/SportsProfessionals';
import Trainings from './pages/Trainings';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

function Routes() {
  return (
    <RouterRoutes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="national-teams" element={<NationalTeams />} />
        <Route path="sports-professionals" element={<SportsProfessionals />} />
        <Route path="trainings" element={<Trainings />} />
        <Route path="isonga-professionals" element={<div>Isonga Professionals Page</div>} />
        <Route path="academies" element={<div>Academies Page</div>} />
        <Route path="infrastructure" element={<div>Infrastructure Page</div>} />
        <Route path="sports-tourism" element={<div>Sports Tourism Page</div>} />
        <Route path="documents" element={<div>Documents Page</div>} />
        <Route path="contracts" element={<div>Contracts Page</div>} />
        <Route path="appointments" element={<div>Appointments Page</div>} />
        <Route path="employee" element={<div>Employee Page</div>} />
        <Route path="users" element={<div>Users Page</div>} />
        <Route path="partners" element={<div>Partners Page</div>} />
        <Route path="reports" element={<div>Reports Page</div>} />
        <Route path="sports-for-all" element={<div>Sports for All Page</div>} />
        <Route path="settings" element={<div>Settings Page</div>} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </RouterRoutes>
  );
}

export default Routes; 