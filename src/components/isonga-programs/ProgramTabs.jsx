export function ProgramTabs({ tabs, activeTab, onTabChange, isDarkMode }) {
  return (
    <div className="mb-6">
      <nav className="flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              activeTab === tab 
                ? 'bg-blue-600 text-white shadow-sm' 
                : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-800'
                  : 'text-gray-500 hover:bg-gray-100'
            }`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
} 