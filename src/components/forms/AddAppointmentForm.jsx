import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';
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
    names: 'John Doe',
    gender: 'Male',
    email: 'johndoe@example.com',
    cellphone: '1234567890',
    purpose: 'Discussing new project proposals',
    request_date: '2024-10-16T00:00:00.000Z',
    request_time: '2024-10-16T09:30:00.000Z',
    institution: '',
    function: '',
    other_people_to_attend: 'Jane Smith, Mark Brown',
    other_ministry_staff: 'Secretary, Assistant',
  });

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

    try {
      const response = await axiosInstance.post('/appointments', formData);
      console.log('Response:', response);

      setToastMessage('Appointment submitted successfully!');
      onSubmit && onSubmit(formData);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            <Input
              type="text"
              value={formData.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              placeholder="Enter gender"
            />
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
            <Input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              required
              placeholder="Enter purpose"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Request Date
            </label>
            <Input
              type="datetime-local"
              value={formData.request_date}
              onChange={(e) => setFormData(prev => ({ ...prev, request_date: e.target.value }))}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">
              Request Time
            </label>
            <Input
              type="datetime-local"
              value={formData.request_time}
              onChange={(e) => setFormData(prev => ({ ...prev, request_time: e.target.value }))}
            />
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
    </div>
  );
};

export default AddAppointmentForm;
