import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useDarkMode } from '../../contexts/DarkModeContext';

const PageLoading = () => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center">
      <LoadingSpinner size="lg" />
      <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Loading...
      </p>
    </div>
  );
};

export default PageLoading; 