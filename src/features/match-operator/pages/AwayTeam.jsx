import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import { Plus, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import toast from 'react-hot-toast';
import { AwayTeamModal } from '../components/AwayTeamModal';
import { Modal } from '../../../components/ui/Modal';

function AwayTeam() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [isViewPlayersModalOpen, setIsViewPlayersModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get('/away-teams');
        setTeams(response.data);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load data.");
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleViewPlayers = (team) => {
    setSelectedTeam(team);
    setIsViewPlayersModalOpen(true);
  };

  const closeViewPlayersModal = () => {
    setSelectedTeam(null);
    setIsViewPlayersModalOpen(false);
  };

  const openAddTeamModal = () => {
    setIsAddTeamModalOpen(true);
    setTeamToEdit(null);
  };

  const openEditTeamModal = (team) => {
    setIsAddTeamModalOpen(true);
    setTeamToEdit(team);
  };

  const closeAddTeamModal = () => {
    setIsAddTeamModalOpen(false);
    setTeamToEdit(null);
  };

  const handleSaveTeam = async (newTeam) => {
    try {
      if (teamToEdit) {
        const response = await axiosInstance.put(`/away-teams/${teamToEdit.id}`, newTeam);
        const updatedTeams = teams.map((team) =>
          team.id === teamToEdit.id ? response.data : team
        );
        setTeams(updatedTeams);
        toast.success('Team updated successfully!');
      } else {
        const response = await axiosInstance.post('/away-teams', newTeam);
        setTeams([...teams, response.data]);
        toast.success('New team added successfully!');
      }
    } catch (error) {
      toast.error('Failed to save team.');
    } finally {
      closeAddTeamModal();
    }
  };

  const openDeleteModal = (team) => {
    setIsDeleteModalOpen(true);
    setTeamToDelete(team);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTeamToDelete(null);
  };

  const handleDeleteTeam = async () => {
    try {
      await axiosInstance.delete(`/away-teams/${teamToDelete.id}`);
      const updatedTeams = teams.filter((team) => team.id !== teamToDelete.id);
      setTeams(updatedTeams);
      toast.success('Team deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete team.');
    } finally {
      closeDeleteModal();
    }
  };

  if (loading) {
    return (
      <div className="flex animate-spin justify-center items-center h-screen">
        <Loader2 />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Manage Away Teams</h1>
        <Button
          onClick={openAddTeamModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Away Team</span>
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Team Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{team.teamName}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewPlayers(team)}
                      className="p-1 h-7 w-7"
                      title="View Players"
                    >
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditTeamModal(team)}
                      className="p-1 h-7 w-7"
                      title="Edit Team"
                    >
                      <Pencil className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openDeleteModal(team)}
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
      </div>

      <Modal isOpen={isViewPlayersModalOpen} onClose={closeViewPlayersModal}>
        <h2 className="text-xl font-semibold mb-4">Players of {selectedTeam?.teamName}</h2>
        <ul>
          {selectedTeam?.players && Object.entries(selectedTeam.players).map(([key, player]) => (
            <li key={key} className="mb-2">{player}</li>
          ))}
        </ul>
      </Modal>

      <AwayTeamModal
        isOpen={isAddTeamModalOpen}
        onClose={closeAddTeamModal}
        onSave={handleSaveTeam}
        teamToEdit={teamToEdit}
      />

      {isDeleteModalOpen && (
        <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
          <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
          <p>Are you sure you want to delete the team "{teamToDelete?.teamName}"?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={closeDeleteModal} className="bg-gray-300 text-black px-4 py-2 rounded-lg">
              Cancel
            </Button>
            <Button onClick={handleDeleteTeam} className="bg-red-600 text-white px-4 py-2 rounded-lg">
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AwayTeam; 