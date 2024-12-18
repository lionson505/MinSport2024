import React from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const AddClubForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = React.useState({
    name: initialData?.name || '',
    shortName: initialData?.shortName || '',
    federation: initialData?.federation || '',
    category: initialData?.category || '',
    status: initialData?.status || '',
    location: {
      province: initialData?.location?.province || '',
      district: initialData?.location?.district || '',
      sector: initialData?.location?.sector || '',
      cell: initialData?.location?.cell || '',
      village: initialData?.location?.village || ''
    },
    contact: {
      email: initialData?.contact?.email || '',
      phone: initialData?.contact?.phone || '',
      website: initialData?.contact?.website || ''
    },
    president: {
      name: initialData?.president?.name || '',
      phone: initialData?.president?.phone || '',
      email: initialData?.president?.email || ''
    },
    logo: initialData?.logo || '',
    foundedYear: initialData?.foundedYear || '',
    homeGround: initialData?.homeGround || '',
    players: initialData?.players || '',
    staff: initialData?.staff || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Club Name */}
      <div>
        <label htmlFor="name" className={labelClasses}>Club Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      {/* Short Name */}
      <div>
        <label htmlFor="shortName" className={labelClasses}>Short Name</label>
        <input
          type="text"
          id="shortName"
          name="shortName"
          value={formData.shortName}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      {/* Federation */}
      <div>
        <label htmlFor="federation" className={labelClasses}>Federation</label>
        <select
          id="federation"
          name="federation"
          value={formData.federation}
          onChange={handleChange}
          className={inputClasses}
          required
        >
          <option value="">Select Federation</option>
          <option value="FERWAFA">FERWAFA</option>
          <option value="FERWABA">FERWABA</option>
          <option value="FRVB">FRVB</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className={labelClasses}>Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={inputClasses}
          required
        >
          <option value="">Select Category</option>
          <option value="Premier League">Premier League</option>
          <option value="Division One">Division One</option>
          <option value="Women League">Women League</option>
        </select>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className={labelClasses}>Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={inputClasses}
          required
        >
          <option value="">Select Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
        </select>
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
          <input
            type="text"
            id="location.district"
            name="location.district"
            value={formData.location.district}
            onChange={handleChange}
            className={inputClasses}
            required
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact.email" className={labelClasses}>Club Email</label>
          <input
            type="email"
            id="contact.email"
            name="contact.email"
            value={formData.contact.email}
            onChange={handleChange}
            className={inputClasses}
            required
          />
        </div>
        <div>
          <label htmlFor="contact.phone" className={labelClasses}>Club Phone</label>
          <input
            type="tel"
            id="contact.phone"
            name="contact.phone"
            value={formData.contact.phone}
            onChange={handleChange}
            className={inputClasses}
            required
          />
        </div>
      </div>

      {/* President Information */}
      <div className="space-y-4">
        <div>
          <label htmlFor="president.name" className={labelClasses}>President Name</label>
          <input
            type="text"
            id="president.name"
            name="president.name"
            value={formData.president.name}
            onChange={handleChange}
            className={inputClasses}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="president.phone" className={labelClasses}>President Phone</label>
            <input
              type="tel"
              id="president.phone"
              name="president.phone"
              value={formData.president.phone}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label htmlFor="president.email" className={labelClasses}>President Email</label>
            <input
              type="email"
              id="president.email"
              name="president.email"
              value={formData.president.email}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="foundedYear" className={labelClasses}>Founded Year</label>
          <input
            type="number"
            id="foundedYear"
            name="foundedYear"
            value={formData.foundedYear}
            onChange={handleChange}
            className={inputClasses}
            required
          />
        </div>
        <div>
          <label htmlFor="homeGround" className={labelClasses}>Home Ground</label>
          <input
            type="text"
            id="homeGround"
            name="homeGround"
            value={formData.homeGround}
            onChange={handleChange}
            className={inputClasses}
            required
          />
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <label htmlFor="logo" className={labelClasses}>Club Logo</label>
        <input
          type="file"
          id="logo"
          name="logo"
          accept="image/*"
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
            <span>Save Club</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default AddClubForm; 