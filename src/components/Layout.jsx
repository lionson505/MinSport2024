import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useDarkMode } from '../contexts/DarkModeContext';

function Layout() {
  const { darkMode } = useDarkMode();

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 transition-colors duration-200">
          <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="flex justify-end mb-4">
              <DarkModeToggle />
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  return (
    <button
      onClick={toggleDarkMode}
      className={`px-4 py-2 rounded-lg ${
        darkMode 
          ? 'bg-gray-700 text-white hover:bg-gray-600' 
          : 'bg-white text-gray-800 hover:bg-gray-100'
      }`}
    >
      {darkMode ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}

export default Layout; 