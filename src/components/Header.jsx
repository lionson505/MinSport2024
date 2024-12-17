import { Search } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';

function Header() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              className={`pl-10 pr-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 text-white placeholder-gray-400' 
                  : 'bg-gray-100 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className={`px-4 py-2 rounded-lg ${
              darkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <span className="text-sm">2.5k Users</span>
        </div>
      </div>
    </header>
  );
}

export default Header; 