import React, { useState, useEffect, Fragment } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Plus, Eye, Edit, Trash2, X } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import AddNationalTeamForm from '../components/forms/AddNationalTeamForm';
import toast from 'react-hot-toast';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong.</h2>;
    }
    return this.props.children;
  }
}

function NationalTeams() {
  const [activeTab, setActiveTab] = useState('Manage National Teams');
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [federations, setFederations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPlayerDeleteDialog, setShowPlayerDeleteDialog] = useState(false);
  const [showPlayerViewDialog, setShowPlayerViewDialog] = useState(false);
  const [showPlayerEditModal, setShowPlayerEditModal] = useState(false);
  const [selectedTeamData, setSelectedTeamData] = useState(null);
  const [selectedPlayerData, setSelectedPlayerData] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewTeam, setViewTeam] = useState(null);

  const [selectedTeamForPlayer, setSelectedTeamForPlayer] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [availableGames, setAvailableGames] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]);
  const [playerStaffList, setPlayerStaffList] = useState([]);
  const [selectedPlayerStaff, setSelectedPlayerStaff] = useState('');

  const [playerSearchFilters, setPlayerSearchFilters] = useState({
    name: '',
    team: '',
    federation: '',
    appearances: ''
  });

  const [teamPage, setTeamPage] = useState(0);
  const [playerPage, setPlayerPage] = useState(0);
  const rowsPerPage = 5;

  const tabs = ['Manage National Teams', 'Manage Players', 'Player Appearance'];

  const teamColumns = [
    { key: 'id', header: 'ID' },
    { key: 'teamName', header: 'TEAM NAME' },
    { key: 'month', header: 'MONTH' },
    { key: 'status', header: 'STATUS' },
    { key: 'federation', header: 'FEDERATION' },
    { key: 'players', header: 'PLAYERS' }
  ];

  const playerColumns = [
    { key: 'name', header: 'Player Name' },
    { key: 'teamName', header: 'Team' },
    { key: 'federation', header: 'Federation' },
    { key: 'club', header: 'Club' },
    { key: 'games', header: 'Games' },
    { key: 'actions', header: 'Actions' }
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const [teamResponse, playerResponse, clubResponse, playerStaffResponse, federationResponse] = await Promise.all([
          axiosInstance.get('/national-teams'),
          axiosInstance.get('/national-team-player-staff'),
          axiosInstance.get('/clubs'),
          axiosInstance.get('/player-staff'),
          axiosInstance.get('/federations'), // Assuming this endpoint exists
        ]);
        setTeams(teamResponse.data);
        setPlayers(playerResponse.data);
        setClubs(clubResponse.data);
        setPlayerStaffList(playerStaffResponse.data);
        setFederations(federationResponse.data);
      } catch (error) {
        toast.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleView = (team) => {
    setViewTeam(team);
    setIsViewModalOpen(true);
  };

  const handleEdit = (team) => {
    setSelectedTeamData(team);
    setShowAddModal(true);
  };

  const handleDelete = (team) => {
    setSelectedTeamData(team);
    setShowDeleteDialog(true);
  };

  const handleAddTeam = async (data) => {
    console.log('Submitting team data:', data); // Log the data being sent

    if (!data.teamName || !data.teamMonth || !data.teamYear || !data.federationId || !data.competition || !data.city || !data.country || !data.games) {
      toast.error('All fields are required.');
      return;
    }

    try {
      if (selectedTeamData) {
        console.log('Updating team with ID:', selectedTeamData.id); // Log the ID being updated
        const response = await axiosInstance.put(`/national-teams/${selectedTeamData.id}`, data);
        setTeams(prev => prev.map(team => 
          team.id === selectedTeamData.id ? response.data : team
        ));
        toast.success('Team updated successfully');
      } else {
        const response = await axiosInstance.post('/national-teams', {
          ...data,
          status: 'Active'
        });
        setTeams(prev => [...prev, response.data]);
        toast.success('Team added successfully');
      }
      setShowAddModal(false);
      setSelectedTeamData(null);
    } catch (error) {
      console.error('Error adding/updating team:', error.response || error); // Log the error response
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/national-teams/${selectedTeamData.id}`);
      setTeams(prev => prev.filter(team => team.id !== selectedTeamData.id));
      setShowDeleteDialog(false);
      toast.success('Team deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete team');
    }
  };

  const handleAddPlayerSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const selectedTeam = teams.find(t => t.id === parseInt(selectedTeamForPlayer));
    const selectedClubData = clubs.find(c => c.id === parseInt(selectedClub));

    const playerData = {
      federationId: selectedTeam?.federationId,
      teamId: parseInt(selectedTeamForPlayer),
      clubId: parseInt(selectedClub),
      playerStaffId: parseInt(selectedPlayerStaff),
      games: selectedGames,
    };

    try {
      const response = await axiosInstance.post('/national-team-player-staff', playerData);
      setPlayers(prev => [...prev, response.data]);
      toast.success('Player added successfully');
      setShowAddPlayerModal(false);
      
      setSelectedTeamForPlayer('');
      setSelectedClub('');
      setAvailableGames([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add player');
    }
  };

  const handlePlayerEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const playerData = {
      teamId: parseInt(selectedTeamForPlayer),
      clubId: parseInt(selectedClub),
      playerStaffId: parseInt(selectedPlayerStaff),
      games: selectedGames,
    };

    console.log('Submitting player data:', playerData); // Log the data being sent

    try {
      const response = await axiosInstance.put(`/national-team-player-staff/${selectedPlayerData.id}`, playerData);
      setPlayers(prev => prev.map(player => 
        player.id === selectedPlayerData.id ? response.data : player
      ));
      toast.success('Player updated successfully');
      setShowPlayerEditModal(false);
      setSelectedPlayerData(null);
    } catch (error) {
      console.error('Error updating player:', error.response || error); // Log the error response
      toast.error(error.response?.data?.message || 'Failed to update player');
    }
  };

  const handlePlayerView = (player) => {
    setSelectedPlayerData(player);
    setShowPlayerViewDialog(true);
  };

  const handlePlayerEdit = (player) => {
    setSelectedPlayerData(player);
    setSelectedTeamForPlayer(player.teamId.toString());
    setSelectedClub(player.clubId.toString());
    setSelectedPlayerStaff(player.playerStaffId.toString());
    setSelectedGames(player.games);
    setShowPlayerEditModal(true);
  };

  const handlePlayerDelete = (player) => {
    setSelectedPlayerData(player);
    setShowPlayerDeleteDialog(true);
  };

  const confirmPlayerDelete = async () => {
    try {
      await axiosInstance.delete(`/national-team-player-staff/${selectedPlayerData.id}`);
      setPlayers(prev => prev.filter(player => player.id !== selectedPlayerData.id));
      setShowPlayerDeleteDialog(false);
      toast.success('Player deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete player');
    }
  };

  const renderTeamDetails = (team) => {
    if (!team) return null;

    const details = [
      { label: 'Team Name', value: team.teamName },
      { label: 'Month', value: team.month },
      { label: 'Status', value: team.status },
      { label: 'Federation', value: team.federation.name || team.federation },
      { label: 'Players', value: Array.isArray(team.players) ? team.players.length : team.players }
    ];

    return (
      <div className="space-y-4">
        {details.map((detail, index) => (
          <div key={index} className="grid grid-cols-2 gap-4">
            <span className="text-gray-500">{detail.label}:</span>
            <span className="font-medium">{detail.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderPlayerDetails = (player) => {
    if (!player) return null;

    const details = [
      { label: 'Player Name', value: player.name },
      { label: 'Team', value: player.teamName },
      { label: 'Federation', value: player.federation?.name || player.federation },
      { label: 'Club', value: typeof player.club === 'object' ? player.club.name : player.club },
      { label: 'Games', value: Array.isArray(player.games) ? player.games.map(game => game.stadium).join(', ') : player.games }
    ];

    return (
      <div className="space-y-4">
        {details.map((detail, index) => (
          <div key={index} className="grid grid-cols-2 gap-4">
            <span className="text-gray-500">{detail.label}:</span>
            <span className="font-medium">{detail.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderActions = (team) => (
    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleView(team)}
        className="p-1 h-7 w-7"
        title="View Team"
      >
        <Eye className="h-4 w-4 text-blue-600" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleEdit(team)}
        className="p-1 h-7 w-7"
        title="Edit Team"
      >
        <Edit className="h-4 w-4 text-green-600" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleDelete(team)}
        className="p-1 h-7 w-7"
        title="Delete Team"
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );

  const renderPlayerActions = (player) => (
    <div className="flex items-center space-x-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handlePlayerView(player)}
        className="p-1 h-7 w-7"
        title="View Player"
      >
        <Eye className="h-4 w-4 text-blue-600" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handlePlayerEdit(player)}
        className="p-1 h-7 w-7"
        title="Edit Player"
      >
        <Edit className="h-4 w-4 text-green-600" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handlePlayerDelete(player)}
        className="p-1 h-7 w-7"
        title="Delete Player"
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );

  const renderPaginationControls = (currentPage, totalPages, setPage) => (
    <div className="flex justify-between items-center mt-4">
      <Button
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage === 0}
      >
        Previous
      </Button>
      <span>
        Page {currentPage + 1} of {totalPages}
      </span>
      <Button
        onClick={() => setPage(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
      >
        Next
      </Button>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (activeTab === 'Manage National Teams') {
      const totalTeamPages = Math.ceil(teams.length / rowsPerPage);
      const paginatedTeams = teams.slice(teamPage * rowsPerPage, (teamPage + 1) * rowsPerPage);

      return (
        <div className="transition-all duration-200 ease-in-out">
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {teamColumns.map(col => (
                    <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      {col.header}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedTeams.length > 0 ? (
                  paginatedTeams.map((team) => (
                    <tr key={team.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{team.id}</td>
                      <td className="px-4 py-3">{team.teamName}</td>
                      <td className="px-4 py-3">{team.month}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          team.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {team.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{team.federation.name || team.federation}</td>
                      <td className="px-4 py-3">{Array.isArray(team.players) ? team.players.length : team.players}</td>
                      <td className="px-4 py-3">
                        {renderActions(team)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={teamColumns.length + 1} className="px-4 py-3 text-center text-gray-500">
                      No teams available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {renderPaginationControls(teamPage, totalTeamPages, setTeamPage)}
        </div>
      );
    } else if (activeTab === 'Manage Players') {
      const totalPlayerPages = Math.ceil(players.length / rowsPerPage);
      const paginatedPlayers = players.slice(playerPage * rowsPerPage, (playerPage + 1) * rowsPerPage);

      return (
        <div className="transition-all duration-200 ease-in-out">
          <div className="mb-4">
            <Button
              onClick={() => setShowAddPlayerModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Player
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {playerColumns.map(col => (
                    <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedPlayers.length > 0 ? (
                  paginatedPlayers.map((player) => (
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{player.name}</td>
                      <td className="px-4 py-3">{player.teamName}</td>
                      <td className="px-4 py-3">
                        {player.federation?.name || 
                         (typeof player.federation === 'object' ? 
                           JSON.stringify(player.federation) : 
                           player.federation)}
                      </td>
                      <td className="px-4 py-3">
                        {typeof player.club === 'object' ? player.club.name : player.club}
                      </td>
                      <td className="px-4 py-3">
                        {Array.isArray(player.games) 
                          ? player.games.map(game => 
                              typeof game === 'object' ? game.stadium : game
                            ).join(', ') 
                          : player.games}
                      </td>
                      <td className="px-4 py-3">
                        {renderPlayerActions(player)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={playerColumns.length} className="px-4 py-3 text-center text-gray-500">
                      No players available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {renderPaginationControls(playerPage, totalPlayerPages, setPlayerPage)}
        </div>
      );
    } else if (activeTab === 'Player Appearance') {
      const filteredPlayers = players.filter(player => {
        return (
          (playerSearchFilters.name ? player.name?.toLowerCase().includes(playerSearchFilters.name.toLowerCase()) : true) &&
          (playerSearchFilters.team ? player.teamName?.toLowerCase().includes(playerSearchFilters.team.toLowerCase()) : true) &&
          (playerSearchFilters.federation ? player.federation?.name?.toLowerCase().includes(playerSearchFilters.federation.toLowerCase()) : true) &&
          (playerSearchFilters.appearances ? player.appearances >= parseInt(playerSearchFilters.appearances) : true)
        );
      });

      return (
        <div className="transition-all duration-200 ease-in-out">
          {/* Search Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Search By</h2>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Player/Staff Name:</label>
                <select
                  value={playerSearchFilters.name}
                  onChange={(e) => setPlayerSearchFilters(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">Select Player/Staff</option>
                  {playerStaffList.map(staff => (
                    <option key={staff.id} value={staff.type}>
                      {staff.type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Team:</label>
                <select
                  value={playerSearchFilters.team}
                  onChange={(e) => setPlayerSearchFilters(prev => ({
                    ...prev,
                    team: e.target.value
                  }))}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">Select Team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.teamName}>
                      {team.teamName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Federation:</label>
                <select
                  value={playerSearchFilters.federation}
                  onChange={(e) => setPlayerSearchFilters(prev => ({
                    ...prev,
                    federation: e.target.value
                  }))}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">Select Federation</option>
                  {federations.map(federation => (
                    <option key={federation.id} value={federation.name}>
                      {federation.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Appearances:</label>
                <input
                  type="number"
                  value={playerSearchFilters.appearances}
                  onChange={(e) => setPlayerSearchFilters(prev => ({
                    ...prev,
                    appearances: e.target.value
                  }))}
                  placeholder="Search by appearances"
                  min="0"
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
          </div>

          {/* Players & Appearances Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name of Player / Staff</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Number of Appearances</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPlayers.length > 0 ? (
                  filteredPlayers.map((player) => (
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{player.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          player.appearances > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {player.appearances} {player.appearances === 1 ? 'Appearance' : 'Appearances'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-4 py-8 text-center text-gray-500">
                      No players found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Manage National Team</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add National Team</span>
          </button>
        </div>

        <div className="mb-6">
          <nav className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {renderContent()}
        </div>

        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedTeamData(null);
          }}
          title={selectedTeamData ? "Edit Team" : "Add National Team"}
        >
          <AddNationalTeamForm
            initialData={selectedTeamData}
            onSubmit={handleAddTeam}
            onCancel={() => {
              setShowAddModal(false);
              setSelectedTeamData(null);
            }}
          />
        </Modal>

        <Modal
          isOpen={showAddPlayerModal}
          onClose={() => setShowAddPlayerModal(false)}
          title="Add National Team Player"
        >
          <form onSubmit={handleAddPlayerSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Player Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter player name"
                required
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Player/Staff <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPlayerStaff}
                onChange={(e) => setSelectedPlayerStaff(e.target.value)}
                className="w-full border rounded-lg p-2"
                required
              >
                <option value="">Select Player/Staff</option>
                {playerStaffList.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Team <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedTeamForPlayer}
                onChange={(e) => {
                  const teamId = parseInt(e.target.value);
                  setSelectedTeamForPlayer(teamId);
                  const team = teams.find(t => t.id === teamId);
                  setAvailableGames(team?.games || []);
                  setSelectedGames([]);
                }}
                className="w-full border rounded-lg p-2"
                required
              >
                <option value="">Select Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.teamName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Club <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="w-full border rounded-lg p-2"
                required
                disabled={!selectedTeamForPlayer}
              >
                <option value="">Select Club</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-md font-medium mb-3">Games</h3>
              {availableGames.length > 0 ? (
                <div className="space-y-2">
                  {availableGames.map((game) => (
                    <div key={game.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        id={`game-${game.id}`}
                        checked={selectedGames.includes(game.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGames(prev => [...prev, game.id]);
                          } else {
                            setSelectedGames(prev => prev.filter(id => id !== game.id));
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <label htmlFor={`game-${game.id}`} className="cursor-pointer">
                          <p className="font-medium">{game.stadium}</p>
                          <p className="text-sm text-gray-500">
                            {game.competition || 'No competition specified'}
                          </p>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No games found</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddPlayerModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Player
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={showPlayerEditModal}
          onClose={() => setShowPlayerEditModal(false)}
          title="Edit Player"
        >
          <form onSubmit={handlePlayerEditSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Player/Staff <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPlayerStaff}
                onChange={(e) => setSelectedPlayerStaff(e.target.value)}
                className="w-full border rounded-lg p-2"
                required
              >
                <option value="">Select Player/Staff</option>
                {playerStaffList.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Team <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedTeamForPlayer}
                onChange={(e) => {
                  const teamId = parseInt(e.target.value);
                  setSelectedTeamForPlayer(teamId);
                  const team = teams.find(t => t.id === teamId);
                  setAvailableGames(team?.games || []);
                  setSelectedGames([]);
                }}
                className="w-full border rounded-lg p-2"
                required
              >
                <option value="">Select Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.teamName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Club <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="w-full border rounded-lg p-2"
                required
                disabled={!selectedTeamForPlayer}
              >
                <option value="">Select Club</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-md font-medium mb-3">Games</h3>
              {availableGames.length > 0 ? (
                <div className="space-y-2">
                  {availableGames.map((game) => (
                    <div key={game.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        id={`game-${game.id}`}
                        checked={selectedGames.includes(game.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGames(prev => [...prev, game.id]);
                          } else {
                            setSelectedGames(prev => prev.filter(id => id !== game.id));
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <label htmlFor={`game-${game.id}`} className="cursor-pointer">
                          <p className="font-medium">{game.stadium}</p>
                          <p className="text-sm text-gray-500">
                            {game.competition || 'No competition specified'}
                          </p>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No games found</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPlayerEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Update Player
              </Button>
            </div>
          </form>
        </Modal>

        <Transition appear show={showPlayerViewDialog} as={Fragment}>
          <Dialog 
            as="div" 
            className="relative z-50" 
            onClose={() => setShowPlayerViewDialog(false)}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <Dialog.Title className="text-xl font-bold">
                      View Player Details
                    </Dialog.Title>
                    <button
                      onClick={() => setShowPlayerViewDialog(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {renderPlayerDetails(selectedPlayerData)}

                  <div className="flex justify-end mt-6 pt-4 border-t">
                    <Button onClick={() => setShowPlayerViewDialog(false)}>
                      Close
                    </Button>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Dialog>
        </Transition>

        <Modal
          isOpen={showPlayerDeleteDialog}
          onClose={() => setShowPlayerDeleteDialog(false)}
          title="Delete Player"
        >
          <div className="space-y-4">
            <p>Are you sure you want to delete this player? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">              <Button variant="outline" onClick={() => setShowPlayerDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmPlayerDelete}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          title="Delete Team"
        >
          <div className="space-y-4">
            <p>Are you sure you want to delete this team? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ErrorBoundary>
  );
}

export default NationalTeams;

