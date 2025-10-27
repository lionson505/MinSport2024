/* src/components/forms/AddFederationForm.jsx */
import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

const AddFederationForm = ({ onSubmit, onCancel, initialData, isEditing }) => {
  const [formData, setFormData] = useState(initialData || {
    logo: '',
    name: '',
    acronym: '',
    yearFounded: '',
    address: '',
    website: '',
    legalRepresentativeName: '',
    legalRepresentativeGender: '',
    legalRepresentativeEmail: '',
    legalRepresentativePhone: '',
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validation
      if (!formData.name || !formData.acronym || !formData.yearFounded || !formData.address) {
        throw new Error('Please fill in all required fields: Name, Acronym, Year Founded, Address');
      }

      // Website validation
      if (formData.website && !formData.website.startsWith('http')) {
        throw new Error('Website URL must start with http:// or https://');
      }

      // Email validation (legal representative email only)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.legalRepresentativeEmail)) {
        throw new Error('Please enter a valid email address');
      }

      // Prepare the data in the requested format
      const dataToSend = {
        logo: formData.logo ? formData.logo.name : '', // Send the logo filename, not the file itself
        name: formData.name,
        acronym: formData.acronym,
        yearFounded: parseInt(formData.yearFounded, 10),
        address: formData.address,
        website: formData.website,
        legalRepresentativeName: formData.legalRepresentativeName,
        legalRepresentativeGender: formData.legalRepresentativeGender,
        legalRepresentativeEmail: formData.legalRepresentativeEmail,
        legalRepresentativePhone: formData.legalRepresentativePhone,
      };

      // Log the final formatted data for debugging
      console.log('Data being sent:', dataToSend);

      // Define the API URL and HTTP method based on editing mode
      const apiUrl = isEditing
        ? `/federations/${formData.id}` // Use the federation ID for PUT requests
        : '/federations'; // POST request for new federation

      const method = isEditing ? 'put' : 'post';

      // Make API request to the backend
      const response = await axiosInstance[method](apiUrl, dataToSend, {
        headers: {
          'Content-Type': 'application/json', // Sending JSON, no need for multipart/form-data anymore
        },
      });

      toast.success(isEditing ? 'Federation updated successfully!' : 'Federation added successfully!');
      onSubmit(response.data);
      onCancel();
      window.location.reload();
    } catch (error) {
      console.error('API Error:', error);
      toast.error(error.response?.data?.message || error.message || 'An error occurred while processing the request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-4">
   <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
  {/* Logo Upload */}
  <div>
    <label className="block text-sm font-medium mb-2">Logo</label>
    <div className="flex items-center gap-4">
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          className="w-20 h-20 object-cover rounded-lg"
        />
      )}
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full"
      />
    </div>
  </div>

  {/* Basic Information */}
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">Name</label>
      <Input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Acronym</label>
      <Input
        type="text"
        name="acronym"
        value={formData.acronym}
        onChange={handleChange}
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Year Founded</label>
      <Input
        type="number"
        name="yearFounded"
        value={formData.yearFounded}
        onChange={handleChange}
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Address</label>
      <Input
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
        required
      />
    </div>
  </div>

  {/* Website and Login Information */}
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">Website</label>
      <Input
        type="url"
        name="website"
        value={formData.website}
        onChange={handleChange}
        placeholder="e.g., http://www.example.com"
      />
    </div>
  </div>
 

  {/* Legal Representative Information */}
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">Federation Representative Name</label>
      <Input
        type="text"
        name="legalRepresentativeName"
        value={formData.legalRepresentativeName}
        onChange={handleChange}
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Federation Representative Gender</label>
      <select
        name="legalRepresentativeGender"
        value={formData.legalRepresentativeGender}
        onChange={handleChange}
        required
        className="w-full border rounded-lg p-2"
      >
        <option value="">Select</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Federation Representative Email</label>
      <Input
        type="email"
        name="legalRepresentativeEmail"
        value={formData.legalRepresentativeEmail}
        onChange={handleChange}
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Federation Representative Phone</label>
      <Input
        type="tel"
        name="legalRepresentativePhone"
        value={formData.legalRepresentativePhone}
        onChange={handleChange}
        required
      />
    </div>
  </div>

  {/* Form Actions */}
  <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex justify-end gap-4">
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
      disabled={loading}
    >
      {loading ? 'Submitting...' : (isEditing ? 'Update Federation' : 'Add Federation')}
    </Button>
  </div>
</form>

    </div>
  );
};

export default AddFederationForm;
