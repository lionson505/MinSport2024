import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import axiosInstance from '../../utils/axiosInstance';

const BookingRequestModal = ({ isOpen, onClose, infrastructure }) => {
  const [formData, setFormData] = useState({
    infraCategoryId: '',
    infraSubCategoryId: '',
    infrastructureId: '',
    name: '',
    gender: '',
    email: '',
    phone: '',
    reason: '',
    bookingDateFrom: '',
    bookingDateTo: '',
    bookingTimeFrom: '',
    bookingTimeTo: '',
    status: 'Pending'
  });

  const [categories, setCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [infrastructures, setInfrastructures] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/infrastructure-categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('Failed to fetch categories');
      }
    };

    const fetchSubCategories = async () => {
      try {
        const response = await axiosInstance.get('/infrastructure-subcategories');
        setAllSubCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch sub-categories:', error);
        toast.error('Failed to fetch sub-categories');
      }
    };

    const fetchInfrastructures = async () => {
      try {
        const response = await axiosInstance.get('/infrastructures');
        setInfrastructures(response.data);
      } catch (error) {
        console.error('Failed to fetch infrastructures:', error);
        toast.error('Failed to fetch infrastructures');
      }
    };

    fetchCategories();
    fetchSubCategories();
    fetchInfrastructures();
  }, []);

  useEffect(() => {
    if (formData.infraCategoryId) {
      const filtered = allSubCategories.filter(
        (subCategory) => subCategory.categoryId === parseInt(formData.infraCategoryId)
      );
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories([]);
    }
  }, [formData.infraCategoryId, allSubCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookingRequest = {
        infraCategoryId: formData.infraCategoryId,
        infraSubCategoryId: formData.infraSubCategoryId,
        infrastructureId: formData.infrastructureId,
        name: formData.name,
        gender: formData.gender,
        email: formData.email,
        phone: formData.phone,
        reason: formData.reason,
        bookingDateFrom: new Date(formData.bookingDateFrom).toISOString(),
        bookingDateTo: new Date(formData.bookingDateTo).toISOString(),
        bookingTimeFrom: new Date(`${formData.bookingDateFrom}T${formData.bookingTimeFrom}`).toISOString(),
        bookingTimeTo: new Date(`${formData.bookingDateTo}T${formData.bookingTimeTo}`).toISOString(),
        status: formData.status
      };

      if (!bookingRequest.infraSubCategoryId) {
        throw new Error('Infrastructure Sub-Category ID is required');
      }

      await axiosInstance.post('/booking-requests', bookingRequest);
      toast.success('Booking request submitted successfully');
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Failed to submit booking request:', error);
      toast.error('Failed to submit booking request');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Book ${infrastructure?.name || 'Facility'}`}
    >
      <div className="max-h-[80vh] overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Infrastructure Category Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Infrastructure Category</label>
            <select
              value={formData.infraCategoryId}
              onChange={(e) => setFormData({ ...formData, infraCategoryId: e.target.value })}
              required
              className="border border-gray-300 rounded p-2 w-full"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Infrastructure Sub-Category Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Infrastructure Sub-Category</label>
            <select
              value={formData.infraSubCategoryId}
              onChange={(e) => setFormData({ ...formData, infraSubCategoryId: e.target.value })}
              required
              className="border border-gray-300 rounded p-2 w-full"
            >
              <option value="">Select Sub-Category</option>
              {filteredSubCategories.map((subCategory) => (
                <option key={subCategory.id} value={subCategory.id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>

          {/* Infrastructure Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Infrastructure</label>
            <select
              value={formData.infrastructureId}
              onChange={(e) => setFormData({ ...formData, infrastructureId: e.target.value })}
              required
              className="border border-gray-300 rounded p-2 w-full"
            >
              <option value="">Select Infrastructure</option>
              {infrastructures.map((infra) => (
                <option key={infra.id} value={infra.id}>
                  {infra.name}
                </option>
              ))}
            </select>
          </div>

          {/* Personal Information */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              required
              className="border border-gray-300 rounded p-2 w-full"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          {/* Booking Details */}
          <div>
            <label className="block text-sm font-medium mb-1">Reason for Booking</label>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Booking Date From</label>
              <Input
                type="date"
                value={formData.bookingDateFrom}
                onChange={(e) => setFormData({ ...formData, bookingDateFrom: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Booking Date To</label>
              <Input
                type="date"
                value={formData.bookingDateTo}
                onChange={(e) => setFormData({ ...formData, bookingDateTo: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Booking Time From</label>
              <Input
                type="time"
                value={formData.bookingTimeFrom}
                onChange={(e) => setFormData({ ...formData, bookingTimeFrom: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Booking Time To</label>
              <Input
                type="time"
                value={formData.bookingTimeTo}
                onChange={(e) => setFormData({ ...formData, bookingTimeTo: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Submit Booking Request
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BookingRequestModal;
