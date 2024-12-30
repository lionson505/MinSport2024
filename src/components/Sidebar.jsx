import React, { Suspense } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { PermissionMenuItem } from './PermissionMenuItem';
import { MODULES } from '../utils/rbac';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ErrorBoundary from './ErrorBoundary';

const navigationItems = [
  {
    module: MODULES.DASHBOARD,
    label: 'Dashboard',
    path: '/dashboard',
    icon: DashboardIcon
  },
  {
    module: MODULES.USERS,
    label: 'Users',
    path: '/users',
    icon: PeopleIcon
  },
  // Add all your modules here
];

const FallbackComponent = () => (
  <List>
    <ListItem>
      <ListItemText primary="Loading..." />
      <CircularProgress size={20} />
    </ListItem>
  </List>
);

export const Sidebar = () => {
  return (
    <ErrorBoundary fallback={<FallbackComponent />}>
      <Suspense fallback={<FallbackComponent />}>
        <List>
          {navigationItems.map((item) => (
            <PermissionMenuItem 
              key={item.path} 
              moduleName={item.module}
              fallback={null} // Hide item if no permission
            >
              <ListItem button component={Link} to={item.path}>
                <ListItemIcon>
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            </PermissionMenuItem>
          ))}
        </List>
      </Suspense>
    </ErrorBoundary>
  );
};
