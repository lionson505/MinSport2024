import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
// import { Eye, Edit, Trash2, Users, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import EditClubModal from './EditClubModal';
import AddClubForm from './AddClubForm';
import axios from '../../utils/axiosInstance';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { Button } from '../ui/Button';
import {
  Plus,
  Users,
  Eye,
  Pen,
  Trash2
} from 'lucide-react';
import PrintButton from '../reusable/Print';
import {usePermissionLogger} from "../../utils/permissionLogger.js";

const ManageClubs = ({ onAdd, onEdit, onDelete, federations, isLoading, actionIcons }) => {
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
  const [error, setError] = useState(null);
  const logPermissions = usePermissionLogger('federations')

  const[permissions, setPermissions] = useState({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false
  })

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i);

  const fetchClubsAndFederations = async () => {
    try {
      const [clubsResponse, federationsResponse] = await Promise.all([
        axios.get('/clubs'),
        axios.get('/federations'),
      ]);
      setClubs(clubsResponse.data);
    } catch (err) {
      setError('Failed to load data');
    }
  };

  useEffect(() => {
    const currentPermissions = logPermissions();
    setPermissions(currentPermissions);
    console.log("perms:", permissions)
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

  const handleViewDetails = async (club) => {
    try {
      // Fetch detailed club information when viewing details
      const response = await axios.get(`/clubs/${club.id}`);
      setSelectedClub(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error('Failed to load club details');
    }
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

  const renderClubDetails = () => {
    if (!selectedClub) return null;

    return (
      <div className="max-h-[70vh] overflow-y-auto pr-4">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Club Name</p>
                <p className="font-medium">{selectedClub.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Federation</p>
                <p className="font-medium">
                  {federations.find(fed => fed.id === selectedClub.federationId)?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Year Founded</p>
                <p className="font-medium">{selectedClub.yearFounded || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Division</p>
                <p className="font-medium">{selectedClub.division || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Legal Representative Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal Representative</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedClub.legalRepresentativeName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{selectedClub.legalRepresentativeGender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedClub.legalRepresentativeEmail || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{selectedClub.legalRepresentativePhone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{selectedClub.address || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
        {permissions.canCreate && (<button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none"
            onClick={handleAddClub}
        >
          <Plus className="w-5 h-5"/>
          Add Club
        </button>)}

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
          <PrintButton title='CLUBS REPORT'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Club Name</TableHead>
                  <TableHead>Federation</TableHead>
                  <TableHead>Year Founded</TableHead>
                  <TableHead className="operation"> Actions</TableHead>
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
                    <TableCell className="operation">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewDetails(club)}
                          className="p-1 rounded-lg hover:bg-gray-100"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {permissions.canUpdate && (<button
                            onClick={() => handleEdit(club)}
                            className="p-1 rounded-lg hover:bg-gray-100"
                            title="Edit"
                        >
                          <Pen className="h-4 w-4"/>
                        </button>)}

                        {permissions.canDelete && (<button
                            onClick={() => handleDeleteClick(club)}
                            className="p-1 rounded-lg hover:bg-red-50 text-red-600"
                            title="Delete"
                        >
                          <Trash2 className="h-4 w-4"/>
                        </button>)}

                        <button
                            onClick={() => handleViewPlayers(club)}
                            className="p-1 rounded-lg hover:bg-gray-100"
                            title="View Players"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </PrintButton>
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

      {/* Club Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)}>
        <h3 className="text-xl">Club Details</h3>
        {renderClubDetails()}
      </Modal>
    </div>
  );
};

export default ManageClubs;
