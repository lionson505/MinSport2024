import React, { useState } from 'react';
import { createEmployee, updateEmployee } from '../../services/employee';
import toast from 'react-hot-toast';

const AddEmployeeForm = ({ isEditing, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    photoPassport: 'https://example.com/images/photo.jpg',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'Male',
    email: 'example@gmail.com',
    phone: '1234567890',
    maritalStatus: 'Single',
    province: 'Kigali',
    district: 'Nyarugenge',
    sector: 'Kiyovu',
    cell: 'Cell 1',
    village: 'Umudugudu',
    startDate: '2024-01-01',
    employeeStatus: 'Active',
    employeeType: 'Full_time',
    departmentSupervisor: 'Jane Smith',
    contactFirstName: 'Emily',
    contactLastName: 'Brown',
    relationship: 'Sister',
    contactPhone: '0987654321',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const transformedData = {
      photo_passport: formData.photoPassport,
      firstname: formData.firstName,
      lastname: formData.lastName,
      gender: formData.gender,
      email: formData.email,
      phone: formData.phone,
      martial_status: formData.maritalStatus,
      address_province: formData.province,
      address_district: formData.district,
      address_sector: formData.sector,
      address_cell: formData.cell,
      address_village: formData.village,
      start_date: formData.startDate,
      employee_status: formData.employeeStatus,
      employee_type: formData.employeeType,
      department_supervisor: formData.departmentSupervisor,
      person_of_contact_firstname: formData.contactFirstName,
      person_of_contact_lastname: formData.contactLastName,
      person_of_contact_relationship: formData.relationship,
      person_of_contact_phone: formData.contactPhone,
    };
  
    try {
      if (isEditing) {
        await updateEmployee(transformedData);
        toast.success('Employee updated successfully!');
      } else {
        await createEmployee(transformedData);
        toast.success('Employee created successfully!');
      }
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      toast.error(`An error occurred: ${errorMessage}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Employee Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Employee Details</h3>
        <div>
          <label htmlFor="photoPassport" className="block text-sm font-medium">Photo URL</label>
          <input
            id="photoPassport"
            name="photoPassport"
            value={formData.photoPassport}
            onChange={handleChange}
            className="w-full border rounded-md py-2 px-3 mt-1"
            type="url"
            required
          />
        </div>
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
            <option value="Male">Male</option>
            <option value="Female">Female</option>
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
          >
            <option value="Single">Single</option>
            <option value="Married">Married</option>
          </select>
        </div>
      </div>

      {/* Start Date, Employee Status, and Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Employee Details</h3>
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
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
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
          >
            <option value="Full_time">Full-time</option>
            <option value="Part_time">Part-time</option>
            <option value="Contractor">Contractor</option>
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

export default AddEmployeeForm;
