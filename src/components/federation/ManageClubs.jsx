import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import { toast } from 'react-hot-toast';
import EditClubModal from './EditClubModal';
import AddClubForm from './AddClubForm';
import axios from '../../utils/axiosInstance';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { Button } from '../ui/Button';
import { Plus, Users, Eye, Pen, Trash2 } from 'lucide-react';
import PrintButton from '../reusable/Print';
import { usePermissionLogger } from "../../utils/permissionLogger.js";
import axiosInstance from '../../lib/axios.js';

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
  const logPermissions = usePermissionLogger('federations');

  const [permissions, setPermissions] = useState({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i);

  const fetchClubsAndFederations = async () => {
    try {
      const [clubsResponse, federationsResponse] = await Promise.all([axiosInstance.get('/clubs'), axiosInstance.get('/federations')]);
      setClubs(clubsResponse.data);
    } catch (err) {
      setError('Failed to load data');
    }
  };


  const fetchPermissions = async ()=> {
    const currentPermissions =await logPermissions();
    await setPermissions(currentPermissions);
  }

  useEffect(() => {
    fetchPermissions()
    console.log(permissions)// Update permissions

    fetchClubsAndFederations();
  }, []); // Only rerun when permissions are updated

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
          {/* Club Details Rendering Logic */}
          {/* Add Basic, Legal, and Contact Information Sections */}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      {/* Add Form for Searching and Filtering */}

      {/* Add Club Button */}
      <div className="flex justify-end">
        {permissions.canCreate && (
          <Button onClick={handleAddClub} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <Plus className="w-5 h-5" />
            Add Club
          </Button>
        )}
      </div>

      {/* Clubs Table */}
      <div className="p-6 rounded-lg bg-white shadow">
        <h2 className="text-xl font-semibold mb-4">Clubs List</h2>

        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : filteredClubs.length === 0 ? (
          <p>No clubs found for this federation or search criteria.</p>
        ) : (
          <>
            <PrintButton title="CLUBS REPORT">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Club Name</TableHead>
                    <TableHead>Federation</TableHead>
                    <TableHead>Year Founded</TableHead>
                    <TableHead className="operation">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentClubs.map((club) => (
                    <TableRow key={club.id}>
                      <TableCell>
                        <img src={`${axios.defaults.baseURL}${club.logo}`} alt="Club Logo" className="w-12 h-12 object-cover rounded-full" />
                        {/* {console.log(`Logo Path: ${axios.defaults.baseURL}${club.logo}`)} Log the logo path */}
  
                      </TableCell>
                      <TableCell>{club.name}</TableCell>
                      <TableCell>{federations.find((fed) => fed.id === club.federationId)?.name}</TableCell>
                      <TableCell>{club.yearFounded}</TableCell>
                      <TableCell className="operation">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleViewDetails(club)} className="p-1 rounded-lg hover:bg-gray-100" title="View Details">
                            <Eye className="h-4 w-4" />
                          </button>
                          {permissions.canUpdate && (
                            <button onClick={() => handleEdit(club)} className="p-1 rounded-lg hover:bg-gray-100" title="Edit">
                              <Pen className="h-4 w-4" />
                            </button>
                          )}
                          {permissions.canDelete && (
                            <button onClick={() => handleDeleteClick(club)} className="p-1 rounded-lg hover:bg-red-50 text-red-600" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => handleViewPlayers(club)} className="p-1 rounded-lg hover:bg-gray-100" title="View Players">
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
              <Button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
              <Button onClick={() => paginate(currentPage + 1)} disabled={indexOfLastRow >= filteredClubs.length}>Next</Button>
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
