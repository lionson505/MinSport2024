import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export function EventList({ events, onView, onEdit, onDelete }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell>
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-gray-500">{event.type}</p>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <p>{formatDate(event.startDate)}</p>
                <p className="text-sm text-gray-500">{event.time}</p>
              </div>
            </TableCell>
            <TableCell>{event.location}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                event.status === 'Upcoming' 
                  ? 'bg-blue-100 text-blue-800'
                  : event.status === 'Ongoing'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {event.status}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onView(event)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(event)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Edit className="w-4 h-4 text-black" />
                </button>
                <button
                  onClick={() => onDelete(event)}
                  className="p-1 hover:bg-gray-100 rounded text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 