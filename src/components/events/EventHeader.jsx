import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

export function EventHeader({ onAddClick }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">Sports Events</h1>
        <p className="text-gray-500 mt-1">Manage all sports events and competitions</p>
      </div>
      <Button onClick={onAddClick}>
        <Plus className="w-4 h-4 mr-2" />
        Add Event
      </Button>
    </div>
  );
} 