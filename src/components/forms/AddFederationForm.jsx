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
  
    // Prevent multiple submissions
    if (loading) return;
  
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
  
      // Create FormData object for sending both text fields and the file
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('acronym', formData.acronym);
      formDataToSend.append('yearFounded', parseInt(formData.yearFounded, 10));
      formDataToSend.append('address', formData.address);
      formDataToSend.append('website', formData.website);
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo); // Append the actual file, not just the filename
      }
  
      // Log the final formatted data for debugging
      console.log('Data being sent:', formDataToSend);
  
      // Define the API URL and HTTP method based on editing mode
      const apiUrl = isEditing
        ? `/federations/${formData.id}` // Use the federation ID for PUT requests
        : '/federations'; // POST request for new federation
  
      const method = isEditing ? 'put' : 'post';
  
      // Make API request to the backend using FormData
      const response = await axiosInstance[method](apiUrl, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data', // Ensure the request is sent as multipart/form-data
        },
      });
  
      // Show success toast notification
      toast.success(isEditing ? 'Federation updated successfully!' : 'Federation added successfully!');
      onSubmit(response.data);
      onCancel();
      window.location.reload();
    } catch (error) {
      // Show error toast notification
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

        {/* Website */}
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
