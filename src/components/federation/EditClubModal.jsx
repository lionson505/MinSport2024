import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

const EditClubModal = ({ isOpen, onClose, club, onSave }) => {
  const [name, setName] = useState('');
  const [federationId, setFederationId] = useState(0);
  const [year, setYear] = useState(0);
  const [logo, setLogo] = useState('');
  const [address, setAddress] = useState('');
  const [division, setDivision] = useState('');
  const [legalRepresentativeName, setLegalRepresentativeName] = useState('');
  const [legalRepresentativeGender, setLegalRepresentativeGender] = useState('Male');
  const [legalRepresentativeEmail, setLegalRepresentativeEmail] = useState('');
  const [legalRepresentativePhone, setLegalRepresentativePhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [federations, setFederations] = useState([]);
  const [isLoadingFederations, setIsLoadingFederations] = useState(true);

  useEffect(() => {
    const fetchFederations = async () => {
      try {
        const response = await axiosInstance.get('/federations');
        setFederations(response.data);
      } catch (err) {
        toast.error('Failed to load federations');
      } finally {
        setIsLoadingFederations(false);
      }
    };

    if (isOpen) {
      fetchFederations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (club) {
      setName(club.name || '');
      setFederationId(club.federationId || 0);
      setYear(club.year || 0);
      setLogo(club.logo || '');
      setAddress(club.address || '');
      setDivision(club.division || '');
      setLegalRepresentativeName(club.legalRepresentativeName || '');
      setLegalRepresentativeGender(club.legalRepresentativeGender || 'Male');
      setLegalRepresentativeEmail(club.legalRepresentativeEmail || '');
      setLegalRepresentativePhone(club.legalRepresentativePhone || '');
    }
  }, [club]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      logo,
      federationId,
      name,
      yearFounded: year, // Note the updated key to match your backend
      address,
      division,
      legalRepresentativeName,
      legalRepresentativeGender,
      legalRepresentativeEmail,
      legalRepresentativePhone,
    };

    try {
      // Use club.id instead of clubId
      await axiosInstance.put(`/clubs/${club.id}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      toast.success('Club updated successfully');

      // Check if onSave is a function and call it
      if (typeof onSave === 'function') {
        onSave(); // Call the provided onSave function
      } else {
        console.warn('onSave is not a function');
      }

      onClose(); // Close the modal after successful save
    } catch (err) {
      toast.error('Failed to update club');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-lg w-full overflow-y-auto" style={{ maxHeight: '90vh' }}>
        <h2 className="text-xl font-semibold mb-4">Edit Club</h2>

        <form onSubmit={handleSubmit}>
          {/* Club Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Club Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="Enter club name"
            />
          </div>

          {/* Federation */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Federation</label>
            <select
              value={federationId}
              onChange={(e) => setFederationId(Number(e.target.value))}
              required
              className="w-full p-2 border rounded"
              disabled={isLoadingFederations}
            >
              <option value={0}>Select Federation</option>
              {isLoadingFederations ? (
                <option disabled>Loading federations...</option>
              ) : (
                federations.map((federation) => (
                  <option key={federation.id} value={federation.id}>
                    {federation.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Year Founded */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Year Founded</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
              className="w-full p-2 border rounded"
            >
              <option value={0}>Select Year</option>
              {[...Array(10)].map((_, idx) => {
                const optionYear = 2020 + idx;
                return (
                  <option key={optionYear} value={optionYear}>
                    {optionYear}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Logo URL */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Logo URL</label>
            <input
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter logo URL"
            />
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="Enter address"
            />
          </div>

          {/* Division */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Division</label>
            <input
              type="text"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="Enter division"
            />
          </div>

          {/* Legal Representative Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Legal Representative Name</label>
            <input
              type="text"
              value={legalRepresentativeName}
              onChange={(e) => setLegalRepresentativeName(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="Enter legal representative's name"
            />
          </div>

          {/* Legal Representative Gender */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Legal Representative Gender</label>
            <select
              value={legalRepresentativeGender}
              onChange={(e) => setLegalRepresentativeGender(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Legal Representative Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Legal Representative Email</label>
            <input
              type="email"
              value={legalRepresentativeEmail}
              onChange={(e) => setLegalRepresentativeEmail(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="Enter legal representative's email"
            />
          </div>


          {/* Legal Representative Phone */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Legal Representative Phone</label>
            <input
              type="tel"
              value={legalRepresentativePhone}
              onChange={(e) => setLegalRepresentativePhone(e.target.value)}
              required
              className="w-full p-2 border rounded"
              placeholder="Enter legal representative's phone"
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-end">
            <Button onClick={onClose} type="button" className="mr-2">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClubModal;
