import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { countries, gameTypes, institutionTypes, classOptions } from '../../data';

const AddStudentForm = ({ onSubmit, onCancel, initialData, programs }) => {
  const [studentFormData, setStudentFormData] = useState(initialData);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setStudentFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(studentFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-4 space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={studentFormData.firstName}
            onChange={handleFormChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={studentFormData.lastName}
            onChange={handleFormChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select
            name="gender"
            value={studentFormData.gender}
            onChange={handleFormChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={studentFormData.dateOfBirth}
            onChange={handleFormChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Place of Birth</label>
          <input
            type="text"
            name="placeOfBirth"
            value={studentFormData.placeOfBirth}
            onChange={handleFormChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Place of Residence</label>
          <input
            type="text"
            name="placeOfResidence"
            value={studentFormData.placeOfResidence}
            onChange={handleFormChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ID/Passport No</label>
          <input
            type="text"
            name="idPassportNo"
            value={studentFormData.idPassportNo}
            onChange={handleFormChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nationality</label>
          <select
            name="nationality"
            value={studentFormData.nationality}
            onChange={handleFormChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">Select Nationality</option>
            {countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Other Nationality</label>
          <select
            name="otherNationality"
            value={studentFormData.otherNationality}
            onChange={handleFormChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select Other Nationality (Optional)</option>
            {countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Parents/Guardian Names</label>
          <input
            type="text"
            name="namesOfParentsGuardian"
            value={studentFormData.namesOfParentsGuardian}
            onChange={handleFormChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">School/Academy/Center</label>
          <select
            name="nameOfSchoolAcademyTrainingCenter"
            value={studentFormData.nameOfSchoolAcademyTrainingCenter}
            onChange={(e) => {
              const selectedInstitution = programs.find(institution => institution.name === e.target.value);
              setStudentFormData(prevState => ({
                ...prevState,
                nameOfSchoolAcademyTrainingCenter: e.target.value,
                institutionId: selectedInstitution ? selectedInstitution.id : 1
              }));
            }}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">Select Institution</option>
            {programs.map((institution) => (
              <option key={institution.id} value={institution.name}>
                {institution.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type of Institution</label>
          <select
            name="typeOfSchoolAcademyTrainingCenter"
            value={studentFormData.typeOfSchoolAcademyTrainingCenter}
            onChange={handleFormChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">Select Institution Type</option>
            {institutionTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Class</label>
          <select
            name="class"
            value={studentFormData.class}
            onChange={handleFormChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">Select Class</option>
            {classOptions.map((classOption) => (
              <option key={classOption} value={classOption}>{classOption}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Game Type</label>
          <select
            name="typeOfGame"
            value={studentFormData.typeOfGame}
            onChange={handleFormChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">Select Game Type</option>
            {gameTypes.map((game) => (
              <option key={game} value={game}>{game}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact</label>
          <input
            type="text"
            name="contact"
            value={studentFormData.contact}
            onChange={handleFormChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Add Student
        </Button>
      </div>
    </form>
  );
};

export default AddStudentForm;
