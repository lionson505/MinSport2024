import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import Modal from '../ui/Modal';

const EditPlayerModal = ({ isOpen, onClose, player, onSave, federations, clubs, onFederationChange }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    federation: '',
    club: '',
    dateOfBirth: '',
    nationality: '',
    position: '',
    jerseyNumber: ''
  });

  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name || '',
        type: player.type || '',
        federation: player.federation || '',
        club: player.club || '',
        dateOfBirth: player.dateOfBirth || '',
        nationality: player.nationality || '',
        position: player.position || '',
        jerseyNumber: player.jerseyNumber || ''
      });
    }
  }, [player]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFederationChange = (e) => {
    const federationId = e.target.value;
    setFormData(prev => ({
      ...prev,
      federation: federationId,
      club: ''
    }));
    onFederationChange(federationId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Player/Staff"
    >
      <div className="max-h-[70vh] overflow-y-auto pr-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select Type</option>
                <option value="Player">Player</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Federation</label>
              <select
                name="federation"
                value={formData.federation}
                onChange={handleFederationChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select Federation</option>
                {federations.map(fed => (
                  <option key={fed.id} value={fed.id}>{fed.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Club</label>
              <select
                name="club"
                value={formData.club}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
                disabled={!formData.federation}
              >
                <option value="">Select Club</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <Input
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nationality</label>
              <Input
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Position/Role</label>
              <Input
                name="position"
                value={formData.position}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jersey Number</label>
              <Input
                name="jerseyNumber"
                value={formData.jerseyNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditPlayerModal; 