import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { locations } from '../../data/locations';
import { toast } from 'react-toastify';

const AddInfrastructureModal = ({ isOpen, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: '',
    infra_category: 0,
    infra_sub_category: 0,
    type_level: '',
    status: '',
    capacity: 0,
    description: '',
    location_province: '',
    location_district: '',
    location_sector: '',
    location_cell: '',
    location_village: '',
    latitude: 0,
    longitude: 0,
    upi: '',
    plot_area: 0,
    construction_date: '',
    owner: '',
    main_users: '',
    types_of_sports: '',
    internet_connection: false,
    electricity_connection: false,
    water_connection: false,
    access_road: false,
    health_facility: false,
    legal_representative_name: '',
    legal_representative_gender: 'Male',
    legal_representative_email: '',
    legal_representative_phone: '',
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/infrastructure-categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (formData.infra_category) {
        try {
          const response = await axiosInstance.get(`/infrastructure-subcategories`);
          setSubCategories(response.data);
        } catch (err) {
          console.error('Failed to fetch subcategories:', err);
        }
      }
    };

    fetchSubCategories();
  }, [formData.infra_category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : 
              ['infra_category', 'infra_sub_category', 'capacity', 'latitude', 'longitude', 'plot_area'].includes(name)
              ? parseFloat(value)
              : value,
    });
  };

  const handleLocationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'location_province' && {
        location_district: '',
        location_sector: '',
        location_cell: '',
        location_village: '',
      }),
      ...(field === 'location_district' && {
        location_sector: '',
        location_cell: '',
        location_village: '',
      }),
      ...(field === 'location_sector' && {
        location_cell: '',
        location_village: '',
      }),
      ...(field === 'location_cell' && {
        location_village: '',
      }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axiosInstance.post('/infrastructures', formData);
      setSuccess(true);
      toast.success('Infrastructure added successfully!');
      await onRefresh?.();
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = err.response?.data?.message || 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">Add Infrastructure</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">Infrastructure added successfully!</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label htmlFor="name" className="font-medium mb-1">
              NAME:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="infra_category" className="font-medium mb-1">
              INFRASTRUCTURE CATEGORY:
            </label>
            <select
              id="infra_category"
              name="infra_category"
              value={formData.infra_category}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="infra_sub_category" className="font-medium mb-1">
              INFRASTRUCTURE SUB CATEGORY:
            </label>
            <select
              id="infra_sub_category"
              name="infra_sub_category"
              value={formData.infra_sub_category}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
              disabled={!formData.infra_category}
            >
              <option value="">Select Sub Category</option>
              {subCategories.map((subCategory) => (
                <option key={subCategory.id} value={subCategory.id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="type_level" className="font-medium mb-1">
              TYPE LEVEL:
            </label>
            <input
              type="text"
              id="type_level"
              name="type_level"
              value={formData.type_level}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="status" className="font-medium mb-1">
              STATUS:
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Under Construction">Under Construction</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="capacity" className="font-medium mb-1">
              CAPACITY:
            </label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="description" className="font-medium mb-1">
              DESCRIPTION:
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          {/* Location Fields */}
          <div className="flex flex-col">
            <label htmlFor="location_province" className="font-medium mb-1">
              PROVINCE:
            </label>
            <select
              id="location_province"
              name="location_province"
              value={formData.location_province}
              onChange={(e) => handleLocationChange('location_province', e.target.value)}
              className="border border-gray-300 rounded p-2"
            >
              <option value="">Select Province</option>
              {locations.provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="location_district" className="font-medium mb-1">
              DISTRICT:
            </label>
            <select
              id="location_district"
              name="location_district"
              value={formData.location_district}
              onChange={(e) => handleLocationChange('location_district', e.target.value)}
              className="border border-gray-300 rounded p-2"
              disabled={!formData.location_province}
            >
              <option value="">Select District</option>
              {(locations.districts[formData.location_province] || []).map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="location_sector" className="font-medium mb-1">
              SECTOR:
            </label>
            <select
              id="location_sector"
              name="location_sector"
              value={formData.location_sector}
              onChange={(e) => handleLocationChange('location_sector', e.target.value)}
              className="border border-gray-300 rounded p-2"
              disabled={!formData.location_district}
            >
              <option value="">Select Sector</option>
              {(locations.sectors[formData.location_district] || []).map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="location_cell" className="font-medium mb-1">
              CELL:
            </label>
            <select
              id="location_cell"
              name="location_cell"
              value={formData.location_cell}
              onChange={(e) => handleLocationChange('location_cell', e.target.value)}
              className="border border-gray-300 rounded p-2"
              disabled={!formData.location_sector}
            >
              <option value="">Select Cell</option>
              {(locations.cells[formData.location_sector] || []).map((cell) => (
                <option key={cell} value={cell}>
                  {cell}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="location_village" className="font-medium mb-1">
              VILLAGE:
            </label>
            <select
              id="location_village"
              name="location_village"
              value={formData.location_village}
              onChange={(e) => handleLocationChange('location_village', e.target.value)}
              className="border border-gray-300 rounded p-2"
              disabled={!formData.location_cell}
            >
              <option value="">Select Village</option>
              {(locations.villages[formData.location_cell] || []).map((village) => (
                <option key={village} value={village}>
                  {village}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="latitude" className="font-medium mb-1">
              LATITUDE:
            </label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="longitude" className="font-medium mb-1">
              LONGITUDE:
            </label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="upi" className="font-medium mb-1">
              UPI:
            </label>
            <input
              type="text"
              id="upi"
              name="upi"
              value={formData.upi}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="plot_area" className="font-medium mb-1">
              PLOT AREA:
            </label>
            <input
              type="number"
              id="plot_area"
              name="plot_area"
              value={formData.plot_area}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="construction_date" className="font-medium mb-1">
              CONSTRUCTION DATE:
            </label>
            <input
              type="date"
              id="construction_date"
              name="construction_date"
              value={formData.construction_date}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="owner" className="font-medium mb-1">
              OWNER:
            </label>
            <input
              type="text"
              id="owner"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="main_users" className="font-medium mb-1">
              MAIN USERS:
            </label>
            <input
              type="text"
              id="main_users"
              name="main_users"
              value={formData.main_users}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="types_of_sports" className="font-medium mb-1">
              TYPES OF SPORTS:
            </label>
            <input
              type="text"
              id="types_of_sports"
              name="types_of_sports"
              value={formData.types_of_sports}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">CONNECTIONS:</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="internet_connection"
                  checked={formData.internet_connection}
                  onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked }})}
                  className="mr-2"
                />
                Internet Connection
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="electricity_connection"
                  checked={formData.electricity_connection}
                  onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked }})}
                  className="mr-2"
                />
                Electricity Connection
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="water_connection"
                  checked={formData.water_connection}
                  onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked }})}
                  className="mr-2"
                />
                Water Connection
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="access_road"
                  checked={formData.access_road}
                  onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked }})}
                  className="mr-2"
                />
                Access Road
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="health_facility"
                  checked={formData.health_facility}
                  onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked }})}
                  className="mr-2"
                />
                Health Facility
              </label>
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="legal_representative_name" className="font-medium mb-1">
              LEGAL REPRESENTATIVE NAME:
            </label>
            <input
              type="text"
              id="legal_representative_name"
              name="legal_representative_name"
              value={formData.legal_representative_name}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="legal_representative_gender" className="font-medium mb-1">
              LEGAL REPRESENTATIVE GENDER:
            </label>
            <select
              id="legal_representative_gender"
              name="legal_representative_gender"
              value={formData.legal_representative_gender}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="legal_representative_email" className="font-medium mb-1">
              LEGAL REPRESENTATIVE EMAIL:
            </label>
            <input
              type="email"
              id="legal_representative_email"
              name="legal_representative_email"
              value={formData.legal_representative_email}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="legal_representative_phone" className="font-medium mb-1">
              LEGAL REPRESENTATIVE PHONE:
            </label>
            <input
              type="text"
              id="legal_representative_phone"
              name="legal_representative_phone"
              value={formData.legal_representative_phone}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex justify-end col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInfrastructureModal;
