import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui/table';
import {
  Search,
  Plus,
  Filter,
  X,
  MapPin,
  Users,
  Building2,
  Eye,
  Edit,
  Trash2,
    Loader,
    Loader2,
  History,
  AlertCircle,
  ArrowRight,
  PencilLine,
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import AddFederationForm from '../components/forms/AddFederationForm';
import AddPlayerStaffForm from '../components/federation/AddPlayerStaffForm';
import ActionMenu from '../components/ui/ActionMenu';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { federationApi } from '../services/federation';
import PageLoading from '../components/ui/PageLoading';
import Message from '../components/ui/Message';
import { useDarkMode } from '../contexts/DarkModeContext';
import ManageClubs from '../components/federation/ManageClubs';
import AddClubForm from '../components/federation/AddClubForm';
import { Button } from '../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import PlayerStaffTransfer from '../components/federation/PlayerStaffTransfer';
import axiosInstance from '../utils/axiosInstance';
import PrintButton from '../components/reusable/Print';
import {usePermissionLogger} from "../utils/permissionLogger.js";

const TransferHistoryModal = ({ isOpen, onClose, player }) => {
  const [transferHistory, setTransferHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransferHistory = async () => {
      if (!player?.id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/transfers?playerStaffId=${player.id}`);
        setTransferHistory(response.data.filter(transfer => transfer.playerStaffId === player.id));
      } catch (err) {
        setError('Failed to load transfer history');
        console.error('Error fetching transfer history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchTransferHistory();
    } else {
      setTransferHistory([]); // Reset transfer history when modal is closed
    }
  }, [isOpen, player?.id]); // Depend on player ID and isOpen

  if (!isOpen || !player) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            Transfer History - {player.firstName} {player.lastName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              {error}
            </div>
          ) : transferHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transfer history found for {player.firstName} {player.lastName}
            </div>
          ) : (
            <div className="space-y-4">
              {transferHistory.map((transfer) => (
                <div
                  key={transfer.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {new Date(transfer.transferDate).toLocaleDateString()}
                    </span>
                    <span className="text-sm px-2 py-1 rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{transfer.fromClub?.name || 'Unknown Club'}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span>{transfer.toClub?.name || 'Unknown Club'}</span>
                  </div>
                  
                  {transfer.additionalComments && (
                    <div className="mt-2 text-sm text-gray-500">
                      <p>{transfer.additionalComments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ViewPlayerModal = ({ isOpen, onClose, player }) => {
  if (!player) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{`${player.firstName} ${player.lastName}`} Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Name</span>
              <p>{`${player.firstName} ${player.lastName}`}</p>
            </div>
            <div>
              <span className="font-medium">Type</span>
              <p>{player.type}</p>
            </div>
            <div>
              <span className="font-medium">Federation</span>
              <p>{player.federation?.name || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium">Club</span>
              <p>{player.currentClub?.name || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium">Date of Birth</span>
              <p>{player.dateOfBirth ? new Date(player.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium">Nationality</span>
              <p>{player.nationality || 'N/A'}</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold">Additional Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Position/Role</span>
              <p>{player.position || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium">Jersey Number</span>
              <p>{player.jerseyNumber || 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Federations = () => {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('Manage Federations and associations');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [isAddFederationModalOpen, setIsAddFederationModalOpen] = useState(false);
  const [isAddClubModalOpen, setIsAddClubModalOpen] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [selectedFederation, setSelectedFederation] = useState(null);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);
  const [playersStaffData, setPlayersStaffData] = useState([]);
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState(null);
  const [federations, setFederations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Set to 5 for pagination
  const [filteredFederations, setFilteredFederations] = useState([]);
  const [deletePlayerStaffDialogOpen, setDeletePlayerStaffDialogOpen] = useState(false);
  const [playerStaffToDelete, setPlayerStaffToDelete] = useState(null);
  const [showTransferHistoryModal, setShowTransferHistoryModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [refreshPlayerStaffData, setRefreshPlayerStaffData] = useState(0);
  const [showPlayerDetailsModal, setShowPlayerDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const logPermissions = usePermissionLogger('federations')

  const[permissions, setPermissions] = useState({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false
  })

  const tabs = [
    'Manage Federations and associations',
    'Manage Clubs',
    'Manage Players/Staff',
    'Player/Staff Transfer',
    // 'Players Map',
  ];

  const filterConfig = {
    status: ['Active', 'Inactive', 'Suspended'],
    type: ['Federation', 'Association'],
    location: ['Kigali', 'Eastern', 'Western', 'Northern', 'Southern'],
  };

  const handleViewTransferHistory = (player) => {
    setSelectedPlayer(player);
    setShowTransferHistoryModal(true);
  };

  const handleViewPlayerDetails = (player) => {
    setSelectedPlayer(player);
    setShowPlayerDetailsModal(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
         const currentPermissions =await logPermissions();
         await setPermissions(currentPermissions);
        console.log("perms:", permissions)
        setLoading(false);

        const filters = {
          page: currentPage,
          limit: itemsPerPage,
        };
        const [federationsData, federationOptions] = await Promise.all([
          federationApi.getAllFederations(filters),
          federationApi.getFederationOptions(),
        ]);
        setFederations(federationsData);
        setFilteredFederations(federationsData);
      } catch (error) {
        setMessage({
          type: 'error',
          text: error.message || 'Failed to load federations. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage]);

  const handleEditPlayerStaff = (person) => {
    setPlayerToEdit(person);
    setIsAddPlayerModalOpen(true);
  };

  const handleAddPlayerStaff = async (playerStaffData) => {
    try {
      setIsLoading(true);
      if (playerToEdit) {
        await federationApi.updatePlayerStaff(playerToEdit.id, playerStaffData);
        toast.success('Player/Staff updated successfully');
      } else {
        await federationApi.createPlayerStaff(playerStaffData);
        toast.success('Player/Staff added successfully');
      }
      setIsAddPlayerModalOpen(false);
      setPlayerToEdit(null);
      setRefreshPlayerStaffData(prev => prev + 1);
    } catch (error) {
      toast.error('Failed to save player/staff');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFederation = async (federationData) => {
    try {
      setIsSubmitting(true);
      // const newFederation = await federationApi.createFederation(federationData);
      setFederations((prev) => [...prev, newFederation]);
      setFilteredFederations((prev) => [...prev, newFederation]);
      setIsAddFederationModalOpen(false);
    } catch (error) {
      toast.error('Failed to create federation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (federation) => {
    setFederationToEdit(federation);
    setEditModalOpen(true);
  };

  const handleDelete = async (federation) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage({
        type: 'success',
        text: 'Federation deleted successfully',
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to delete federation',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (federation) => {
    toast.success('Download started');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(federations.map((federation) => federation.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const statsCards = [
    { icon: Building2, label: 'Total Federations', value: '12', color: 'bg-blue-100 text-blue-600' },
    { icon: Users, label: 'Total Players', value: '2,450', color: 'bg-green-100 text-green-600' },
    { icon: Users, label: 'Total Staff', value: '156', color: 'bg-purple-100 text-purple-600' },
    { icon: MapPin, label: 'Locations', value: '32', color: 'bg-orange-100 text-orange-600' },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedItem(null);
    setShowAddModal(false);

    // Show toast message if transfer was processed
    if (tab === 'Player/Staff Transfer') {
      const transferProcessed = true; // Replace this with your actual transfer status check
      if (transferProcessed) {
        toast.success('Transfer processed successfully!', {
          description: 'The player/staff transfer has been completed.',
          duration: 3000,
        });
      }
    }

    switch (tab) {
      case 'Add Federation or association':
        setModalType('federation');
        break;
      case 'Add Player/Staff':
        setModalType('playerStaff');
        break;
      case 'Player/Staff Transfer':
        setModalType('transfer');
        break;
      default:
        setModalType(null);
    }
  };

  const handleAddClub = async (clubData) => {
    try {
      setIsSubmitting(true);
      const newClub = await federationApi.addClub(selectedFederation.id, clubData);
      const updatedClubs = await federationApi.getClubs(selectedFederation.id);
      setClubs(updatedClubs);
      setIsAddClubModalOpen(false);
      toast.success('Club added successfully');
    } catch (error) {
      console.error('Failed to add club:', error);
      toast.error('Failed to add club');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClub = async (clubId, clubData) => {
    try {
      setIsSubmitting(true);
      const updatedClub = await federationApi.updateClub(selectedFederation.id, clubId, clubData);
      setClubs((prev) => prev.map((club) => (club.id === clubId ? updatedClub : club)));
    } catch (error) {
      console.error('Failed to update club:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClub = async (clubId) => {
    try {
      setIsSubmitting(true);
      await federationApi.deleteClub(selectedFederation.id, clubId);
      setClubs((prev) => prev.filter((club) => club.id !== clubId));
    } catch (error) {
      console.error('Failed to delete club:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManageClubs = async (federation) => {
    setSelectedFederation(federation);
    setIsLoadingClubs(true);
    try {
      const clubsData = await federationApi.getClubs(federation.id);
      setClubs(clubsData);
    } catch (error) {
      console.error('Failed to load clubs:', error);
    } finally {
      setIsLoadingClubs(false);
    }
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    setCurrentPage(1);
    
    // Only filter the existing federations array without making API calls
    const filtered = federations.filter(federation =>
      federation.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      federation.acronym?.toLowerCase().includes(searchValue.toLowerCase()) ||
      federation.legalRepresentativeNam?.toLowerCase().includes(searchValue.toLowerCase()) ||
      federation.address?.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredFederations(filtered);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFederations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFederations.length / itemsPerPage);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [federationToEdit, setFederationToEdit] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [federationToDelete, setFederationToDelete] = useState(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  const handleEditSubmit = async (updatedData) => {
    try {
      setIsSubmitting(true);
      const updated = await federationApi.updateFederation(federationToEdit.id, updatedData);
      const updatedFederations = federations.map((fed) =>
        fed.id === federationToEdit.id ? updated : fed
      );
      setFederations(updatedFederations);
      setFilteredFederations(updatedFederations);
      setEditModalOpen(false);
      setFederationToEdit(null);
    } catch (error) {
      toast.error('Failed to update federation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (federation) => {
    setFederationToDelete(federation);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsSubmitting(true);
      await federationApi.deleteFederation(federationToDelete.id);
      const updatedFederations = federations.filter((fed) => fed.id !== federationToDelete.id);
      setFederations(updatedFederations);
      setFilteredFederations(updatedFederations);
      setDeleteModalOpen(false);
      setFederationToDelete(null);
    } catch (error) {
      toast.error('Failed to delete federation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      const updatedFederations = federations.filter((fed) => !selectedRows.includes(fed.id));
      setFederations(updatedFederations);
      setFilteredFederations(updatedFederations);
      setSelectedRows([]);
      setBulkDeleteModalOpen(false);
      toast.success(`${selectedRows.length} federations deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete federations');
    }
  };

  const [filteredPlayersStaff, setFilteredPlayersStaff] = useState(playersStaffData);
  const [playerFilters, setPlayerFilters] = useState({
    search: '',
    type: '',
    federation: '',
    club: '',
  });

  useEffect(() => {
    const fetchPlayersStaff = async () => {
      try {
        setIsLoading(true);
        const response = await federationApi.getAllPlayersStaff();
        setPlayersStaffData(response || []);
        setFilteredPlayersStaff(response || []);
      } catch (error) {
        console.error('Failed to fetch players/staff:', error);
        toast.error('Failed to fetch players/staff');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayersStaff();
  }, [refreshPlayerStaffData]);

  const handlePlayerSearch = (value) => {
    setPlayerFilters((prevFilters) => ({
      ...prevFilters,
      search: value,
    }));

    const searchLower = value.toLowerCase();
    const filtered = playersStaffData.filter((person) => {
      return (
        person.firstName.toLowerCase().includes(searchLower) ||
        person.lastName.toLowerCase().includes(searchLower) ||
        person.federation.name.toLowerCase().includes(searchLower) ||
        person.currentClub.name.toLowerCase().includes(searchLower)
      );
    });

    setFilteredPlayersStaff(filtered);
  };

  const handleTypeFilter = (value) => {
    setPlayerFilters((prevFilters) => ({
      ...prevFilters,
      type: value,
    }));

    const filtered = playersStaffData.filter((person) => {
      return (
        (value === '' || person.type === value) &&
        (playerFilters.search === '' || person.firstName.toLowerCase().includes(playerFilters.search.toLowerCase()) || person.lastName.toLowerCase().includes(playerFilters.search.toLowerCase()))
      );
    });

    setFilteredPlayersStaff(filtered);
  };

  const handleFederationFilter = (value) => {
    setPlayerFilters((prevFilters) => ({
      ...prevFilters,
      federation: value,
    }));

    const filtered = playersStaffData.filter((person) => {
      return (
        (value === '' || person.federation.id === value) &&
        (playerFilters.search === '' || person.firstName.toLowerCase().includes(playerFilters.search.toLowerCase()) || person.lastName.toLowerCase().includes(playerFilters.search.toLowerCase()))
      );
    });

    setFilteredPlayersStaff(filtered);
  };

  const handleClubFilter = (value) => {
    setPlayerFilters((prevFilters) => ({
      ...prevFilters,
      club: value,
    }));

    const filtered = playersStaffData.filter((person) => {
      return (
        (value === '' || person.currentClub.name === value) &&
        (playerFilters.search === '' || person.firstName.toLowerCase().includes(playerFilters.search.toLowerCase()) || person.lastName.toLowerCase().includes(playerFilters.search.toLowerCase()))
      );
    });

    setFilteredPlayersStaff(filtered);
  };

  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState({
    type: '',
    federation: '',
    club: '',
  });

  const handleAdvancedSearch = (value, field) => {
    setAdvancedSearch((prev) => ({
      ...prev,
      [field]: value,
    }));

    const filtered = playersStaffData.filter((person) => {
      const matchesType = !advancedSearch.type || person.type === advancedSearch.type;
      const matchesFederation = !advancedSearch.federation || person.federation === advancedSearch.federation;
      const matchesClub = !advancedSearch.club || person.club === advancedSearch.club;

      return matchesType && matchesFederation && matchesClub;
    });

    setFilteredPlayersStaff(filtered);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setAdvancedSearch({
      type: '',
      federation: '',
      club: '',
    });
    setFilteredPlayersStaff(playersStaffData);
    setCurrentPage(1);
  };

  const handleDeletePlayerStaffClick = (playerStaff) => {
    setPlayerStaffToDelete(playerStaff);
    setDeletePlayerStaffDialogOpen(true);
  };

  const handleDeletePlayerStaffConfirm = async () => {
    try {
      setIsSubmitting(true);
      await federationApi.deletePlayerStaff(playerStaffToDelete.id);
      setDeletePlayerStaffDialogOpen(false);
      setPlayerStaffToDelete(null);
      toast.success('Player/Staff deleted successfully');
      setRefreshPlayerStaffData(prev => prev + 1);
    } catch (error) {
      console.error('Failed to delete player/staff:', error);
      toast.error('Failed to delete player/staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  if(loading){
    return <div className="flex animate-spin animate justify-center items-center h-screen">
      <Loader2 />

    </div>;
  }

  const renderContent = () => {
    if (activeTab === 'Manage Federations and associations') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            {permissions.canCreate && (<Button
                onClick={() => setIsAddFederationModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Federation
            </Button>)}


            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search federations..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  className="border rounded px-2 py-1"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <PrintButton>
              <Table>
             {/*   <TableHeader>
                  This is the table
                </TableHeader>*/}
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px] text-xs">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedRows.length === currentItems.length}
                        onChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="min-w-[180px] text-xs">Name</TableHead>
                    <TableHead className="min-w-[180px] text-xs">Logo</TableHead>
                    <TableHead className="w-[80px] text-xs">Acronym</TableHead>
                    <TableHead className="w-[100px] text-xs">Year Founded</TableHead>
                    <TableHead className="min-w-[120px] text-xs">Address</TableHead>
                    <TableHead className="w-[80px] text-xs operation">Operation</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {currentItems.map((federation) => (
                  <TableRow key={federation.id}>
                    <TableCell className="text-xs">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedRows.includes(federation.id)}
                        onChange={() => {
                          if (selectedRows.includes(federation.id)) {
                            setSelectedRows(selectedRows.filter((id) => id !== federation.id));
                          } else {
                            setSelectedRows([...selectedRows, federation.id]);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-xs font-medium">{federation.name}</TableCell>
                      <TableCell>
                        <img src={`${axiosInstance.defaults.baseURL}${federation.logo}`} alt="federation Logo" className="w-12 h-12 object-cover rounded-full" />
                        {/* {console.log(`Logo Path: ${axiosInstance.defaults.baseURL}${federation.logo}`)} Log the logo path */}
  
                      </TableCell>
                    <TableCell className="text-xs">{federation.acronym}</TableCell>
                    <TableCell className="text-xs">{federation.yearFounded}</TableCell>
                    <TableCell className="text-xs">{federation.address}</TableCell>
                    <TableCell className="operation">
                      <div className="flex items-center gap-0.5">
                        <ActionMenu
                          onEdit={() => handleEdit(federation)}
                          onDelete={() => handleDeleteClick(federation)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </PrintButton>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="flex items-center text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredFederations.length)} of{' '}
                {filteredFederations.length} entries
              </div>
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
                    key={index + 1}
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
        </div>
      );
    }

    switch (activeTab) {
      case 'Manage Clubs':
        return (
          <ManageClubs
            onAdd={handleAddClub}
            onEdit={handleEditClub}
            onDelete={handleDeleteClub}
            federations={federations}
            isLoading={isLoading}
          />
        );

      case 'Manage Players/Staff':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              {permissions.canCreate && (<Button
                      onClick={() => {
                        setPlayerToEdit(null);
                        setIsAddPlayerModalOpen(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Player/Staff
                  </Button>
              )}

              <div className="flex flex-col gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Quick search..."
                      className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
                      onChange={(e) => handlePlayerSearch(e.target.value)}
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    {showAdvancedSearch ? 'Hide Filters' : 'Show Filters'}
                  </Button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Show:</span>
                    <select
                      className="border rounded px-2 py-1"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                {showAdvancedSearch && (
                  <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          className="w-full border rounded-lg px-3 py-2"
                          value={playerFilters.type}
                          onChange={(e) => handleTypeFilter(e.target.value)}
                        >
                          <option value="">All Types</option>
                          <option value="Player">Player</option>
                          <option value="Staff">Staff</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Federation</label>
                        <select
                          className="w-full border rounded-lg px-3 py-2"
                          value={playerFilters.federation}
                          onChange={(e) => handleFederationFilter(e.target.value)}
                        >
                          <option value="">All Federations</option>
                          {federations.map((fed) => (
                            <option key={fed.id} value={fed.id}>
                              {fed.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
                        <select
                          className="w-full border rounded-lg px-3 py-2"
                          value={playerFilters.club}
                          onChange={(e) => handleClubFilter(e.target.value)}
                        >
                          <option value="">All Clubs</option>
                          <option value="APR FC">APR FC</option>
                          <option value="Patriots BBC">Patriots BBC</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setPlayerFilters({
                              search: '',
                              type: '',
                              federation: '',
                              club: '',
                            });
                            setFilteredPlayersStaff(playersStaffData);
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <PrintButton>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px] text-xs">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </TableHead>
                    <TableHead className="min-w-[200px] text-xs">Name</TableHead>
                    <TableHead className="w-[100px] text-xs">Type</TableHead>
                    <TableHead className="min-w-[200px] text-xs">Federation</TableHead>
                    <TableHead className="w-[120px] text-xs">Club</TableHead>
                    <TableHead className="w-[120px] text-xs">Age/Date of birth</TableHead>
                    <TableHead className="w-[100px] text-xs">Nationality</TableHead>
                    <TableHead className="w-[120px] operation text-xs">Operation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayersStaff.slice(indexOfFirstItem, indexOfLastItem).map((person) => (
                    <TableRow key={person.id}>
                      <TableCell>
                        <input type="checkbox" className="rounded border-gray-300" />
                      </TableCell>
                      <TableCell className="font-medium">{`${person.firstName} ${person.lastName}`}</TableCell>
                      <TableCell>{person.type}</TableCell>
                      <TableCell>{person.federation.name}</TableCell>
                      <TableCell>{person.currentClub.name}</TableCell>
                      <TableCell>{new Date(person.dateOfBirth).toLocaleDateString()}</TableCell>
                      <TableCell>{person.nationality}</TableCell>
                      <TableCell className="operation"> 
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewPlayerDetails(person)}
                            className="p-1 rounded-lg hover:bg-gray-100"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {permissions.canUpdate && (<button
                              onClick={() => handleEditPlayerStaff(person)}
                              className="p-1 rounded-lg hover:bg-gray-100 text-gray-900"
                              title="Edit"
                          >
                            <PencilLine className="h-4 w-4 stroke-[1.5]" />
                          </button>)}
                          {permissions.canDelete && (<button
                              onClick={() => handleDeletePlayerStaffClick(person)}
                              className="p-1 rounded-lg hover:bg-red-50 text-red-600"
                              title="Delete"
                          >
                            <Trash2 className="h-4 w-4"/>
                          </button>)}

                          <button
                              onClick={() => handleViewTransferHistory(person)}
                              className="p-1 rounded-lg hover:bg-gray-100"
                              title="View Transfer History"
                          >
                            <History className="h-4 w-4"/>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </PrintButton>
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="flex items-center text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPlayersStaff.length)} of{' '}
                  {filteredPlayersStaff.length} entries
                </div>
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
                      key={index + 1}
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
          </div>
        );

      case 'Player/Staff Transfer':
        return <PlayerStaffTransfer />;

      case 'Players Map':
        return (
          <div className="space-y-6">
            {/* Players Map Component */}
            {/* Add map visualization component here */}
          </div>
        );

      default:
        return null;
    }
  };

  const renderForm = () => {
    return (
      <AddFederationForm
        onSubmit={(data) => {
          console.log('New federation:', data);
          setShowAddModal(false);
          toast.success('Federation added successfully');
        }}
        onCancel={() => setShowAddModal(false)}
      />
    );
  };

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {message && (
        <Message type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      <div className="mb-6 overflow-x-auto">
        <nav className="flex space-x-4 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-800'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {renderContent()}

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          if (!isSubmitting) {
            setShowAddModal(false);
            setSelectedItem(null);
          }
        }}
        title="Add Federation"
      >
        {renderForm()}
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => !isSubmitting && setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title={`Delete ${modalType}`}
        message={`Are you sure you want to delete this ${modalType}? This action cannot be undone.`}
        isSubmitting={isSubmitting}
      />

      <Modal
        isOpen={isAddFederationModalOpen}
        onClose={() => setIsAddFederationModalOpen(false)}
        title="Add Federation"
      >
        <AddFederationForm
          onSubmit={handleAddFederation}
          onCancel={() => setIsAddFederationModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isAddClubModalOpen}
        onClose={() => setIsAddClubModalOpen(false)}
        title="Add Club"
        className="max-h-[90vh]"
      >
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <AddClubForm
            onSubmit={(data) => {
              console.log('New club:', data);
              setIsAddClubModalOpen(false);
              toast.success('Club added successfully');
            }}
            onCancel={() => setIsAddClubModalOpen(false)}
          />
        </div>
      </Modal>

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Federation"
        className="max-w-4xl"
      >
        <div className="max-h-[80vh] overflow-y-auto">
          <AddFederationForm
            initialData={federationToEdit}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditModalOpen(false)}
            isEditing={true}
          />
        </div>
      </Modal>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">{federationToDelete?.name}</span>? This action cannot be undone and will
              remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Federation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDeleteModalOpen} onOpenChange={setBulkDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Bulk Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedRows.length} federations? This action cannot be undone and will
              remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setBulkDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDeleteConfirm}>
              Delete {selectedRows.length} Federations
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deletePlayerStaffDialogOpen} onOpenChange={setDeletePlayerStaffDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">
                {playerStaffToDelete?.firstName} {playerStaffToDelete?.lastName}
              </span>
              ? This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeletePlayerStaffDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlayerStaffConfirm}>
              Delete Player/Staff
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Modal
  isOpen={isAddPlayerModalOpen}
  onClose={() => {
    setIsAddPlayerModalOpen(false);
    setPlayerToEdit(null);
  }}
  title={playerToEdit ? 'Edit Player/Staff' : 'Add Player/Staff'}
>
  <AddPlayerStaffForm
    initialData={playerToEdit} // Pass initial data here
    onSubmit={handleAddPlayerStaff}
    onCancel={() => setIsAddPlayerModalOpen(false)}
  />
</Modal>

      <TransferHistoryModal
        isOpen={showTransferHistoryModal}
        onClose={() => {
          console.log('Closing modal');
          setShowTransferHistoryModal(false);
          setSelectedPlayer(null);
        }}
        player={selectedPlayer}
      />

      <ViewPlayerModal
        isOpen={showPlayerDetailsModal}
        onClose={() => setShowPlayerDetailsModal(false)}
        player={selectedPlayer}
      />
    </div>
  );
};

export default Federations;

