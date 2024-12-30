import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { PermissionMenuItem } from './PermissionMenuItem';
import { MODULES } from '../utils/rbac';

// Define your navigation items
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

export const Sidebar = () => {
  return (
    <List>
      {navigationItems.map((item) => (
        <PermissionMenuItem key={item.path} moduleName={item.module}>
          <ListItem button component={Link} to={item.path}>
            <ListItemIcon>
              <item.icon />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        </PermissionMenuItem>
      ))}
    </List>
  );
}; 