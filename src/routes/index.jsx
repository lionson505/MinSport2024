import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { MODULES } from '../utils/rbac';

// Import your pages
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
// ... other imports

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute moduleName={MODULES.DASHBOARD}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/users" 
        element={
          <ProtectedRoute moduleName={MODULES.USERS}>
            <Users />
          </ProtectedRoute>
        } 
      />

      {/* Add routes for all your modules */}
      
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
    </Routes>
  );
}; 