import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

const AddNationalTeamForm = ({ initialData = null, onCancel }) => {
  const [formData, setFormData] = useState({
    teamName: initialData?.teamName || 'Senior Men\'s National Team',
    teamMonth: initialData?.teamMonth || 'JUN',
    teamYear: initialData?.teamYear || 2024,
    federationId: initialData?.federationId || 1,
    competition: initialData?.competition || 'World Cup Qualifiers',
    city: initialData?.city || 'Kigali',
    country: initialData?.country || 'Rwanda',
    games: [{ stadium: 'Amahoro National Stadium' }]
  });

  const [federations, setFederations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFederations = async () => {
      try {
        const response = await axiosInstance.get('/federations');
        setFederations(response.data);
      } catch (error) {
        console.error('Error fetching federations:', error);
      }
    };

    fetchFederations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'teamYear' || name === 'federationId' ? parseInt(value, 10) : value
    }));
  };

  const handleGamesChange = (index, e) => {
    const { name, value } = e.target;
    const updatedGames = [...formData.games];
    updatedGames[index] = { ...updatedGames[index], [name]: value };
    setFormData((prevData) => ({
      ...prevData,
      games: updatedGames
    }));
  };

  const validateFormData = () => {
    if (!formData.teamName || !formData.city || !formData.country) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateFormData()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      let response;
      if (initialData && initialData.id) {
        response = await axiosInstance.put(`/national-teams/${initialData.id}`, formData);
        toast.success('Team updated successfully!');
      } else {
        response = await axiosInstance.post('/national-teams', formData);
        toast.success('Team added successfully!');
      }
      onCancel();
      window.location.reload();
    } catch (error) {
      toast.error('An error occurred while submitting the form. Please try again.');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg" style={{ height: '80vh', overflowY: 'auto' }}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="teamName"
            value={formData.teamName}
            onChange={handleChange}
            required
            placeholder="Enter team name"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Month <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="teamMonth"
            value={formData.teamMonth}
            onChange={handleChange}
            required
            placeholder="Enter team month"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Year <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="teamYear"
            value={formData.teamYear}
            onChange={handleChange}
            required
            placeholder="Enter team year"
            min="2000"
            max="2100"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Federation <span className="text-red-500">*</span>
          </label>
          <select
            name="federationId"
            value={formData.federationId}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Competition <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="competition"
            value={formData.competition}
            onChange={handleChange}
            required
            placeholder="Enter competition name"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            placeholder="Enter city"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            placeholder="Enter country"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Games and Stadiums</h3>
            <button
              type="button"
              onClick={() => setFormData((prevData) => ({
                ...prevData,
                games: [...prevData.games, { stadium: '' }]
              }))}
              className="flex items-center gap-2 border border-gray-300 rounded-lg p-2 text-blue-600 hover:bg-blue-50"
            >
              <span className="h-4 w-4">+</span>
              Add Game
            </button>
          </div>

          <div className="space-y-3">
            {formData.games.map((game, index) => (
              <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stadium <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="stadium"
                        value={game.stadium}
                        onChange={(e) => handleGamesChange(index, e)}
                        required
                        placeholder="Enter stadium name"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {formData.games.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setFormData((prevData) => ({
                            ...prevData,
                            games: prevData.games.filter((_, i) => i !== index)
                          }))}
                          className="text-red-600 hover:text-red-700"
                        >
                          <span className="h-4 w-4">🗑️</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="border border-gray-300 rounded-lg p-2 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2"
          >
            {initialData ? 'Update Team' : 'Add Team'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNationalTeamForm;
