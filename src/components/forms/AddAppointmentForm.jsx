import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';
import { Calendar, Clock, X } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import axiosInstance from '../../utils/axiosInstance';

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg">
      {message}
    </div>
  );
};

const AddAppointmentForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    person_to_meet: 'MINISTER',
    names: '',
    gender: '',
    email: '',
    cellphone: '',
    purpose: '',
    request_date: '',
    request_time: '',
    institution: '',
    function: '',
    other_people_to_attend: '',
    other_ministry_staff: '',
  });

  // Time picker modal state
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const parseTime = (t) => {
    if (!t || !/^\d{2}:\d{2}$/.test(t)) return { h: '09', m: '00' };
    const [h, m] = t.split(':');
    return { h: h.padStart(2, '0'), m: m.padStart(2, '0') };
  };
  const initialTime = parseTime(formData.request_time);
  const [tempHour, setTempHour] = useState(initialTime.h);
  const [tempMinute, setTempMinute] = useState(initialTime.m);

  useEffect(() => {
    const { h, m } = parseTime(formData.request_time);
    setTempHour(h);
    setTempMinute(m);
  }, [isTimeModalOpen]);

  const [institutions, setInstitutions] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await axiosInstance.get('/institutions');
        setInstitutions(response.data);
      } catch (error) {
        console.error('Error fetching institutions:', error);
      }
    };

    const fetchFunctions = async () => {
      try {
        const response = await axiosInstance.get('/functions');
        setFunctions(response.data);
      } catch (error) {
        console.error('Error fetching functions:', error);
      }
    };

    fetchInstitutions();
    fetchFunctions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Build payload with proper DateTime formats expected by backend
    const buildIsoDate = (dateStr) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d.toISOString();
    };

    const buildIsoTime = (dateStr, timeStr) => {
      if (!timeStr) return null;
      // Combine selected date (or today) with selected time
      const base = dateStr ? new Date(dateStr) : new Date();
      const [hh, mm] = timeStr.split(':');
      if (hh == null || mm == null) return null;
      const combined = new Date(base);
      combined.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
      return combined.toISOString();
    };

    const payload = {
      ...formData,
      request_date: buildIsoDate(formData.request_date),
      request_time: buildIsoTime(formData.request_date, formData.request_time),
    };

    try {
      const response = await axiosInstance.post('/appointments', payload);
      console.log('Response:', response);

      setToastMessage('Appointment submitted successfully!');
      onSubmit && onSubmit(payload);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.message || err.message);
      setToastMessage(`Error submitting appointment: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      <form onSubmit={handleSubmit} className="space-y-5 gap-5">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg">
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5">
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Person to Meet
            </label>
            <select
              value={formData.person_to_meet}
              onChange={(e) => setFormData(prev => ({ ...prev, person_to_meet: e.target.value }))}
              className="border rounded-lg p-2"
            >
              <option value="MINISTER">MINISTER</option>
              <option value="PS">PS</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.names}
              onChange={(e) => setFormData(prev => ({ ...prev, names: e.target.value }))}
              required
              placeholder="Enter full name"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              className="border rounded-lg p-2"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              placeholder="Enter email"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              value={formData.cellphone}
              onChange={(e) => setFormData(prev => ({ ...prev, cellphone: e.target.value }))}
              required
              placeholder="Enter phone number"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Purpose <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              required
              placeholder="Enter purpose"
              rows={3}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Request Date
            </label>
            <div className="relative">
              <Input
                type="date"
                value={formData.request_date}
                onChange={(e) => setFormData(prev => ({ ...prev, request_date: e.target.value }))}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Request Time
            </label>
            <button type="button" onClick={() => setIsTimeModalOpen(true)} className="relative w-full text-left border rounded-lg p-2 pl-10 hover:bg-gray-50">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              {formData.request_time ? formData.request_time : 'Select time'}
            </button>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Institution
            </label>
            <select
              value={formData.institution}
              onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
              className="border rounded-lg p-2"
            >
              <option value="">Select Institution</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.name}>
                  {inst.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Function
            </label>
            <select
              value={formData.function}
              onChange={(e) => setFormData(prev => ({ ...prev, function: e.target.value }))}
              className="border rounded-lg p-2"
            >
              <option value="">Select Function</option>
              {functions.map(func => (
                <option key={func.id} value={func.name}>
                  {func.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Other People to Attend
            </label>
            <Input
              type="text"
              value={formData.other_people_to_attend}
              onChange={(e) => setFormData(prev => ({ ...prev, other_people_to_attend: e.target.value }))}
              placeholder="Enter names"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Other Ministry Staff
            </label>
            <Input
              type="text"
              value={formData.other_ministry_staff}
              onChange={(e) => setFormData(prev => ({ ...prev, other_ministry_staff: e.target.value }))}
              placeholder="Enter names"
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Appointment'}
          </Button>
        </div>
      </form>

      {/* Time Picker Modal */}
      <Transition appear show={isTimeModalOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsTimeModalOpen(false)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-lg font-medium">Select Time</Dialog.Title>
                    <button onClick={() => setIsTimeModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Hour</label>
                      <select value={tempHour} onChange={(e) => setTempHour(e.target.value)} className="w-full border rounded-lg p-2">
                        {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Minute</label>
                      <select value={tempMinute} onChange={(e) => setTempMinute(e.target.value)} className="w-full border rounded-lg p-2">
                        {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" type="button" onClick={() => setIsTimeModalOpen(false)}>Cancel</Button>
                    <Button type="button" onClick={() => {
                      const value = `${tempHour}:${tempMinute}`;
                      setFormData((prev) => ({ ...prev, request_time: value }));
                      setIsTimeModalOpen(false);
                    }}>Set Time</Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default AddAppointmentForm;
