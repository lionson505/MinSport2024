import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { X, Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import toast from 'react-hot-toast';

function AddAppointmentModal({ isOpen, onClose, onAdd }) {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    personToMeet: 'PS', // Default to PS
    fullName: '',
    gender: '',
    email: '',
    phone: '',
    purpose: '',
    requestDate: '',
    requestTime: '',
    institution: '',
    title: '',
    otherAttendees: '',
    otherStaff: ''
  });

  const [showCalendar, setShowCalendar] = useState(false);

  // Time slots
  const timeSlots = [
    "09:00 - 09:30", "09:30 - 10:00", 
    "10:00 - 10:30", "10:30 - 11:00",
    "11:00 - 11:30", "11:30 - 12:00",
    "14:00 - 14:30", "14:30 - 15:00",
    "15:00 - 15:30", "15:30 - 16:00",
    "16:00 - 16:30", "16:30 - 17:00"
  ];

  const genderOptions = ["Male", "Female", "Other"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Basic validation
      if (!formData.fullName || !formData.email || !formData.phone || !formData.purpose) {
        throw new Error('Please fill in all required fields');
      }

      // Phone number validation (Rwanda format)
      const phoneRegex = /^(\+?25)?(07[238]\d{7})$/;
      if (!phoneRegex.test(formData.phone)) {
        throw new Error('Please enter a valid Rwandan phone number');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      await onAdd(formData);
      onClose();
      toast.success('Appointment request submitted successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDateSelect = (date) => {
    setFormData(prev => ({
      ...prev,
      requestDate: date.toISOString().split('T')[0]
    }));
    setShowCalendar(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full max-w-2xl transform overflow-hidden rounded-lg ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
              } p-6 text-left align-middle shadow-xl transition-all`}>
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-xl font-bold">
                    Add Appointment Request
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Person to Meet */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">Person to Meet</label>
                    <select
                      value={formData.personToMeet}
                      onChange={(e) => setFormData(prev => ({ ...prev, personToMeet: e.target.value }))}
                      className="w-full border rounded-lg p-2"
                      required
                    >
                      <option value="PS">PS</option>
                      <option value="Minister">Minister</option>
                    </select>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Your Names</label>
                      <Input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full border rounded-lg p-2"
                        required
                      >
                        <option value="">Select Gender</option>
                        {genderOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Phone Number</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        required
                        placeholder="07X XXX XXXX"
                      />
                    </div>
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">Purpose of the Meeting</label>
                    <textarea
                      value={formData.purpose}
                      onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                      required
                      className="w-full border rounded-lg p-2 min-h-[100px]"
                      placeholder="Describe the purpose of your meeting"
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Request Date</label>
                      <div className="relative">
                        <Input
                          type="text"
                          value={formData.requestDate}
                          onClick={() => setShowCalendar(true)}
                          readOnly
                          placeholder="Select date"
                          required
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        {showCalendar && (
                          <div className="absolute z-10 mt-1 bg-white shadow-lg rounded-lg">
                            <DayPicker
                              mode="single"
                              selected={formData.requestDate ? new Date(formData.requestDate) : undefined}
                              onSelect={handleDateSelect}
                              disabled={[
                                { before: new Date() },
                                { dayOfWeek: [0, 6] } // Disable weekends
                              ]}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Request Time</label>
                      <select
                        value={formData.requestTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, requestTime: e.target.value }))}
                        className="w-full border rounded-lg p-2"
                        required
                      >
                        <option value="">Select Time</option>
                        {timeSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Institution and Title */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Institution/Company</label>
                      <Input
                        type="text"
                        value={formData.institution}
                        onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                        placeholder="Enter institution/company name (if any)"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Function/Title</label>
                      <Input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter your function/title"
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Other People to Attend</label>
                      <Input
                        type="text"
                        value={formData.otherAttendees}
                        onChange={(e) => setFormData(prev => ({ ...prev, otherAttendees: e.target.value }))}
                        placeholder="List other attendees (if any)"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Other Ministry Staff</label>
                      <Input
                        type="text"
                        value={formData.otherStaff}
                        onChange={(e) => setFormData(prev => ({ ...prev, otherStaff: e.target.value }))}
                        placeholder="Other ministry staff met before"
                      />
                    </div>
                  </div>

                  {/* Contact Information Note */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">
                      For follow-up inquiries, please contact the Assistant to the MINISTER at: 
                      <span className="font-medium"> 0785336905</span>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Submit Request
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default AddAppointmentModal; 