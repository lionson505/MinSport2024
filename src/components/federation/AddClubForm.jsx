import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

const AddClubForm = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [federationId, setFederationId] = useState(0);
  const [yearFounded, setYearFounded] = useState(0);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = {
      logo: logo,
      federationId: federationId,
      name: name,
      yearFounded: yearFounded,
      address: address,
      division: division,
      legalRepresentativeName: legalRepresentativeName,
      legalRepresentativeGender: legalRepresentativeGender,
      legalRepresentativeEmail: legalRepresentativeEmail,
      legalRepresentativePhone: legalRepresentativePhone,
    };

    try {
      await axiosInstance.post('/clubs', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast.success('Club added successfully');
      window.location.reload(); // Reload the page
    } catch (err) {
      toast.error('Failed to add club');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file.name); // This maintains the same logic of storing just the filename
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl w-full overflow-y-auto" style={{ maxHeight: '90vh' }}>
        <h2 className="text-xl font-semibold mb-4">Add New Club</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Club Information Section */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium mb-3">Club Information</h3>
            <div className="grid grid-cols-2 gap-4">
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
                  value={yearFounded}
                  onChange={(e) => setYearFounded(Number(e.target.value))}
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
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Logo URL</label>
                <input
                  type="file"
                  onChange={handleLogoChange}
                  className="w-full p-2 border rounded"
                  accept="image/*"
                />
                {logo && <p className="mt-1 text-sm text-gray-500">Selected file: {logo}</p>}
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
            </div>
          </div>

          {/* Legal Representative Section */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-medium mb-3">Legal Representative</h3>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* Action Buttons */}
          <div className="col-span-2 flex justify-end gap-2 mt-6">
            <Button onClick={onClose} type="button" variant="outline">
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

export default AddClubForm;
