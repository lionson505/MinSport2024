import React, { useState, useEffect } from 'react';

function EditEmployeeForm({ onSubmit, onCancel, initialData, isEditing }) {
  const [formData, setFormData] = useState({
    photo_passport: '',
    firstname: '',
    lastname: '',
    gender: '',
    email: '',
    phone: '',
    marital_status: '',
    address_province: '',
    address_district: '',
    address_sector: '',
    address_village: '',
    address_cell: '',
    start_date: '',
    employee_status: '',
    employee_type: '',
    department_supervisor: '',
    person_of_contact_firstname: '',
    person_of_contact_lastname: '',
    person_of_contact_relationship: '',
    person_of_contact_phone: '',
  });

  // Initialize form with existing employee data if available
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
      });
    }
  }, [initialData]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Pass the form data to the onSubmit handler
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Employee Status</label>
          <select
            name="employee_status"
            value={formData.employee_status}
            onChange={handleChange}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Employee Type</label>
          <select
            name="employee_type"
            value={formData.employee_type}
            onChange={handleChange}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          >
            <option value="">Select Type</option>
            <option value="Full_time">Full-time</option>
            <option value="Part_time">Part-time</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Department Supervisor</label>
          <input
            type="text"
            name="department_supervisor"
            value={formData.department_supervisor}
            onChange={handleChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Person of Contact First Name</label>
          <input
            type="text"
            name="person_of_contact_firstname"
            value={formData.person_of_contact_firstname}
            onChange={handleChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Person of Contact Last Name</label>
          <input
            type="text"
            name="person_of_contact_lastname"
            value={formData.person_of_contact_lastname}
            onChange={handleChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Person of Contact Relationship</label>
          <input
            type="text"
            name="person_of_contact_relationship"
            value={formData.person_of_contact_relationship}
            onChange={handleChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Person of Contact Phone</label>
          <input
            type="text"
            name="person_of_contact_phone"
            value={formData.person_of_contact_phone}
            onChange={handleChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <Button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-600 text-white">
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
          {isEditing ? 'Update Employee' : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
}

export default EditEmployeeForm;
