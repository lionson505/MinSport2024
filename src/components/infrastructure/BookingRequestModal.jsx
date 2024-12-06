import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { toast } from 'sonner';
import axiosInstance from '../../utils/axiosInstance'; // Import axiosInstance

const BookingRequestModal = ({ isOpen, onClose, infrastructure }) => {
  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null,
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
    organizerName: '',
    organizerPhone: '',
    organizerEmail: '',
    additionalNotes: '',
    infraCategory: '' // Add infraCategory to formData
  });

  const [categories, setCategories] = useState([]);

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

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookingRequest = {
        infrastructure_id: formData.infraCategory,
        start_date: "10/10/2020",
        end_date: "11/11/202",
        start_time: formData.startTime,
        end_time: formData.endTime,
        purpose: formData.purpose,
        expected_attendees: formData.expectedAttendees,
        organizer_name: formData.organizerName,
        organizer_phone: formData.organizerPhone,
        organizer_email: formData.organizerEmail,
        additional_notes: formData.additionalNotes,
        // infra_category: formData.infraCategory, // Include infraCategory
        status: 'Pending'
      };

      // API call to submit booking request
      console.log(bookingRequest)
      await axiosInstance.post('/booking-requests', bookingRequest);
      toast.success('Booking request submitted successfully');
      onClose();
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
          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Calendar
                selected={formData.startDate}
                onSelect={(date) => setFormData({ ...formData, startDate: date })}
                minDate={new Date()}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Calendar
                selected={formData.endDate}
                onSelect={(date) => setFormData({ ...formData, endDate: date })}
                minDate={formData.startDate || new Date()}
                required
              />
            </div>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Event Details */}
          <div>
            <label className="block text-sm font-medium mb-1">Purpose of Booking</label>
            <Input
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g., Sports Tournament, Training Session"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Expected Number of Attendees</label>
            <Input
              type="number"
              value={formData.expectedAttendees}
              onChange={(e) => setFormData({ ...formData, expectedAttendees: e.target.value })}
              required
            />
          </div>

          {/* Infrastructure Category Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Infrastructure Category</label>
            <select
              value={formData.infraCategory}
              onChange={(e) => setFormData({ ...formData, infraCategory: e.target.value })}
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

          {/* Organizer Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Organizer Name</label>
              <Input
                value={formData.organizerName}
                onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <Input
                type="tel"
                value={formData.organizerPhone}
                onChange={(e) => setFormData({ ...formData, organizerPhone: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={formData.organizerEmail}
              onChange={(e) => setFormData({ ...formData, organizerEmail: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Additional Notes</label>
            <Textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              rows={3}
              placeholder="Any special requirements or additional information"
            />
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
