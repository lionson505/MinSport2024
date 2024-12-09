import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import { Eye, Edit, Trash2, Users, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import EditClubModal from './EditClubModal';
import AddClubForm from './AddClubForm';
import axios from '../../utils/axiosInstance';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { Button } from '../ui/Button';

const ManageClubs = () => {
  const { isDarkMode } = useDarkMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFederation, setSelectedFederation] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddClubModal, setShowAddClubModal] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [federations, setFederations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i);

  const fetchClubsAndFederations = async () => {
    setIsLoading(true);
    try {
      const [clubsResponse, federationsResponse] = await Promise.all([
        axios.get('/clubs'),
        axios.get('/federations'),
      ]);
      setClubs(clubsResponse.data);
      setFederations(federationsResponse.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClubsAndFederations();
  }, []);

  const filteredClubs = clubs.filter((club) => {
    const matchesSearchTerm = club.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFederation = selectedFederation ? club.federationId === selectedFederation : true;
    const matchesYear = selectedYear ? club.yearFounded === parseInt(selectedYear, 10) : true;
    return matchesSearchTerm && matchesFederation && matchesYear;
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentClubs = filteredClubs.slice(indexOfFirstRow, indexOfLastRow);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleAddClub = () => setShowAddClubModal(true);

  const handleViewDetails = (club) => {
    setSelectedClub(club);
    setShowDetailsModal(true);
  };

  const handleEdit = (club) => {
    setSelectedClub(club);
    setShowEditModal(true);
  };

  const handleDeleteClick = (club) => {
    setSelectedClub(club);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/clubs/${selectedClub.id}`);
      setShowDeleteDialog(false);
      setSelectedClub(null);
      toast.success('Club deleted successfully');
      fetchClubsAndFederations();
    } catch (err) {
      toast.error('Failed to delete club');
    }
  };

  const handleViewPlayers = (club) => {
    setSelectedClub(club);
    setShowPlayersModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Search By
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Federation:
            </label>
            <select
              value={selectedFederation}
              onChange={(e) => setSelectedFederation(e.target.value)}
              className={`w-full p-2 border ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            >
              <option value="">Select Federation</option>
              {federations.map((federation) => (
                <option key={federation.id} value={federation.id}>
                  {federation.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Year:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className={`w-full p-2 border ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            >
              <option value="">Select Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Search:
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by club name"
              className={`w-full p-2 border ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            />
          </div>
        </div>
      </div>

      {/* Add Club Button */}
      <div className="flex justify-end">
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none"
          onClick={handleAddClub}
        >
          <Plus className="w-5 h-5" />
          Add Club
        </button>
      </div>

      {/* Clubs Table */}
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Clubs List
        </h2>

        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : filteredClubs.length === 0 ? (
          <p>No clubs found for this federation or search criteria.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Club Name</TableHead>
                  <TableHead>Federation</TableHead>
                  <TableHead>Year Founded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentClubs.map((club) => (
                  <TableRow key={club.id}>
                    <TableCell>
                      {club.logo && <img src={club.logo} alt={club.name} className="w-10 h-10 object-cover" />}
                    </TableCell>
                    <TableCell>{club.name}</TableCell>
                    <TableCell>{federations.find((fed) => fed.id === club.federationId)?.name}</TableCell>
                    <TableCell>{club.yearFounded}</TableCell>
                    <TableCell className="flex gap-1">
                      <button
                        className="p-1 rounded-lg hover:bg-gray-100"
                        onClick={() => handleViewDetails(club)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 rounded-lg hover:bg-gray-100"
                        onClick={() => handleEdit(club)}
                        title="Edit Club"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 rounded-lg hover:bg-red-50 text-red-600"
                        onClick={() => handleDeleteClick(club)}
                        title="Delete Club"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 rounded-lg hover:bg-gray-100"
                        onClick={() => handleViewPlayers(club)}
                        title="View Players"
                      >
                        <Users className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between mt-4">
              <Button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                onClick={() => paginate(currentPage + 1)}
                disabled={indexOfLastRow >= filteredClubs.length}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Club"
        message={`Are you sure you want to delete the club ${selectedClub?.name}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* Edit Club Modal */}
      <EditClubModal
        isOpen={showEditModal}
        club={selectedClub}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchClubsAndFederations}
      />

      {/* Add Club Modal */}
      <AddClubForm
        isOpen={showAddClubModal}
        onClose={() => setShowAddClubModal(false)}
        onSuccess={fetchClubsAndFederations}
      />

      {/* Club Players Modal */}
      <Modal isOpen={showPlayersModal} onClose={() => setShowPlayersModal(false)}>
        <h3 className="text-xl">Players for {selectedClub?.name}</h3>
        {selectedClub?.playersList?.length ? (
          <ul>
            {selectedClub.playersList.map((player, idx) => (
              <li key={idx}>{player.name}</li>
            ))}
          </ul>
        ) : (
          <p>No players available for this club.</p>
        )}
      </Modal>
    </div>
  );
};

export default ManageClubs;
