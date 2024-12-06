// src/components/federations/AddPlayerStaffForm.jsx

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import axiosInstance from '../../utils/axiosInstance';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name.includes('Id') ? parseInt(value, 10) : value // Ensure IDs are numbers
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData); // Debugging line
    onSubmit(formData);
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
          <label className="block text-sm font-medium text-gray-700">ID Passport No</label>
          <input
            type="text"
            name="idPassportNo"
            value={formData.idPassportNo}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Passport Picture</label>
          <input
            type="text"
            name="passportPicture"
            value={formData.passportPicture}
            onChange={handleChange}
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
          <input
            type="text"
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          />
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
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Other Nationality</label>
          <input
            type="text"
            name="otherNationality"
            value={formData.otherNationality}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          />
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
          <input
            type="text"
            name="levelOfEducation"
            value={formData.levelOfEducation}
            onChange={handleChange}
            className="mt-1 block w-full border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CV/Resume</label>
          <textarea
            name="cvResume"
            value={formData.cvResume}
            onChange={handleChange}
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
