import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  Timer,
  // ... other icons
} from 'lucide-react';
import { PERMISSIONS } from '../constants/permissions';

export const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'dashboard.access'
  },
  // ... other existing items
  {
    name: 'Match Operator',
    href: '/match-operator',
    icon: Timer,
    permission: PERMISSIONS.MATCH_OPERATOR.ACCESS,
    subItems: [
      {
        name: 'Dashboard',
        href: '/match-operator',
        permission: PERMISSIONS.MATCH_OPERATOR.ACCESS
      },
      {
        name: 'Team Management',
        href: '/match-operator/teams',
        permission: PERMISSIONS.MATCH_OPERATOR.ACCESS
      }
    ]
  },
  // ... other items
]; 