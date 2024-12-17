import React from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const LoadingSpinner = ({ size = 'md' }) => {
  const { isDarkMode } = useDarkMode();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-4 ${
        isDarkMode 
          ? 'border-gray-700 border-t-blue-500' 
          : 'border-gray-200 border-t-blue-600'
      } ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default LoadingSpinner; 