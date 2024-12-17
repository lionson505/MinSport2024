import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';

const SearchBar = () => {
  const { isDarkMode } = useDarkMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Define searchable items with their paths and categories
  const searchableItems = [
    { title: 'Dashboard', path: '/dashboard', category: 'Main' },
    { title: 'National Teams', path: '/national-teams', category: 'Sports' },
    { title: 'Federations', path: '/federations', category: 'Sports' },
    { title: 'Sports Professionals', path: '/sports-professionals', category: 'People' },
    { title: 'Trainings', path: '/trainings', category: 'Development' },
    { title: 'Isonga Programs', path: '/isonga-programs', category: 'Development' },
    { title: 'Academies', path: '/academies', category: 'Development' },
    { title: 'Infrastructure', path: '/infrastructure', category: 'Facilities' },
    { title: 'Sports Tourism', path: '/sports-tourism', category: 'Events' },
    { title: 'Documents', path: '/documents', category: 'Management' },
    { title: 'Contracts', path: '/contracts', category: 'Management' },
    { title: 'Appointments', path: '/appointments', category: 'Management' },
    { title: 'Employee', path: '/employee', category: 'People' },
    { title: 'Users', path: '/users', category: 'Management' },
    { title: 'Partners', path: '/partners', category: 'Management' },
    { title: 'Reports', path: '/reports', category: 'Analytics' },
    { title: 'Sports for All', path: '/sports-for-all', category: 'Programs' },
    { title: 'Settings', path: '/settings', category: 'System' }
  ];

  // Filter results based on search term
  const filteredResults = searchableItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle item selection
  const handleSelect = (path) => {
    navigate(path);
    setSearchTerm('');
    setShowResults(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredResults.length > 0) {
      handleSelect(filteredResults[0].path);
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search pages..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onKeyDown={handleKeyDown}
          className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-gray-600' 
              : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchTerm && (
        <div className={`absolute left-0 right-0 mt-2 py-2 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          {filteredResults.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(
                filteredResults.reduce((acc, item) => {
                  (acc[item.category] = acc[item.category] || []).push(item);
                  return acc;
                }, {})
              ).map(([category, items]) => (
                <div key={category} className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {category}
                  </div>
                  {items.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleSelect(item.path)}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 text-gray-200' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 