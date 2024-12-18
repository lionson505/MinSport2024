import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../ui/table';
import { Eye, Edit, Trash2, Users } from 'lucide-react';

export function FederationTable({ 
  federations, 
  onView, 
  onEdit, 
  onDelete, 
  onManageClubs 
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Sport</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Clubs</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {federations.map((federation) => (
          <TableRow key={federation.id}>
            <TableCell>{federation.name}</TableCell>
            <TableCell>{federation.sport}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                federation.status === 'Active' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {federation.status}
              </span>
            </TableCell>
            <TableCell>{federation.clubs}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onView(federation)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(federation)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(federation)}
                  className="p-1 hover:bg-gray-100 rounded text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onManageClubs(federation)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Users className="w-4 h-4" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 