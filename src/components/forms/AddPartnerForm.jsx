import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axiosInstance from '../../utils/axiosInstance';
import { locations } from '../../data/locations';

const AddPartnerForm = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: '',
    sports_discipline: '',
    legal_status: '',
    business: '',
    location_province: '',
    location_district: '',
    location_sector: '',
    location_cell: '',
    location_village: '',
    legal_representative_name: '',
    legal_representative_gender: '',
    legal_representative_email: '',
    legal_representative_phone: '',
    createdAt: '',
    updatedAt: '',
  });

  const [disciplines, setDisciplines] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const legalStatusOptions = [
    { value: 'company', label: 'Company' },
    { value: 'ngo', label: 'NGO' },
    { value: 'public_institution', label: 'Public Institution' },
    { value: 'cooperative', label: 'Cooperative' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const disciplinesResponse = await axiosInstance.get('/disciplines');
        setDisciplines(disciplinesResponse.data || []);
      } catch (error) {
        console.error('Error fetching disciplines:', error);
        toast.error('Failed to fetch disciplines');
      }
    };

    fetchDisciplines();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sports_discipline: initialData.sports_discipline || '',
        legal_status: initialData.legal_status || '',
        business: initialData.business || '',
        location_province: initialData.location_province || '',
        location_district: initialData.location_district || '',
        location_sector: initialData.location_sector || '',
        location_cell: initialData.location_cell || '',
        location_village: initialData.location_village || '',
        legal_representative_name: initialData.legal_representative_name || '',
        legal_representative_gender: initialData.legal_representative_gender || '',
        legal_representative_email: initialData.legal_representative_email || '',
        legal_representative_phone: initialData.legal_representative_phone || '',
        createdAt: initialData.createdAt || '',
        updatedAt: initialData.updatedAt || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "location_province" && { location_district: "", location_sector: "", location_cell: "", location_village: "" }),
      ...(name === "location_district" && { location_sector: "", location_cell: "", location_village: "" }),
      ...(name === "location_sector" && { location_cell: "", location_village: "" }),
      ...(name === "location_cell" && { location_village: "" }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const payload = {
      ...formData,
      updatedAt: new Date().toISOString(),
    };

    if (!initialData) {
      payload.createdAt = new Date().toISOString();
    }
  
    try {
      let response;
      if (initialData) {
        response = await axiosInstance.put(`/partners/${initialData.id}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
        toast.success('Data updated successfully!');
      } else {
        response = await axiosInstance.post('/partners', payload, {
          headers: { 'Content-Type': 'application/json' },
        });
        toast.success('Data submitted successfully!');
      }
      onSubmit(response.data);
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response);
        toast.error(`Error: ${error.response.data.message || 'An error occurred'}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        toast.error('Network error: Unable to reach the server.');
      } else {
        console.error('Error:', error.message);
        toast.error('There was an error submitting the form.');
      }
    }
  };

  const getDistricts = () => {
    return locations.districts[formData.location_province] || [];
  };

  const getSectors = () => {
    return locations.sectors[formData.location_district] || [];
  };

  const getCells = () => {
    return locations.cells[formData.location_sector] || [];
  };

  const getVillages = () => {
    return locations.villages[formData.location_cell] || [];
  };

  const validateStep = () => {
    const stepFields = [
      ['name', 'sports_discipline', 'legal_status', 'business', 'location_province'],
      ['location_district', 'location_sector', 'location_cell', 'location_village', 'legal_representative_name'],
      ['legal_representative_gender', 'legal_representative_email', 'legal_representative_phone']
    ];

    return stepFields[currentStep].every(field => formData[field]);
  };

  const steps = [
    // Step 1
    <div key="step1" className="grid grid-cols-1 gap-4">
      <div>
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 h-12"
          placeholder="Enter name"
        />
      </div>
      <div>
        <label>Sports Discipline</label>
        <select
          name="sports_discipline"
          value={formData.sports_discipline}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 h-12"
        >
          <option value="">Select Discipline</option>
          {disciplines.map((discipline) => (
            <option key={discipline.id} value={discipline.name}>
              {discipline.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Legal Status</label>
        <select
          name="legal_status"
          value={formData.legal_status}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 h-12"
        >
          <option value="">Select Legal Status</option>
          {legalStatusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Business</label>
        <input
          type="text"
          name="business"
          value={formData.business}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 h-12"
        />
      </div>
      <div>
        <label>Location Province</label>
        <select
          name="location_province"
          value={formData.location_province}
          onChange={handleLocationChange}
          required
          className="w-full border rounded px-3 py-2 h-12"
        >
          <option value="">Select Province</option>
          {locations.provinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>
    </div>,
    // Step 2
    <div key="step2" className="grid grid-cols-1 gap-4">
      <div>
        <label>Location District</label>
        <select
          name="location_district"
          value={formData.location_district}
          onChange={handleLocationChange}
          required
          className="w-full border rounded px-3 py-2 h-12"
        >
          <option value="">Select District</option>
          {getDistricts().map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Location Sector</label>
        <select
          name="location_sector"
          value={formData.location_sector}
          onChange={handleLocationChange}
          required
          className="w-full border rounded px-3 py-2 h-12"
        >
          <option value="">Select Sector</option>
          {getSectors().map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Location Cell</label>
        <select
          name="location_cell"
          value={formData.location_cell}
          onChange={handleLocationChange}
          required
          className="w-full border rounded px-3 py-2 h-12"
        >
          <option value="">Select Cell</option>
          {getCells().map((cell) => (
            <option key={cell} value={cell}>
              {cell}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Location Village</label>
        <select
          name="location_village"
          value={formData.location_village}
          onChange={handleLocationChange}
          required
          className="w-full border rounded px-3 py-2 h-12"
        >
          <option value="">Select Village</option>
          {getVillages().map((village) => (
            <option key={village} value={village}>
              {village}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Legal Representative Name</label>
        <input
          type="text"
          name="legal_representative_name"
          value={formData.legal_representative_name}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 h-12"
        />
      </div>
    </div>,
    // Step 3
    <div key="step3" className="grid grid-cols-1 gap-4">
      <div>
        <label>Legal Representative Gender</label>
        <select
          name="legal_representative_gender"
          value={formData.legal_representative_gender}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 h-12"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label>Legal Representative Email</label>
        <input
          type="email"
          name="legal_representative_email"
          value={formData.legal_representative_email}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 h-12"
        />
      </div>
      <div>
        <label>Legal Representative Phone</label>
        <input
          type="tel"
          name="legal_representative_phone"
          value={formData.legal_representative_phone}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 h-12"
        />
      </div>
    </div>,
    // Step 4 (Confirmation or Summary Step)
    <div key="step4" className="grid grid-cols-1 gap-4">
      <p>Review your information and click "Save" to submit.</p>
    </div>,
  ];

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4">
      <form onSubmit={handleSubmit}>
        {steps[currentStep]}
        <div className="flex justify-between mt-4">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Previous
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                if (validateStep()) {
                  setCurrentStep(currentStep + 1);
                } else {
                  toast.error('Please fill all fields before proceeding.');
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddPartnerForm;