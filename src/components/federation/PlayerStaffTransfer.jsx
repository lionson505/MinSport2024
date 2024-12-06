// PlayerStaffTransfer.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import axiosInstance from '../../utils/axiosInstance'; // Assuming this is your custom Axios instance

const PlayerStaffTransfer = () => {
  const [federations, setFederations] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTransferFederation, setSelectedTransferFederation] = useState('');
  const [selectedFromClub, setSelectedFromClub] = useState('');
  const [selectedTransferPlayer, setSelectedTransferPlayer] = useState('');
  const [selectedToClub, setSelectedToClub] = useState('');
  const [transferMonth, setTransferMonth] = useState('');
  const [transferYear, setTransferYear] = useState('');
  const [transferComments, setTransferComments] = useState('');

  useEffect(() => {
    // Fetch federations from the API
    const fetchFederations = async () => {
      try {
        const response = await axiosInstance.get('/federations');
        setFederations(response.data);
      } catch (error) {
        console.error('Failed to fetch federations:', error);
      }
    };

    // Fetch clubs from the API
    const fetchClubs = async () => {
      try {
        const response = await axiosInstance.get('/clubs');
        setClubs(response.data);
      } catch (error) {
        console.error('Failed to fetch clubs:', error);
      }
    };

    // Fetch all players and staff from the API
    const fetchPlayers = async () => {
      try {
        const response = await axiosInstance.get('/player-staff');
        setPlayers(response.data);
      } catch (error) {
        console.error('Failed to fetch players and staff:', error);
      }
    };

    fetchFederations();
    fetchClubs();
    fetchPlayers();
  }, []);

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic
    console.log({
      selectedTransferFederation,
      selectedFromClub,
      selectedTransferPlayer,
      selectedToClub,
      transferMonth,
      transferYear,
      transferComments,
    });
  };

  const handleTransferFederationChange = (value) => {
    setSelectedTransferFederation(value);
  };

  const handleFromClubChange = (value) => {
    setSelectedFromClub(value);
    setSelectedToClub('');
  };

  const handleToClubChange = (value) => {
    setSelectedToClub(value);
  };

  return (
    <form onSubmit={handleTransferSubmit} className="space-y-6">
      {/* Federation Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Federation
        </label>
        <select
          className="w-full border rounded-lg px-3 py-2"
          value={selectedTransferFederation}
          onChange={(e) => handleTransferFederationChange(e.target.value)}
          required
        >
          <option value="">Select Federation</option>
          {federations.map((fed) => (
            <option key={fed.id} value={fed.id}>
              {fed.name}
            </option>
          ))}
        </select>
      </div>

      {/* Source Club Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Club From
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={selectedFromClub}
            onChange={(e) => handleFromClubChange(e.target.value)}
            required
          >
            <option value="">Select Club</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </div>

        {/* Player/Staff Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Player/Staff
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={selectedTransferPlayer}
            onChange={(e) => setSelectedTransferPlayer(e.target.value)}
            required
          >
            <option value="">Select Player/Staff</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Destination Club and Date */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Club To
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={selectedToClub}
            onChange={(e) => handleToClubChange(e.target.value)}
            required
          >
            <option value="">Select Club</option>
            {clubs
              .filter((club) => club.id.toString() !== selectedFromClub)
              .map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Month
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={transferMonth}
            onChange={(e) => setTransferMonth(e.target.value)}
            required
          >
            <option value="">Month</option>
            {Array.from({ length: 12 }, (_, i) => {
              const month = i + 1;
              return (
                <option key={month} value={month}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={transferYear}
            onChange={(e) => setTransferYear(e.target.value)}
            required
          >
            <option value="">Year</option>
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Comments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Comments
        </label>
        <textarea
          className="w-full border rounded-lg px-3 py-2"
          rows={4}
          value={transferComments}
          onChange={(e) => setTransferComments(e.target.value)}
          placeholder="Enter any additional comments about the transfer..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          Process Transfer
        </Button>
      </div>
    </form>
  );
};

export default PlayerStaffTransfer;
