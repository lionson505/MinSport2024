import { useDarkMode } from '../contexts/DarkModeContext';

function StatsCards() {
  const { darkMode } = useDarkMode();
  
  const stats = [
    { number: 6, label: 'National Teams' },
    { number: 43, label: 'Federations' },
    { number: 78, label: 'Clubs' },
    { number: 12, label: 'Sport Teams' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${
            darkMode
              ? 'bg-gray-800 text-white'
              : 'bg-white text-gray-900'
          } rounded-lg p-6 shadow-sm transition-all duration-200`}
        >
          <div className="text-3xl font-bold mb-2">{stat.number}</div>
          <div className={`${
            darkMode ? 'text-gray-300' : 'text-gray-500'
          }`}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards; 