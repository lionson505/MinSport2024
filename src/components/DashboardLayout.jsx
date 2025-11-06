import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useDarkMode } from "../contexts/DarkModeContext";
import Sidebar from "./Sidebar";
import ProfileMenu from "./ui/ProfileMenu";
import SearchBar from "./SearchBar";
import { Menu, X } from "lucide-react";

const DashboardLayout = () => {
  const { isDarkMode } = useDarkMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div
      className={`min-h-screen flex ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 ${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-r z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={closeMobileMenu}
            className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <Sidebar onLinkClick={closeMobileMenu} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header
          className={`fixed top-0 right-0 left-0 lg:left-64 h-16 ${
            isDarkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          } border-b z-30 px-4 lg:px-6`}
        >
          <div className="flex items-center justify-between h-full">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className={`lg:hidden p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4 lg:mx-0">
              <SearchBar />
            </div>

            {/* Profile Menu */}
            <ProfileMenu />
          </div>
        </header>

        {/* Page Content */}
        <main
          className={`p-4 lg:p-6 mt-16 ${
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
