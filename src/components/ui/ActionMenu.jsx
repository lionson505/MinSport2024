import React from 'react';
import { Pencil, Download, Trash2 } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const ActionMenu = ({ onEdit, onDelete, onDownload }) => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onEdit}
        className={`p-1.5 rounded-lg transition-colors ${
          isDarkMode 
            ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' 
            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
        }`}
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <button
        onClick={onDownload}
        className={`p-1.5 rounded-lg transition-colors ${
          isDarkMode 
            ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' 
            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
        }`}
        title="Download"
      >
        <Download className="h-4 w-4" />
      </button>

      <button
        onClick={onDelete}
        className={`p-1.5 rounded-lg transition-colors ${
          isDarkMode 
            ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' 
            : 'hover:bg-red-50 text-red-600 hover:text-red-700'
        }`}
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ActionMenu; 