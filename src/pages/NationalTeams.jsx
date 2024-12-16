import React, { useState, useEffect, Fragment } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Plus, Eye, Pencil, Trash2, X } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import AddNationalTeamForm from '../components/forms/AddNationalTeamForm';
import toast from 'react-hot-toast';
import PrintButton from '../components/reusable/Print';

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
    club: ''
  });

  const [teamPage, setTeamPage] = useState(0);
  const [playerPage, setPlayerPage] = useState(0);
  const rowsPerPage = 5;

  const tabs = ['Manage National Teams', 'Manage Players', 'Player Appearance'];

  const teamColumns = [
    { key: 'id', header: 'ID' },
    { key: 'teamName', header: 'TEAM NAME' },
    { key: 'month', header: 'MONTH' },
    { key: 'teamYear', header: 'Year' },
    { key: 'federation', header: 'FEDERATION' },
    { key: 'players', header: 'PLAYERS' }
  ];

  const playerColumns = [
    { key: 'name', header: 'Player Name' , class: ""},
    { key: 'teamName', header: 'Team', class: "" },
    { key: 'federation', header: 'Federation', class: ""},
    { key: 'club', header: 'Club' , class: ""},
    { key: 'games', header: 'Games' , class: ""},
    { key: 'actions', header: 'Actions', class: "operation" }
  ];

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [teamSearchFilters, setTeamSearchFilters] = useState({
    teamName: '',
    month: '',
    year: '',
    federation: ''
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [teamResponse, nationalTeamPlayerStaffResponse, clubResponse, playerStaffResponse, federationResponse] = await Promise.all([
          axiosInstance.get('/national-teams'),
          axiosInstance.get('/national-team-player-staff'),
          axiosInstance.get('/clubs'),
          axiosInstance.get('/player-staff'),
          axiosInstance.get('/federations'),
        ]);

        // Map player staff data to national team player staff
        const enrichedPlayers = await Promise.all(
          nationalTeamPlayerStaffResponse.data.map(async (ntps) => {
            const playerStaff = playerStaffResponse.data.find(ps => ps.id === ntps.playerStaffId);
            const team = teamResponse.data.find(t => t.id === ntps.teamId);
            const club = clubResponse.data.find(c => c.id === ntps.clubId);
            const federation = federationResponse.data.find(f => f.id === ntps.federationId);

            return {
              ...ntps,
              firstName: playerStaff?.firstName,
              lastName: playerStaff?.lastName,
              teamName: team?.teamName,
              federation: federation,
              club: club,
            };
          })
        );

        setTeams(teamResponse.data);
        setPlayers(enrichedPlayers);
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
  }, [refreshTrigger]);

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
          teamYear: 'Active'
        });
        setTeams(prev => [...prev, response.data]);
        toast.success('Team added successfully');
      }
      setShowAddModal(false);
      setSelectedTeamData(null);
      setRefreshTrigger(prev => prev + 1);
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
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete team');
    }
  };

  const handleAddPlayerSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const federationId = parseInt(formData.get('federationId'));

    const playerData = {
      federationId: federationId,
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
      setRefreshTrigger(prev => prev + 1);
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
      setRefreshTrigger(prev => prev + 1);
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
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete player');
    }
  };

  const renderTeamDetails = (team) => {
    if (!team) return null;
  
    const teamPlayers = players.filter(player => player.teamId === team.id);
  
    const details = [
      { label: 'Team Name', value: team.teamName },
      { label: 'Month', value: team.month },
      { label: 'Year', value: team.teamYear },
      { label: 'Federation', value: team.federation.name || team.federation },
      { label: 'Players', value: teamPlayers.length }
    ];
  
    return (
      <div className="space-y-4">
        {details.map((detail, index) => (
          <div key={index} className="grid grid-cols-2 gap-4">
            <span className="text-gray-500">{detail.label}:</span>
            <span className="font-medium">{detail.value}</span>
          </div>
        ))}
        <div>
          <h3 className="text-lg font-medium mt-4">Players</h3>
          {teamPlayers.length > 0 ? (
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Games</th>
                </tr>
              </thead>
              <tbody>
                {teamPlayers.map(player => (
                  <tr key={player.id}>
                    <td className="py-2 px-4 border-b border-gray-200">{player.firstName} {player.lastName}</td>
                    <td className="py-2 px-4 border-b border-gray-200">{player.club?.name || player.club}</td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {Array.isArray(player.games) ? player.games.map(game => game.stadium).join(', ') : player.games}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No players found for this team.</p>
          )}
        </div>
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
        <Pencil className="h-4 w-4 text-green-600" />
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
        <Pencil className="h-4 w-4 text-green-600" />
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
      const filteredTeams = teams.filter(team => {
        return (
          (!teamSearchFilters.teamName || team.teamName.toLowerCase().includes(teamSearchFilters.teamName.toLowerCase())) &&
          (!teamSearchFilters.month || team.teamMonth.toLowerCase().includes(teamSearchFilters.month.toLowerCase())) &&
          (!teamSearchFilters.year || team.teamYear.toLowerCase().includes(teamSearchFilters.year.toLowerCase())) &&
          (!teamSearchFilters.federation || team.federation.name.toLowerCase().includes(teamSearchFilters.federation.toLowerCase()))
        );
      });

      const totalTeamPages = Math.ceil(filteredTeams.length / rowsPerPage);
      const paginatedTeams = filteredTeams.slice(teamPage * rowsPerPage, (teamPage + 1) * rowsPerPage);

      return (
        <div className="transition-all duration-200 ease-in-out">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Team Name:</label>
                <input
                  type="text"
                  value={teamSearchFilters.teamName}
                  onChange={(e) => setTeamSearchFilters(prev => ({
                    ...prev,
                    teamName: e.target.value
                  }))}
                  className="w-full border rounded-lg p-2"
                  placeholder="Search by team name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Month:</label>
                <input
                  type="text"
                  value={teamSearchFilters.month}
                  onChange={(e) => setTeamSearchFilters(prev => ({
                    ...prev,
                    month: e.target.value
                  }))}
                  className="w-full border rounded-lg p-2"
                  placeholder="Search by month"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year:</label>
                <select
                  value={teamSearchFilters.year}
                  onChange={(e) => setTeamSearchFilters(prev => ({
                    ...prev,
                    year: e.target.value
                  }))}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Federation:</label>
                <select
                  value={teamSearchFilters.federation}
                  onChange={(e) => setTeamSearchFilters(prev => ({
                    ...prev,
                    federation: e.target.value
                  }))}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">All Federations</option>
                  {federations.map(federation => (
                    <option key={federation.id} value={federation.name}>
                      {federation.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <PrintButton title='TEAM MANAGEMENT REPORT'>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {teamColumns.map(col => (
                    <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      {col.header}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs operation font-medium text-gray-500">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{team.id}</td>
                    <td className="px-4 py-3">{team.teamName}</td>
                    <td className="px-4 py-3">{team.teamMonth}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        team.teamYear === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {team.teamYear}
                      </span>
                    </td>
                    <td className="px-4 py-3">{team.federation.name || team.federation}</td>
                  <td className="px-4 py-3">
  {Array.isArray(players)
    ? players.filter(player => player.teamId === team.id).length
    : 0}
</td>
<td className="px-4 py-3 operation">
                      <div className="flex items-center space-x-2 ">
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
                          <Pencil className="h-4 w-4 text-green-600" />
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </PrintButton>
          </div>
        </div>
      );
    } else if (activeTab === 'Manage Players') {
      const filteredPlayers = players.filter(player => {
        const playerFullName = `${player.firstName} ${player.lastName}`.toLowerCase();
        return (
          (!playerSearchFilters.name || playerFullName.includes(playerSearchFilters.name.toLowerCase())) &&
          (!playerSearchFilters.team || player.teamName?.toLowerCase().includes(playerSearchFilters.team.toLowerCase())) &&
          (!playerSearchFilters.federation || player.federation?.name?.toLowerCase().includes(playerSearchFilters.federation.toLowerCase())) &&
          (!playerSearchFilters.club || (typeof player.club === 'object' ? player.club.name : player.club)?.toLowerCase().includes(playerSearchFilters.club.toLowerCase()))
        );
      });

      const totalPlayerPages = Math.ceil(filteredPlayers.length / rowsPerPage);
      const paginatedPlayers = filteredPlayers.slice(playerPage * rowsPerPage, (playerPage + 1) * rowsPerPage);

      return (
        <div className="transition-all duration-200 ease-in-out">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Player Name:</label>
                <select
                  value={playerSearchFilters.name}
                  onChange={(e) => setPlayerSearchFilters(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">All Players</option>
                  {playerStaffList.map(staff => (
                    <option key={staff.id} value={`${staff.firstName} ${staff.lastName}`}>
                      {staff.firstName} {staff.lastName}
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
                  <option value="">All Teams</option>
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
                  <option value="">All Federations</option>
                  {federations.map(federation => (
                    <option key={federation.id} value={federation.name}>
                      {federation.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Club:</label>
                <select
                  value={playerSearchFilters.club}
                  onChange={(e) => setPlayerSearchFilters(prev => ({
                    ...prev,
                    club: e.target.value
                  }))}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">All Clubs</option>
                  {clubs.map(club => (
                    <option key={club.id} value={club.name}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

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
            <PrintButton>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {playerColumns.map(col => (
                    <th key={col.key} className={`${col.class} px-4 py-3 text-left text-xs font-medium text-gray-500`}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedPlayers.length > 0 ? (
                  paginatedPlayers.map((player) => {
                    console.log('Player data:', player);
                    return (
                      <tr key={player.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {player?.firstName && player?.lastName 
                            ? `${player.firstName} ${player.lastName}`
                            : player.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3">{player.teamName}</td>
                        <td className="px-4 py-3">
                          {player.federation?.name || 'N/A'}
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
                        <td className="px-4 py-3 operation">
                          {renderPlayerActions(player)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={playerColumns.length} className="px-4 py-3 text-center text-gray-500">
                      No players available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </PrintButton>
          </div>
        </div>
      );
    } else if (activeTab === 'Player Appearance') {
      const filteredPlayers = players.filter(player => {
        const playerFullName = `${player.firstName} ${player.lastName}`.toLowerCase();
        return (
          (playerSearchFilters.name ? playerFullName.includes(playerSearchFilters.name.toLowerCase()) : true) &&
          (playerSearchFilters.team ? player.teamName?.toLowerCase().includes(playerSearchFilters.team.toLowerCase()) : true) &&
          (playerSearchFilters.federation ? player.federation?.name?.toLowerCase().includes(playerSearchFilters.federation.toLowerCase()) : true) &&
          (playerSearchFilters.appearances ? (player.games?.length || 0) >= parseInt(playerSearchFilters.appearances) : true)
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
                    <option key={staff.id} value={`${staff.firstName} ${staff.lastName}`}>
                      {staff.firstName} {staff.lastName}
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
                      <td className="px-4 py-3">{player.firstName} {player.lastName}</td>
                      <td className="px-4 py-3">
  <span className={`px-2 py-1 rounded-full text-xs ${
    player.teamId ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }`}>
    {teams.filter(team => team.id === player.teamId).length} {teams.filter(team => team.id === player.teamId).length === 1 ? 'Team' : 'Teams'}
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
            onCancel={() => {
              setShowAddModal(false);
              setSelectedTeamData(null);
            }}
            onSuccess={() => setRefreshTrigger(prev => prev + 1)}
          />
        </Modal>

        <Modal
          isOpen={showAddPlayerModal}
          onClose={() => setShowAddPlayerModal(false)}
          title="Add National Team Player"
        >
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await handleAddPlayerSubmit(e);
                toast.success('Player added successfully');
                setShowAddPlayerModal(false);
              } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to add player');
              }
            }} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Federation <span className="text-red-500">*</span>
                </label>
                <select
                  name="federationId"
                  className="w-full border rounded-lg p-2"
                  required
                >
                  <option value="">Select Federation</option>
                  {federations.map(federation => (
                    <option key={federation.id} value={federation.id}>
                      {federation.name}
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
                      {`${staff.firstName} ${staff.lastName}`}
                    </option>
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
          </div>
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
                    {staff.firstName} {staff.lastName}
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

        <Transition appear show={isViewModalOpen} as={Fragment}>
          <Dialog 
            as="div" 
            className="relative z-50" 
            onClose={() => setIsViewModalOpen(false)}
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
                      View Team Details
                    </Dialog.Title>
                    <button
                      onClick={() => setIsViewModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {renderTeamDetails(viewTeam)}

                  <div className="flex justify-end mt-6 pt-4 border-t">
                    <Button onClick={() => setIsViewModalOpen(false)}>
                      Close
                    </Button>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </ErrorBoundary>
  );
}

export default NationalTeams;

