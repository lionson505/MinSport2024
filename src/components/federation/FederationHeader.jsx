import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

export function FederationHeader({ onAddClick }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">Sports Federations</h1>
        <p className="text-gray-500 mt-1">Manage sports federations and their activities</p>
      </div>
      <Button onClick={onAddClick}>
        <Plus className="w-4 h-4 mr-2" />
        Add Federation
      </Button>
    </div>
  );
} 