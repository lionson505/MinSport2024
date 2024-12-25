import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import { usePermissions } from '../utils/permissions';
import { MODULE_IDS } from '../utils/permissions';

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
  Settings,
  Moon,
  Sun,
  Search,
  Bell,
  Menu,
  X,
  UserPlus,
  Timer
} from 'lucide-react';

const Sidebar = () => {
  const { isDarkMode } = useDarkMode();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { permissions } = usePermissions();

  const sidebarLinks = [
    { 
      title: "Dashboard", 
      path: '/dashboard',
      icon: LayoutGrid,
      moduleId: MODULE_IDS.DASHBOARD 
    },
    { 
      title: "National Teams", 
      path: '/national-teams',
      icon: Flag,
      moduleId: MODULE_IDS.NATIONAL_TEAMS 
    },
    { title: "Federations", path: "/federations", icon: Award, moduleId: MODULE_IDS.FEDERATIONS },
    { title: "Sports professionals", path: "/sports-professionals", icon: Users, moduleId: MODULE_IDS.SPORTS_PROFESSIONALS },
    { title: "Trainings", path: "/trainings", icon: GraduationCap, moduleId: MODULE_IDS.TRAININGS },
    { title: "Isonga Programs", path: "/isonga-programs", icon: School, moduleId: MODULE_IDS.ISONGA_PROGRAMS },
    { title: "Academies", path: "/academies", icon: Building2, moduleId: MODULE_IDS.ACADEMIES },
    { title: "Infrastructure", path: "/infrastructure", icon: Plane, moduleId: MODULE_IDS.INFRASTRUCTURE },
    { title: "Sports tourism", path: "/sports-tourism", icon: FileText, moduleId: MODULE_IDS.SPORTS_TOURISM },
    { title: "Documents", path: "/documents", icon: Briefcase, moduleId: MODULE_IDS.DOCUMENTS },
    { title: "Contracts", path: "/contracts", icon: Calendar, moduleId: MODULE_IDS.CONTRACTS },
    { title: "Appointments", path: "/appointments", icon: CircleUser, moduleId: MODULE_IDS.APPOINTMENTS },
    { title: "Employee", path: "/employee", icon: UsersRound, moduleId: MODULE_IDS.EMPLOYEE },
    { title: "Users", path: "/users", icon: BarChart3, moduleId: MODULE_IDS.USERS },
    { title: "Partners", path: "/partners", icon: Trophy, moduleId: MODULE_IDS.SPORTS_FOR_ALL },
    { title: "Reports", path: "/reports", icon: Settings, moduleId: MODULE_IDS.SPORTS_FOR_ALL },
    { title: "Sports for all", path: "/sports-for-all", icon: Moon, moduleId: MODULE_IDS.SPORTS_FOR_ALL },
    { title: "Transfer Report", path: "/player-transfer-report", icon: Sun, moduleId: MODULE_IDS.SPORTS_FOR_ALL },
    { title: "Match Operator", path: "/match-operator", icon: Search, moduleId: MODULE_IDS.SPORTS_FOR_ALL }
  ];

  // Simple permission check
  const authorizedLinks = sidebarLinks.filter(link => {
    if (localStorage.getItem('userRole') === 'admin') return true;
    return permissions?.some(p => p.moduleId === link.moduleId && p.canRead);
  });

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
        isCollapsed ? "-translate-x-full" : "translate-x-0"
      } md:relative md:translate-x-0 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
      style={{ width: isCollapsed ? "64px" : "256px" }}
    >
      <div
        className={`flex flex-col h-full ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        } border-r`}
      >
        {/* Logo */}
        <NavLink to="/">
        <div
          className={`flex items-center justify-center h-16 px-4 ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          } border-b`}
        >
          
          <img src="/logo/logo.svg" alt="Logo" className="h-10 w-auto" />
        </div>
        </NavLink>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="px-3 py-4 space-y-1">
            {authorizedLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.title}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isDarkMode
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm">{item.title}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>


            {/* this is for placeholder  */}

            <div className={`p-1 ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
              } border-t`}
            > 


            </div>

        {/* Settings */}
        {/* <div
          className={`p-4 ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          } border-t`}
        >
          <button
            onClick={toggleDarkMode}
            className={`flex items-center space-x-3 px-4 py-2.5 w-full rounded-lg ${
              isDarkMode
                ? "text-gray-300 hover:bg-gray-800"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="text-sm">Dark Mode</span>
          </button>
        </div> */}
      </div>
    </aside>
  );
};

export default Sidebar;
