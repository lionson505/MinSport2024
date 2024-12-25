import { Plus } from 'lucide-react';

export function ProgramHeader({ onAddClick, isSubmitting, isDarkMode }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Isonga Programs
      </h1>
      <button 
        onClick={onAddClick}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        disabled={isSubmitting}
      >
        <Plus className="h-5 w-5" />
        <span>Add Institution</span>
      </button>
    </div>
  );
} 