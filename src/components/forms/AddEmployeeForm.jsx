import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import locData from '../../data/loc.json'; // Import loc.json directly
import axiosInstance from '../../utils/axiosInstance';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const createEmployee = async (data) => {
  try {
    console.log("Sending data:", data);

    const formData = new FormData();
    
    // Add all fields to FormData
    Object.keys(data).forEach(key => {
      if (key === 'photo_passport' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });

    const response = await axiosInstance.post('/employees', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
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
    console.log('Updating employee with data:', data);

    const formData = new FormData();
    
    // Add all fields to FormData
    Object.keys(data).forEach(key => {
      if (key === 'photo_passport' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });

    const response = await axiosInstance.put(`/employees/${employeeId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
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
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    photo_passport: '',
    firstname: '',
    lastname: '',
    gender: '',
    email: '',
    phone: '',
    martial_status: '',
    address_province: '',
    address_district: '',
    address_sector: '',
    address_cell: '',
    address_village: '',
    start_date: '',
    employee_status: '',
    employee_type: '',
    departmentId: '',
    person_of_contact_firstname: '',
    person_of_contact_lastname: '',
    person_of_contact_relationship: '',
    person_of_contact_phone: '',
  });

  useEffect(() => {
    axios.get(`${API_URL}departments`).then(res => {
      setDepartments(res.data.departments || []);
    });
  }, []);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (isEditing && employeeId) {
        try {
          const response = await axiosInstance.get(`/employees/${employeeId}`);
          console.log('Raw API response:', response.data);

          const employeeData = response.data.employee;
          console.log('Employee data before mapping:', {
            gender: employeeData.gender,
            employee_status: employeeData.employee_status,
            employee_type: employeeData.employee_type,
            martial_status: employeeData.martial_status
          });

          // Normalize the values to match select options
          const normalizedData = {
            ...employeeData,
            gender: employeeData.gender?.trim() || '',
            employee_status: employeeData.employee_status?.trim() || '',
            employee_type: employeeData.employee_type?.trim() || '',
            martial_status: employeeData.martial_status?.trim() || '',
            departmentId: employeeData.departmentId || '',
          };

          setFormData({
            photo_passport: normalizedData.photo_passport || '',
            firstname: normalizedData.firstname || '',
            lastname: normalizedData.lastname || '',
            gender: normalizedData.gender || '',
            email: normalizedData.email || '',
            phone: normalizedData.phone || '',
            martial_status: normalizedData.martial_status || '',
            address_province: normalizedData.address_province || '',
            address_district: normalizedData.address_district || '',
            address_sector: normalizedData.address_sector || '',
            address_cell: normalizedData.address_cell || '',
            address_village: normalizedData.address_village || '',
            start_date: normalizedData.start_date ? new Date(normalizedData.start_date).toISOString().split('T')[0] : '',
            employee_status: normalizedData.employee_status || '',
            employee_type: normalizedData.employee_type || '',
            departmentId: normalizedData.departmentId || '',
            person_of_contact_firstname: normalizedData.person_of_contact_firstname || '',
            person_of_contact_lastname: normalizedData.person_of_contact_lastname || '',
            person_of_contact_relationship: normalizedData.person_of_contact_relationship || '',
            person_of_contact_phone: normalizedData.person_of_contact_phone || ''
          });

          console.log('Form data after mapping:', {
            gender: normalizedData.gender,
            employee_status: normalizedData.employee_status,
            employee_type: normalizedData.employee_type,
            martial_status: normalizedData.martial_status
          });

        } catch (error) {
          console.error('Error fetching employee data:', error);
          toast.error(`Failed to load employee data: ${error.message}`);
        }
      }
    };

    fetchEmployeeData();
  }, [isEditing, employeeId]);

  // Add a debug effect to monitor form data changes
  useEffect(() => {
    if (isEditing) {
      console.log('Current form data:', formData);
    }
  }, [formData, isEditing]);

  useEffect(() => {
    console.log('FormData state updated:', formData);
  }, [formData]);

  useEffect(() => {
    console.log('Component props:', { isEditing, employeeId });
  }, [isEditing, employeeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo_passport: file }));
    }
  };

  const handleLocationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'address_province' && {
        address_district: '',
        address_sector: '',
        address_cell: '',
        address_village: '',
      }),
      ...(field === 'address_district' && {
        address_sector: '',
        address_cell: '',
        address_village: '',
      }),
      ...(field === 'address_sector' && {
        address_cell: '',
        address_village: '',
      }),
      ...(field === 'address_cell' && {
        address_village: '',
      }),
    }));
  };

  const provinces = locData.items.map(item => item.name);
  const districts = {};
  const sectors = {};
  const cells = {};
  const villages = {};

  locData.items.forEach(province => {
    districts[province.name] = province.districts.map(district => district.name);
    province.districts.forEach(district => {
      sectors[district.name] = district.sectors.map(sector => sector.name);
      district.sectors.forEach(sector => {
        cells[sector.name] = sector.cells.map(cell => cell.name);
        sector.cells.forEach(cell => {
          villages[cell.name] = cell.villages;
        });
      });
    });
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create the data object with the correct field names
      const dataToSend = {
        photo_passport: formData.photo_passport || "https://example.com/images/photo.jpg",
        firstname: formData.firstname,
        lastname: formData.lastname,
        gender: formData.gender,
        email: formData.email,
        phone: formData.phone,
        martial_status: formData.martial_status,
        address_province: formData.address_province,
        address_district: formData.address_district,
        address_sector: formData.address_sector,
        address_cell: formData.address_cell,
        address_village: formData.address_village,
        start_date: formData.start_date,
        employee_status: formData.employee_status,
        employee_type: formData.employee_type,
        departmentId: formData.departmentId,
        person_of_contact_firstname: formData.person_of_contact_firstname,
        person_of_contact_lastname: formData.person_of_contact_lastname,
        person_of_contact_relationship: formData.person_of_contact_relationship,
        person_of_contact_phone: formData.person_of_contact_phone,
      };

      console.log('Submitting data:', dataToSend);

      if (isEditing) {
        await updateEmployee(employeeId, dataToSend);
        toast.success('Employee updated successfully');
      } else {
        await createEmployee(dataToSend);
        toast.success('Employee created successfully');
      }

      onSuccess();
      window.location.reload(); // Force full page reload after add/edit
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} employee: ${error.message}`);
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
            <label htmlFor="photo_passport" className="block text-sm font-medium">Photo Passport</label>
            <input
              id="photo_passport"
              name="photo_passport"
              type="file"
              onChange={handleFileChange}
              className="w-full border rounded-md py-2 px-3 mt-1"
            />
            {formData.photo_passport && (
              <p className="text-sm mt-1">
                {formData.photo_passport instanceof File 
                  ? `Selected file: ${formData.photo_passport.name}`
                  : `Current photo: ${formData.photo_passport}`
                }
              </p>
            )}
          </div>
          {/* Other form fields remain unchanged */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstname" className="block text-sm font-medium">First Name</label>
              <input
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className="w-full border rounded-md py-2 px-3 mt-1"
                required
              />
            </div>
            <div>
              <label htmlFor="lastname" className="block text-sm font-medium">Last Name</label>
              <input
                id="lastname"
                name="lastname"
                value={formData.lastname}
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
            <label htmlFor="martial_status" className="block text-sm font-medium">Marital Status</label>
            <select
              id="martial_status"
              name="martial_status"
              value={formData.martial_status}
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
              <label htmlFor="person_of_contact_firstname" className="block text-sm font-medium">Contact First Name</label>
              <input
                id="person_of_contact_firstname"
                name="person_of_contact_firstname"
                value={formData.person_of_contact_firstname}
                onChange={handleChange}
                className="w-full border rounded-md py-2 px-3 mt-1"
                required
              />
            </div>
            <div>
              <label htmlFor="person_of_contact_lastname" className="block text-sm font-medium">Contact Last Name</label>
              <input
                id="person_of_contact_lastname"
                name="person_of_contact_lastname"
                value={formData.person_of_contact_lastname}
                onChange={handleChange}
                className="w-full border rounded-md py-2 px-3 mt-1"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="person_of_contact_relationship" className="block text-sm font-medium">Relationship</label>
            <input
              id="person_of_contact_relationship"
              name="person_of_contact_relationship"
              value={formData.person_of_contact_relationship}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 mt-1"
              required
            />
          </div>
          <div>
            <label htmlFor="person_of_contact_phone" className="block text-sm font-medium">Contact Phone</label>
            <input
              id="person_of_contact_phone"
              name="person_of_contact_phone"
              value={formData.person_of_contact_phone}
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
            <label htmlFor="start_date" className="block text-sm font-medium">Start Date</label>
            <input
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 mt-1"
              type="date"
              required
            />
          </div>
          <div>
            <label htmlFor="employee_status" className="block text-sm font-medium">Employee Status</label>
            <select
              id="employee_status"
              name="employee_status"
              value={formData.employee_status}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 mt-1"
              required
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label htmlFor="employee_type" className="block text-sm font-medium">Employee Type</label>
            <select
              id="employee_type"
              name="employee_type"
              value={formData.employee_type}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 mt-1"
              required
            >
              <option value="">Select Type</option>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contractor">Contractor</option>
              <option value="intern">Intern</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>
          {/* Replace department_supervisor input with department dropdown */}
          <div>
            <label htmlFor="departmentId" className="block text-sm font-medium">Department</label>
            <select
              id="departmentId"
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              className="w-full border rounded-md py-2 px-3 mt-1"
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Address Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">Address Details</h3>
          <div>
            <label htmlFor="address_province" className="block text-sm font-medium">Province</label>
            <select
              id="address_province"
              name="address_province"
              value={formData.address_province}
              onChange={(e) => handleLocationChange('address_province', e.target.value)}
              className="w-full border rounded-md py-2 px-3 mt-1"
              required
            >
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="address_district" className="block text-sm font-medium">District</label>
            <select
              id="address_district"
              name="address_district"
              value={formData.address_district}
              onChange={(e) => handleLocationChange('address_district', e.target.value)}
              className="w-full border rounded-md py-2 px-3 mt-1"
              disabled={!formData.address_province}
              required
            >
              <option value="">Select District</option>
              {(districts[formData.address_province] || []).map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="address_sector" className="block text-sm font-medium">Sector</label>
            <select
              id="address_sector"
              name="address_sector"
              value={formData.address_sector}
              onChange={(e) => handleLocationChange('address_sector', e.target.value)}
              className="w-full border rounded-md py-2 px-3 mt-1"
              disabled={!formData.address_district}
              required
            >
              <option value="">Select Sector</option>
              {(sectors[formData.address_district] || []).map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="address_cell" className="block text-sm font-medium">Cell</label>
            <select
              id="address_cell"
              name="address_cell"
              value={formData.address_cell}
              onChange={(e) => handleLocationChange('address_cell', e.target.value)}
              className="w-full border rounded-md py-2 px-3 mt-1"
              disabled={!formData.address_sector}
              required
            >
              <option value="">Select Cell</option>
              {(cells[formData.address_sector] || []).map((cell) => (
                <option key={cell} value={cell}>
                  {cell}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="address_village" className="block text-sm font-medium">Village</label>
            <select
              id="address_village"
              name="address_village"
              value={formData.address_village}
              onChange={(e) => handleLocationChange('address_village', e.target.value)}
              className="w-full border rounded-md py-2 px-3 mt-1"
              disabled={!formData.address_cell}
              required
            >
              <option value="">Select Village</option>
              {(villages[formData.address_cell] || []).map((village) => (
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
        >
          {isEditing ? 'Update' : 'Add'} Employee
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
