import React, { useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const AddClubPlayerForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    type: initialData?.type || 'Player', // Player or Staff
    idType: initialData?.idType || 'ID', // ID or Passport
    idNumber: initialData?.idNumber || '',
    passportPicture: initialData?.passportPicture || null,
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    gender: initialData?.gender || '',
    maritalStatus: initialData?.maritalStatus || '',
    location: {
      province: initialData?.location?.province || '',
      district: initialData?.location?.district || '',
      sector: initialData?.location?.sector || '',
      cell: initialData?.location?.cell || '',
      village: initialData?.location?.village || ''
    },
    placeOfResidence: initialData?.placeOfResidence || '',
    discipline: initialData?.discipline || '',
    nationality: initialData?.nationality || '',
    otherNationality: initialData?.otherNationality || '',
    position: initialData?.position || '',
    federation: initialData?.federation || '',
    currentClub: initialData?.currentClub || '',
    originClub: initialData?.originClub || '',
    joinDate: {
      month: initialData?.joinDate?.month || '',
      year: initialData?.joinDate?.year || ''
    },
    placeOfBirth: initialData?.placeOfBirth || '',
    fitnessStatus: initialData?.fitnessStatus || '',
    educationLevel: initialData?.educationLevel || '',
    cv: initialData?.cv || null
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClasses = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDarkMode 
      ? 'bg-gray-800 border-gray-700 text-gray-200' 
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const labelClasses = `block text-sm font-medium mb-1 ${
    isDarkMode ? 'text-gray-300' : 'text-gray-700'
  }`;

  // Generate months array
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years array (current year - 100 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Type</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="Player"
                checked={formData.type === 'Player'}
                onChange={handleChange}
                className="mr-2"
              />
              Player
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="Staff"
                checked={formData.type === 'Staff'}
                onChange={handleChange}
                className="mr-2"
              />
              Staff
            </label>
          </div>
        </div>

        <div>
          <label className={labelClasses}>ID Type</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="idType"
                value="ID"
                checked={formData.idType === 'ID'}
                onChange={handleChange}
                className="mr-2"
              />
              ID
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="idType"
                value="Passport"
                checked={formData.idType === 'Passport'}
                onChange={handleChange}
                className="mr-2"
              />
              Passport
            </label>
          </div>
        </div>
      </div>

      {/* ID/Passport Number */}
      <div>
        <label htmlFor="idNumber" className={labelClasses}>
          {formData.idType === 'Passport' ? 'Passport No' : 'ID No'}
        </label>
        <input
          type="text"
          id="idNumber"
          name="idNumber"
          value={formData.idNumber}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      {/* Passport Picture */}
      <div>
        <label htmlFor="passportPicture" className={labelClasses}>Passport Picture</label>
        <input
          type="file"
          id="passportPicture"
          name="passportPicture"
          accept="image/*"
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className={labelClasses}>First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label htmlFor="lastName" className={labelClasses}>Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={inputClasses}
            required
          />
        </div>
      </div>

      {/* Date of Birth */}
      <div>
        <label htmlFor="dateOfBirth" className={labelClasses}>Date of Birth</label>
        <input
          type="date"
          id="dateOfBirth"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      {/* Gender and Marital Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="gender" className={labelClasses}>Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={inputClasses}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label htmlFor="maritalStatus" className={labelClasses}>Marital Status</label>
          <select
            id="maritalStatus"
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleChange}
            className={inputClasses}
            required
          >
            <option value="">Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="location.province" className={labelClasses}>Province</label>
          <select
            id="location.province"
            name="location.province"
            value={formData.location.province}
            onChange={handleChange}
            className={inputClasses}
            required
          >
            <option value="">Select Province</option>
            <option value="Kigali">Kigali</option>
            <option value="Northern">Northern</option>
            <option value="Southern">Southern</option>
            <option value="Eastern">Eastern</option>
            <option value="Western">Western</option>
          </select>
        </div>

        <div>
          <label htmlFor="location.district" className={labelClasses}>District</label>
          <select
            id="location.district"
            name="location.district"
            value={formData.location.district}
            onChange={handleChange}
            className={inputClasses}
            required
          >
            <option value="">Select District</option>
            {/* Add districts based on selected province */}
          </select>
        </div>
      </div>

      {/* Sports Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="discipline" className={labelClasses}>Discipline</label>
          <select
            id="discipline"
            name="discipline"
            value={formData.discipline}
            onChange={handleChange}
            className={inputClasses}
            required
          >
            <option value="">Select Discipline</option>
            <option value="Football">Football</option>
            <option value="Basketball">Basketball</option>
            <option value="Volleyball">Volleyball</option>
            <option value="Rugby">Rugby</option>
          </select>
        </div>

        <div>
          <label htmlFor="position" className={labelClasses}>Position in Club</label>
          <select
            name="playerPosition"
            value={formData.playerPosition}
            onChange={handleChange}
            className={`${inputClassName} mt-1 block w-full border rounded-md`}
          >
            <option value="">Select Player Position</option>
            {/* Football Positions */}
            <optgroup label="Football Positions">
              <option value="Goalkeeper">Goalkeeper</option>
              <option value="Defender">Defender</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Forward">Forward</option>
            </optgroup>

            {/* Basketball Positions */}
            <optgroup label="Basketball Positions">
              <option value="Point Guard">Point Guard</option>
              <option value="Shooting Guard">Shooting Guard</option>
              <option value="Small Forward">Small Forward</option>
              <option value="Power Forward">Power Forward</option>
              <option value="Center">Center</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Join Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="joinDate.month" className={labelClasses}>Join Month</label>
          <select
            id="joinDate.month"
            name="joinDate.month"
            value={formData.joinDate.month}
            onChange={handleChange}
            className={inputClasses}
            required
          >
            <option value="">Select Month</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="joinDate.year" className={labelClasses}>Join Year</label>
          <select
            id="joinDate.year"
            name="joinDate.year"
            value={formData.joinDate.year}
            onChange={handleChange}
            className={inputClasses}
            required
          >
            <option value="">Select Year</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <label htmlFor="cv" className={labelClasses}>Upload CV/Resume</label>
        <input
          type="file"
          id="cv"
          name="cv"
          accept=".pdf,.doc,.docx"
          onChange={handleChange}
          className={inputClasses}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-lg ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } disabled:opacity-50`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin">⌛</span>
              <span>Saving...</span>
            </>
          ) : (
            <span>Save</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default AddClubPlayerForm; 