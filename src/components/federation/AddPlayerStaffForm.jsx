import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { countries } from '../../data/countries';

const maritalStatusOptions = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'WIDOWED', label: 'Widowed' },
];

const educationLevelOptions = [
  { value: 'PRIMARY', label: 'Primary Education' },
  { value: 'SECONDARY', label: 'Secondary Education' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'BACHELORS', label: 'Bachelor\'s Degree' },
  { value: 'MASTERS', label: 'Master\'s Degree' },
  { value: 'PHD', label: 'PhD' },
  { value: 'OTHER', label: 'Other' }
];

const AddPlayerStaffForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    type: initialData.type || 'PLAYER',
    idPassportNo: initialData.idPassportNo || '',
    passportPicture: initialData.passportPicture || '',
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    dateOfBirth: initialData.dateOfBirth || '',
    maritalStatus: initialData.maritalStatus || '',
    placeOfResidence: initialData.placeOfResidence || '',
    discipline: initialData.discipline || '',
    nationality: initialData.nationality || '',
    otherNationality: initialData.otherNationality || '',
    positionInClub: initialData.positionInClub || '',
    federationId: initialData.federationId || 0,
    currentClubId: initialData.currentClubId || 0,
    originClubId: initialData.originClubId || 0,
    joinDate: initialData.joinDate || '',
    placeOfBirth: initialData.placeOfBirth || '',
    fitnessStatus: initialData.fitnessStatus || '',
    levelOfEducation: initialData.levelOfEducation || '',
    cvResume: initialData.cvResume || '',
  });

  const [federations, setFederations] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [idError, setIdError] = useState('');
  const [isLoadingID, setIsLoadingID] = useState(false);
  const [idData, setIdData] = useState(null);
  const [idType, setIdType] = useState('passport');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [federationResponse, clubResponse, disciplineResponse] = await Promise.all([
          axiosInstance.get('/federations', { params: { fields: 'id,name' } }),
          axiosInstance.get('/clubs'), // Adjust endpoint as necessary
          axiosInstance.get('/disciplines') // Adjust endpoint as necessary
        ]);

        setFederations(federationResponse.data.map(fed => ({ value: fed.id, label: fed.name })));
        setClubs(clubResponse.data.map(club => ({ value: club.id, label: club.name })));
        setDisciplines(disciplineResponse.data.map(discipline => ({ value: discipline.id, label: discipline.name })));
      } catch (error) {
        console.error('Failed to fetch options:', error);
      }
    };

    fetchData();
  }, []);

  const handleIDLookup = async () => {
    setIdError('');
    const idNumber = formData.idPassportNo;

    // Validate ID format
    if (idType === 'nid') {
      if (!/^\d{16}$/.test(idNumber)) {
        setIdError('National ID must be exactly 16 digits');
        return;
      }
    } else {
      // Passport validation
      if (!/^[A-Z0-9]{6,9}$/.test(idNumber)) {
        setIdError('Invalid passport format');
        return;
      }
    }

    setIsLoadingID(true);
    try {
      // Simulate ID API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Sample response
      const response = {
        documentNumber: formData.idPassportNo,
        firstName: "Jean",
        lastName: "Baptiste",
        dateOfBirth: "1995-02-19",
        nationality: "Rwandan",
        placeOfBirth: "Kigali",
      };

      setIdData(response);
      setFormData(prevState => ({
        ...prevState,
        firstName: response.firstName,
        lastName: response.lastName,
        dateOfBirth: response.dateOfBirth,
        nationality: response.nationality,
        placeOfBirth: response.placeOfBirth,
      }));
      toast.success(`${idType === 'nid' ? 'National ID' : 'Passport'} verified successfully`);
    } catch (error) {
      toast.error(`Failed to verify ${idType === 'nid' ? 'National ID' : 'Passport'}`);
      setIdData(null);
    } finally {
      setIsLoadingID(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name.includes('Id') ? parseInt(value, 10) : value // Ensure IDs are numbers
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format dates to ISO string
      const formattedData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        joinDate: formData.joinDate ? new Date(formData.joinDate).toISOString() : null,
      };

      // Remove any empty string values
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === '') {
          formattedData[key] = null;
        }
      });

      console.log('Submitting formatted data:', formattedData);
      await onSubmit(formattedData);

      // Update form data with the submitted data
      setFormData(formattedData);
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save data. Please try again.';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          >
            <option value="PLAYER">Player</option>
            <option value="STAFF">Staff</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ID Type</label>
          <select
            value={idType}
            onChange={(e) => {
              setIdType(e.target.value);
              setIdError('');
              setFormData(prev => ({ ...prev, idPassportNo: '' }));
            }}
            className="mt-1 block w-full border rounded-md"
          >
            <option value="passport">Passport</option>
            <option value="nid">National ID</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {idType === 'nid' ? 'National ID' : 'Passport Number'}
          </label>
          <input
            type="text"
            name="idPassportNo"
            value={formData.idPassportNo}
            onChange={(e) => {
              handleChange(e);
              setIdError('');
            }}
            placeholder={idType === 'nid' ? 'Enter 16 digit National ID' : 'Enter Passport Number'}
            className={`mt-1 block w-full border rounded-md ${idError ? 'border-red-500' : ''}`}
          />
          {idError && <p className="text-sm text-red-500 mt-1">{idError}</p>}
        </div>
        <div>
          <Button
            type="button"
            onClick={handleIDLookup}
            disabled={isLoadingID || !formData.idPassportNo}
          >
            {isLoadingID ? 'Verifying...' : `Verify ${idType === 'nid' ? 'National ID' : 'Passport'}`}
          </Button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Passport Picture</label>
          <input
            type="file"
            accept="image/*"
            name="passportPicture"
            className="mt-1 block w-full border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Marital Status</label>
          <select
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          >
            {maritalStatusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Place of Residence</label>
          <input
            type="text"
            name="placeOfResidence"
            value={formData.placeOfResidence}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Discipline</label>
          <select
            name="discipline"
            value={formData.discipline}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          >
            {disciplines.map((discipline) => (
              <option key={discipline.value} value={discipline.value}>
                {discipline.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nationality</label>
          <select
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          >
            <option value="">Select Nationality</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Other Nationality</label>
          <select
            name="otherNationality"
            value={formData.otherNationality}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          >
            <option value="">Select Other Nationality</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Position in Club</label>
          <input
            type="text"
            name="positionInClub"
            value={formData.positionInClub}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Federation</label>
          <select
            name="federationId"
            value={formData.federationId}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          >
            {federations.map((federation) => (
              <option key={federation.value} value={federation.value}>
                {federation.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Club</label>
          <select
            name="currentClubId"
            value={formData.currentClubId}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          >
            {clubs.map((club) => (
              <option key={club.value} value={club.value}>
                {club.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Origin Club</label>
          <select
            name="originClubId"
            value={formData.originClubId}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          >
            {clubs.map((club) => (
              <option key={club.value} value={club.value}>
                {club.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Join Date</label>
          <input
            type="date"
            name="joinDate"
            value={formData.joinDate}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Place of Birth</label>
          <input
            type="text"
            name="placeOfBirth"
            value={formData.placeOfBirth}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fitness Status</label>
          <input
            type="text"
            name="fitnessStatus"
            value={formData.fitnessStatus}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Level of Education</label>
          <select
            name="levelOfEducation"
            value={formData.levelOfEducation}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          >
            {educationLevelOptions.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CV/Resume</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            name="cvResume"
            className="mt-1 block w-full border rounded-md"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 text-white">
          Submit
        </Button>
      </div>
    </form>
  );
};

export default AddPlayerStaffForm;
