import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const Message = ({ type = 'info', message, onClose }) => {
  const { isDarkMode } = useDarkMode();
  
  const types = {
    success: {
      icon: CheckCircle,
      bg: isDarkMode ? 'bg-green-900/30' : 'bg-green-50',
      text: isDarkMode ? 'text-green-300' : 'text-green-800',
      border: isDarkMode ? 'border-green-800' : 'border-green-200',
      iconColor: isDarkMode ? 'text-green-400' : 'text-green-400'
    },
    error: {
      icon: XCircle,
      bg: isDarkMode ? 'bg-red-900/30' : 'bg-red-50',
      text: isDarkMode ? 'text-red-300' : 'text-red-800',
      border: isDarkMode ? 'border-red-800' : 'border-red-200',
      iconColor: isDarkMode ? 'text-red-400' : 'text-red-400'
    },
    warning: {
      icon: AlertCircle,
      bg: isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50',
      text: isDarkMode ? 'text-yellow-300' : 'text-yellow-800',
      border: isDarkMode ? 'border-yellow-800' : 'border-yellow-200',
      iconColor: isDarkMode ? 'text-yellow-400' : 'text-yellow-400'
    },
    info: {
      icon: Info,
      bg: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50',
      text: isDarkMode ? 'text-blue-300' : 'text-blue-800',
      border: isDarkMode ? 'border-blue-800' : 'border-blue-200',
      iconColor: isDarkMode ? 'text-blue-400' : 'text-blue-400'
    }
  };

  const style = types[type];
  const Icon = style.icon;

  return (
    <div className={`${style.bg} ${style.text} ${style.border} border rounded-lg p-4 mb-4`}>
      <div className="flex items-center">
        <Icon className={`h-5 w-5 ${style.iconColor} mr-3`} />
        <span className="flex-1">{message}</span>
        {onClose && (
          <button 
            onClick={onClose}
            className="ml-auto hover:opacity-70"
          >
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Message; 