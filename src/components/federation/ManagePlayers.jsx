import React, { useState } from 'react';
import { Button, Modal, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './components';
import { Plus, Search, Edit, Trash2, Eye } from 'react-icons/all';
import AddPlayerForm from './AddPlayerForm';
import ConfirmDialog from './ConfirmDialog';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';

const ManagePlayers = ({ playersData, federations, clubs, isLoading, onDataChange }) => {
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [filteredPlayers, setFilteredPlayers] = useState(playersData);
  const [filters, setFilters] = useState({ search: '', type: '', federation: '', club: '' });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    const lowercasedValue = value.toLowerCase();
    setFilteredPlayers(
      playersData.filter((player) =>
        player.name.toLowerCase().includes(lowercasedValue)
      )
    );
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    let filtered = playersData;

    if (value) {
      filtered = filtered.filter((player) => player[field] === value);
    }

    setFilteredPlayers(filtered);
  };

  const handleDelete = (player) => {
    setSelectedPlayer(player);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/player-staff/${selectedPlayer.id}`);
      onDataChange(); // Trigger data reload
      setShowConfirmDialog(false);
      setSelectedPlayer(null);
      setFilteredPlayers(filteredPlayers.filter(p => p.id !== selectedPlayer.id)); // Update state
      toast.success(`Successfully deleted ${selectedPlayer.name}`);
    } catch (error) {
      console.error('Error deleting player:', error);
      toast.error('Failed to delete player. Please try again.');
    }
  };

  const handleEdit = (player) => {
    // Logic to edit player
    console.log('Editing:', player);
    // You can open a modal here to edit player details
  };

  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPlayers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-6 bg-gray-50">
      {/* Add Player and Search Bar */}
      <div className="flex justify-between items-center mb-6">
        <Button
          className="bg-blue-600 text-white flex items-center gap-2"
          onClick={() => setShowAddPlayerModal(true)}
        >
          <Plus className="h-4 w-4" />
          Add Player/Staff
        </Button>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Quick search..."
              className="pl-10 pr-4 py-2 border rounded-lg"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilters({ search: '', type: '', federation: '', club: '' })}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Federation</TableHead>
              <TableHead className="text-xs">Club</TableHead>
              <TableHead className="text-xs">Age</TableHead>
              <TableHead className="text-xs">Nationality</TableHead>
              <TableHead className="text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((player) => (
              <TableRow key={player.id}>
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.type}</TableCell>
                <TableCell>{player.federation}</TableCell>
                <TableCell>{player.club}</TableCell>
                <TableCell>{player.age}</TableCell>
                <TableCell>{player.nationality}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      onClick={() => console.log('Viewing details for', player)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(player)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(player)}
                      className="p-1 rounded hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 border-t">
          <span className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPlayers.length)} of {filteredPlayers.length} entries
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index}
                variant={currentPage === index + 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Add Player Modal */}
      <Modal
        isOpen={showAddPlayerModal}
        onClose={() => setShowAddPlayerModal(false)}
        title="Add Player/Staff"
      >
        <AddPlayerForm
          onSubmit={async (data) => {
            try {
              await axiosInstance.post('/player-staff', data);
              onDataChange(); // Trigger data reload
              setShowAddPlayerModal(false);
              toast.success('Player added successfully');
            } catch (error) {
              console.error('Error adding player:', error);
              toast.error('Failed to add player. Please try again.');
            }
          }}
          onCancel={() => setShowAddPlayerModal(false)}
        />
      </Modal>

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${selectedPlayer?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default ManagePlayers;
