import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';

function AppointmentForm({ appointment, onSubmit, onCancel }) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState(appointment || {
    time: '',
    name: '',
    phone: '',
    message: '',
    location: 'MINISPORTS OFFICE',
    status: 'Scheduled'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      showToast('Appointment saved successfully');
    } catch (error) {
      showToast('Failed to save appointment', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#1B2559] mb-2">
            Time
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-[#E2E7F0] focus:outline-none focus:ring-2 focus:ring-[#4318FF]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1B2559] mb-2">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-[#E2E7F0] focus:outline-none focus:ring-2 focus:ring-[#4318FF]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1B2559] mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-[#E2E7F0] focus:outline-none focus:ring-2 focus:ring-[#4318FF]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1B2559] mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-[#E2E7F0] focus:outline-none focus:ring-2 focus:ring-[#4318FF]"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-[#1B2559] mb-2">
            Message
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-[#E2E7F0] focus:outline-none focus:ring-2 focus:ring-[#4318FF] h-32"
            required
          />
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded-lg border border-[#E2E7F0] text-[#A3AED0] hover:bg-[#F4F7FE]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-[#4318FF] text-white hover:bg-[#3311CC]"
        >
          Save
        </button>
      </div>
    </form>
  );
}

export default AppointmentForm; 