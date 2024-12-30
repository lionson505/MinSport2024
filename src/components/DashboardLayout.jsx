import React from "react";
import { Outlet } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import {Sidebar} from "./Sidebar";
import ProfileMenu from "./ui/ProfileMenu";
import SearchBar from "./SearchBar";

const DashboardLayout = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <div
      className={`min-h-screen flex ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 ${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-r z-40 flex flex-col`}
      >
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header
          className={`fixed top-0 right-0 left-64 h-16 ${
            isDarkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          } border-b z-30 px-6`}
        >
          <div className="flex items-center justify-between h-full">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <SearchBar />
            </div>

            {/* Profile Menu */}
            <ProfileMenu />
          </div>
        </header>

        {/* Page Content */}
        <main
          className={`p-6 mt-16 ${
            isDarkMode ? "bg-gray-900" : "bg-gray-50"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
