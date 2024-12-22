import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { MODULES } from '../constants/permissions';
import { sidebarLinks } from '../constants/navigation';

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
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  // Function to check if a link should be visible
  const isLinkVisible = (link) => {
    // Admin sees everything
    if (user?.userGroup?.name === 'admin') return true;

    // Check module permissions
    switch (link.path) {
      case '/users':
        return hasPermission({ moduleId: MODULES.USERS, action: 'Read' });
      case '/groups':
        return hasPermission({ moduleId: MODULES.GROUPS, action: 'Read' });
      case '/federations':
        return hasPermission({ moduleId: MODULES.FEDERATIONS, action: 'Read' });
      case '/clubs':
        return hasPermission({ moduleId: MODULES.CLUBS, action: 'Read' });
      // Add other cases for different modules
      default:
        return true; // Public routes
    }
  };

  // Filter sidebar links based on permissions
  const filteredLinks = sidebarLinks.filter(isLinkVisible);

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
            {filteredLinks.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;  // Get the icon component

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
                  <Icon className="h-5 w-5" />
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
