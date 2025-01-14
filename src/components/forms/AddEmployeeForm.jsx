import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { locations } from '../../data/locations'; // Import locations data
import axiosInstance from '../../utils/axiosInstance';

const createEmployee = async (data) => {
  try {
    const response = await axiosInstance.post('/employees', data, {
      headers: {
        'Content-Type': 'multipart/form-data', // Use multipart/form-data for file uploads
      }
    });
    
    if (!response.data) {
      throw new Error('No response data received');
    }

    return response.data;
  } catch (error) {
    console.error('Complete error:', error);
    throw error;
  }
};

const updateEmployee = async (employeeId, data) => {
  if (!employeeId) {
    throw new Error('Employee ID is required for updates');
  }
  try {
    const response = await axiosInstance.put(`/employees/${employeeId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data', // Use multipart/form-data for file uploads
      },
    });
    
    if (!response.data) {
      throw new Error('No response data received');
    }
    
    return response.data;
  } catch (error) {
    console.error('API Error Response:', error.response?.data);
    throw error;
  }
};

const AddEmployeeForm = ({ isEditing, employeeId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    photoPassport: null, // Initialize as null for file input
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    phone: '',
    maritalStatus: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    startDate: '',
    employeeStatus: '',
    employeeType: '',
    departmentSupervisor: '',
    contactFirstName: '',
    contactLastName: '',
    relationship: '',
    contactPhone: '',
  });

  const [loading, setLoading] = useState(false); // New state for loading

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (isEditing && employeeId) {
        try {
          const response = await axiosInstance.get(`/employees/${employeeId}`);
          const employeeData = response.data.employee;

          // Normalize the values to match select options
          const normalizedData = {
            ...employeeData,
            gender: employeeData.gender?.trim() || '',
            employee_status: employeeData.employee_status?.trim() || '',
            employee_type: employeeData.employee_type?.trim() || '',
            martial_status: employeeData.martial_status?.trim() || ''
          };

          setFormData({
            photoPassport: normalizedData.photo_passport || '',
            firstName: normalizedData.firstname || '',
            lastName: normalizedData.lastname || '',
            gender: normalizedData.gender || '',
            email: normalizedData.email || '',
            phone: normalizedData.phone || '',
            maritalStatus: normalizedData.martial_status || '',
            province: normalizedData.address_province || '',
            district: normalizedData.address_district || '',
            sector: normalizedData.address_sector || '',
            cell: normalizedData.address_cell || '',
            village: normalizedData.address_village || '',
            startDate: normalizedData.start_date ? new Date(normalizedData.start_date).toISOString().split('T')[0] : '',
            employeeStatus: normalizedData.employee_status || '',
            employeeType: normalizedData.employee_type || '',
            departmentSupervisor: normalizedData.department_supervisor || '',
            contactFirstName: normalizedData.person_of_contact_firstname || '',
            contactLastName: normalizedData.person_of_contact_lastname || '',
            relationship: normalizedData.person_of_contact_relationship || '',
            contactPhone: normalizedData.person_of_contact_phone || ''
          });

        } catch (error) {
          console.error('Error fetching employee data:', error);
          toast.error(`Failed to load employee data: ${error.message}`);
        }
      }
    };

    fetchEmployeeData();
  }, [isEditing, employeeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photoPassport: file }));
    }
  };

  const handleLocationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'province' && {
        district: '',
        sector: '',
        cell: '',
        village: '',
      }),
      ...(field === 'district' && {
        sector: '',
        cell: '',
        village: '',
      }),
      ...(field === 'sector' && {
        cell: '',
        village: '',
      }),
      ...(field === 'cell' && {
        village: '',
      }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when request starts

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('photo_passport', formData.photoPassport);
      formDataToSend.append('firstname', formData.firstName);
      formDataToSend.append('lastname', formData.lastName);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('martial_status', formData.maritalStatus);
      formDataToSend.append('address_province', formData.province);
      formDataToSend.append('address_district', formData.district);
      formDataToSend.append('address_sector', formData.sector);
      formDataToSend.append('address_cell', formData.cell);
      formDataToSend.append('address_village', formData.village);
      formDataToSend.append('start_date', formData.startDate);
      formDataToSend.append('employee_status', formData.employeeStatus);
      formDataToSend.append('employee_type', formData.employeeType);
      formDataToSend.append('department_supervisor', formData.departmentSupervisor);
      formDataToSend.append('person_of_contact_firstname', formData.contactFirstName);
      formDataToSend.append('person_of_contact_lastname', formData.contactLastName);
      formDataToSend.append('person_of_contact_relationship', formData.relationship);
      formDataToSend.append('person_of_contact_phone', formData.contactPhone);

      if (isEditing) {
        const result = await updateEmployee(employeeId, formDataToSend);
        toast.success('Employee updated successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const result = await createEmployee(formDataToSend);
        toast.success('Employee created successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
      
      if (typeof onSuccess === 'function') {
        onSuccess();
      }

    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} employee: ${errorMessage}`);
    } finally {
      setLoading(false); // Set loading to false when request completes
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-8">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Employee Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">Employee Details</h3>
          <div>
            <label htmlFor="photoPassport" className="block text-sm font-medium">Photo Passport</label>
            <input
              id="photoPassport"
              name="photoPassport"
              type="file"
              onChange={handleFileChange}
              className="w-full border rounded-md py-2 px-3 mt-1"
            />
            {formData.photoPassport && (
              <p className="text-sm mt-1">
                {formData.photoPassport instanceof File 
                  ? `Selected file: ${formData.photoPassport.name}`
                  : `Current photo: ${formData.photoPassport}`
                }
              </p>
            )}
          </div>
          {/* Other form fields remain unchanged */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium">First Name</label>
              <input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border rounded-md py-2 px-3 mt-1"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border rounded-md py-2 px-3 mt-1"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 mt-1"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 mt-1"
              type="email"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium">Phone</label>
            <input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 mt-1"
              type="tel"
              required
            />
          </div>
          <div>
            <label htmlFor="maritalStatus" className="block text-sm font-medium">Marital Status</label>
            <select
              id="maritalStatus"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 mt-1"
              required
            >
              <option value="">Select Marital Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>
        </div>

        {/* Emergency Contact Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">Emergency Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactFirstName" className="block text-sm font-medium">Contact First Name</label>
              <input
                id="contactFirstName"
                name="contactFirstName"
                value={formData.contactFirstName}
                onChange={handleChange}
                className="w-full border rounded-md py-2 px-3 mt-1"
                required
              />
            </div>
            <div>
              <label htmlFor="contactLastName" className="block text-sm font-medium">Contact Last Name</label>
              <input
                id="contactLastName"
                name="contactLastName"
                value={formData.contactLastName}
                onChange={handleChange}
                className="w-full border rounded-md py-2 px-3 mt-1"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="relationship" className="block text-sm font-medium">Relationship</label>
            <input
              id="relationship"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 mt-1"
              required
            />
          </div>
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium">Contact Phone</label>
            <input
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 mt-1"
              type="tel"
              required
            />
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Employee Status Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">Employee Status</h3>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium">Start Date</label>
            <input
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 mt-1"
              type="date"
              required
            />
          </div>
          <div>
            <label htmlFor="employeeStatus" className="block text-sm font-medium">Employee Status</label>
            <select
              id="employeeStatus"
              name="employeeStatus"
              value={formData.employeeStatus}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 mt-1"
              required
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
          <div>
            <label htmlFor="employeeType" className="block text-sm font-medium">Employee Type</label>
            <select
              id="employeeType"
              name="employeeType"
              value={formData.employeeType}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 mt-1"
              required
            >
              <option value="">Select Type</option>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
          <div>
            <label htmlFor="departmentSupervisor" className="block text-sm font-medium">Department Supervisor</label>
            <input
              id="departmentSupervisor"
              name="departmentSupervisor"
              value={formData.departmentSupervisor}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 mt-1"
              required
            />
          </div>
        </div>

        {/* Address Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">Address Details</h3>
          <div>
            <label htmlFor="province" className="block text-sm font-medium">Province</label>
            <select
              id="province"
              name="province"
              value={formData.province}
              onChange={(e) => handleLocationChange('province', e.target.value)}
              className="w-full border rounded-md py-2 px-3 mt-1"
              required
            >
              <option value="">Select Province</option>
              {locations.provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="district" className="block text-sm font-medium">District</label>
            <select
              id="district"
              name="district"
              value={formData.district}
              onChange={(e) => handleLocationChange('district', e.target.value)}
              className="w-full border rounded-md py-2 px-3 mt-1"
              disabled={!formData.province}
              required
            >
              <option value="">Select District</option>
              {(locations.districts[formData.province] || []).map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sector" className="block text-sm font-medium">Sector</label>
            <select
              id="sector"
              name="sector"
              value={formData.sector}
              onChange={(e) => handleLocationChange('sector', e.target.value)}
              className="w-full border rounded-md py-2 px-3 mt-1"
              disabled={!formData.district}
              required
            >
              <option value="">Select Sector</option>
              {(locations.sectors[formData.district] || []).map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cell" className="block text-sm font-medium">Cell</label>
            <select
              id="cell"
              name="cell"
              value={formData.cell}
              onChange={(e) => handleLocationChange('cell', e.target.value)}
              className="w-full border rounded-md py-2 px-3 mt-1"
              disabled={!formData.sector}
              required
            >
              <option value="">Select Cell</option>
              {(locations.cells[formData.sector] || []).map((cell) => (
                <option key={cell} value={cell}>
                  {cell}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="village" className="block text-sm font-medium">Village</label>
            <select
              id="village"
              name="village"
              value={formData.village}
              onChange={(e) => handleLocationChange('village', e.target.value)}
              className="w-full border rounded-md py-2 px-3 mt-1"
              disabled={!formData.cell}
              required
            >
              <option value="">Select Village</option>
              {(locations.villages[formData.cell] || []).map((village) => (
                <option key={village} value={village}>
                  {village}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-black px-4 py-2 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md"
          disabled={loading} // Disable button when loading
        >
          {loading ? 'Processing...' : isEditing ? 'Update' : 'Add'} Employee
        </button>
      </div>
    </form>
  );
};

AddEmployeeForm.propTypes = {
  isEditing: PropTypes.bool,
  employeeId: PropTypes.string,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func.isRequired
};

AddEmployeeForm.defaultProps = {
  isEditing: false,
  employeeId: null,
  onSuccess: () => {}
};

export default AddEmployeeForm;
