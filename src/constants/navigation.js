import { 
  LayoutGrid,
  Flag,
  Award,
  Users,
  GraduationCap,
  School,
  Building2,
  Plane,
  FileText,
  Briefcase,
  Calendar,
  CircleUser,
  UsersRound,
  BarChart3,
  Trophy,
  UserPlus,
  Timer
} from 'lucide-react';

import { MODULES } from './permissions';

export const sidebarLinks = [
  {
    title: "Dashboard",
    path: '/dashboard',
    icon: LayoutGrid,
    module: null // Public route
  },
  {
    title: "Users",
    path: '/users',
    icon: UsersRound,
    module: MODULES.USERS
  },
  {
    title: "National Teams",
    path: "/national-teams",
    icon: Flag,
    module: MODULES.TEAMS
  },
  {
    title: "Federations",
    path: '/federations',
    icon: Award,
    module: MODULES.FEDERATIONS
  },
  {
    title: "Sports professionals",
    path: '/sports-professionals',
    icon: Users,
    module: MODULES.SPORTS_PROFESSIONALS
  },
  {
    title: "Trainings",
    path: '/trainings',
    icon: GraduationCap,
    module: MODULES.TRAININGS
  },
  {
    title: "Isonga Programs",
    path: '/isonga-programs',
    icon: School,
    module: MODULES.ISONGA
  },
  {
    title: "Academies",
    path: '/academies',
    icon: School,
    module: MODULES.ACADEMIES
  },
  {
    title: "Infrastructure",
    path: '/infrastructure',
    icon: Building2,
    module: MODULES.INFRASTRUCTURE
  },
  {
    title: "Sports tourism",
    path: '/sports-tourism',
    icon: Plane,
    module: MODULES.TOURISM
  },
  {
    title: "Documents",
    path: '/documents',
    icon: FileText,
    module: MODULES.DOCUMENTS
  },
  {
    title: "Contracts",
    path: '/contracts',
    icon: Briefcase,
    module: MODULES.CONTRACTS
  },
  {
    title: "Appointments",
    path: '/appointments',
    icon: Calendar,
    module: MODULES.APPOINTMENTS
  },
  {
    title: "Employee",
    path: '/employee',
    icon: CircleUser,
    module: MODULES.EMPLOYEES
  },
  {
    title: "Partners",
    path: '/partners',
    icon: Users,
    module: MODULES.PARTNERS
  },
  {
    title: "Reports",
    path: '/reports',
    icon: BarChart3,
    module: MODULES.REPORTS
  },
  {
    title: "Sports for all",
    path: '/sports-for-all',
    icon: Trophy,
    module: MODULES.SPORTS_FOR_ALL
  },
  {
    title: "Transfer Report",
    path: '/player-transfer-report',
    icon: UserPlus,
    module: MODULES.TRANSFERS
  },
  {
    title: "Match Operator",
    path: '/match-operator',
    icon: Timer,
    module: MODULES.MATCH_OPERATOR
  }
]; 