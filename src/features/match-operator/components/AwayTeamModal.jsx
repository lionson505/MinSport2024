import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal'; // Assuming you have a reusable Modal component
import toast from 'react-hot-toast';

export function AwayTeamModal({ isOpen, onClose, onSave, teamToEdit }) {
  const [newTeam, setNewTeam] = useState({ teamName: '', players: {} });
  const [playerCount, setPlayerCount] = useState(1);

  // Update state when teamToEdit changes
  useEffect(() => {
    if (teamToEdit) {
      setNewTeam(teamToEdit);
      setPlayerCount(Object.keys(teamToEdit.players).length || 1);
    } else {
      setNewTeam({ teamName: '', players: {} });
      setPlayerCount(1);
    }
  }, [teamToEdit]);

  const handleAddPlayer = () => {
    setPlayerCount(playerCount + 1);
  };

  const handlePlayerChange = (index, value) => {
    setNewTeam((prev) => ({
      ...prev,
      players: { ...prev.players, [`player${index}`]: value },
    }));
  };

  const handleTeamNameChange = (e) => {
    setNewTeam((prev) => ({ ...prev, teamName: e.target.value }));
  };

  const handleRemovePlayer = (index) => {
    setNewTeam((prev) => {
      const updatedPlayers = { ...prev.players };
      delete updatedPlayers[`player${index}`];
      return { ...prev, players: updatedPlayers };
    });
    setPlayerCount(playerCount - 1);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!newTeam.teamName) {
      toast.error('Team name is required.');
      return;
    }
    if (Object.keys(newTeam.players).length === 0) {
      toast.error('At least one player is required.');
      return;
    }
    onSave(newTeam);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4">{teamToEdit ? 'Edit Away Team' : 'Add New Away Team'}</h2>
      <form onSubmit={handleFormSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Team Name</label>
          <input
            type="text"
            value={newTeam.teamName}
            onChange={handleTeamNameChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Players</label>
          {Array.from({ length: playerCount }).map((_, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                placeholder={`Player ${index + 1}`}
                value={newTeam.players[`player${index + 1}`] || ''}
                onChange={(e) => handlePlayerChange(index + 1, e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                required
              />
              <Button
                onClick={() => handleRemovePlayer(index + 1)}
                type="button"
                className="ml-2 bg-red-600 text-white px-2 py-1 rounded-lg"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button onClick={handleAddPlayer} type="button" className="mt-2 bg-green-600 text-white px-2 py-1 rounded-lg">
            <span>Add Player</span>
          </Button>
        </div>
        <Button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
          {teamToEdit ? 'Update Team' : 'Save Team'}
        </Button>
      </form>
    </Modal>
  );
}