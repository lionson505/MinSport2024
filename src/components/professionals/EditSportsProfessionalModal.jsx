import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import Modal from '../ui/Modal';
import { toast } from 'react-hot-toast';

const EditSportsProfessionalModal = ({ 
  isOpen, 
  onClose, 
  professional, 
  onSave,
  federations = [],
  clubs = [],
  onFederationChange 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    idNumber: '',
    type: '',
    function: '',
    subFunction: '',
    federation: '',
    club: '',
    email: '',
    phone: '',
    status: 'Active'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (professional) {
      setFormData({
        name: professional.name || '',
        dateOfBirth: professional.dateOfBirth || '',
        gender: professional.gender || '',
        nationality: professional.nationality || '',
        idNumber: professional.idNumber || '',
        type: professional.type || '',
        function: professional.function || '',
        subFunction: professional.subFunction || '',
        federation: professional.federation || '',
        club: professional.club || '',
        email: professional.email || '',
        phone: professional.phone || '',
        status: professional.status || 'Active'
      });
    }
  }, [professional]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.name) errors.push('Name is required');
    if (!formData.phone) errors.push('Phone number is required');
    if (!formData.function) errors.push('Function is required');
    if (!formData.nationality) errors.push('Nationality is required');
    
    // Phone number validation
    const phoneRegex = /^\+?[0-9]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.push('Invalid phone number format');
    }

    // Email validation if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Invalid email format');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onSave(formData);
      setShowConfirm(false);
      onClose();
      toast.success('Professional updated successfully');
    } catch (error) {
      toast.error('Failed to update professional');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Edit Sports Professional"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NIDA Information - Readonly */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-medium text-gray-700">ID Information (Non-editable)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <Input
                    value={formData.name}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <Input
                    value={formData.dateOfBirth}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <Input
                    value={formData.gender}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nationality</label>
                  <Input
                    value={formData.nationality}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ID Number</label>
                  <Input
                    value={formData.idNumber}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information - Editable */}
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-medium mb-1">Function</label>
                <select
                  name="function"
                  value={formData.function}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Function</option>
                  <option value="Coach">Coach</option>
                  <option value="Player">Player</option>
                  <option value="Referee">Referee</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Federation</label>
                <select
                  name="federation"
                  value={formData.federation}
                  onChange={onFederationChange}
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
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Update Professional'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Changes"
      >
        <div className="space-y-4">
          <p>Please confirm the following changes:</p>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p><span className="font-semibold">Name:</span> {formData.name}</p>
            <p><span className="font-semibold">Function:</span> {formData.function}</p>
            <p><span className="font-semibold">Status:</span> {formData.status}</p>
            <p><span className="font-semibold">Nationality:</span> {formData.nationality}</p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Confirm Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EditSportsProfessionalModal; 