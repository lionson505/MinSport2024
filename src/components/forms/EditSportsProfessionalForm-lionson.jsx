import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { toast } from 'react-hot-toast';
import axios from '../../utils/axiosInstance'; // Ensure this import points to the correct file

const EditSportsProfessionalForm = ({ onCancel, isSubmitting }) => {
  const [idType, setIdType] = useState('nid');
  const [idNumber, setIdNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [idError, setIdError] = useState('');
  const [isLoadingNIDA, setIsLoadingNIDA] = useState(false);
  const [nidaData, setNidaData] = useState(null);
  const [formData, setFormData] = useState({
    function: 'lionson',
    email: '',
    phone: '',
    status: 'ACTIVE',  // Default status updated to ACTIVE
    maritalStatus: '',
    region: '',
    discipline: '',
    license: '',
    otherNationality: '',
    placeOfResidence: '',
    fitnessStatus: 'FIT', // Default fitness status is FIT
    levelOfEducation: 'ELEMENTARY', // Default education level set to ELEMENTARY
    periodOfExperience: '',
    resume: ''
  });

  const handleNIDLookup = async () => {
    setIdError('');

    // Validate ID format
    if (idType === 'nid') {
      if (!/^\d{16}$/.test(idNumber)) {
        setIdError('National ID must be exactly 16 digits');
        return;
      }
    } else {
      // Passport validation
      if (!/^[A-Z0-9]{6,9}$/.test(idNumber)) {
        setIdError('Invalid passport format');
        return;
      }

      if (!passportExpiry) {
        setIdError('Passport expiry date is required');
        return;
      }

      const expiryDate = new Date(passportExpiry);
      if (expiryDate < new Date()) {
        setIdError('Passport has expired');
        return;
      }
    }

    setIsLoadingNIDA(true);
    try {
      const response = await axios.get(`/player-staff/citizen/${idNumber}`); // Use axiosInstance baseURL
      console.log('Frontend: Raw API response data:', response.data);

      const statusCode = response?.data?.status_code ?? response?.status;
      const details = response?.data?.details;

      if (statusCode === 200 && details) {
        const newNidaData = {
          names: `${details.first_name || ''} ${details.last_name || ''}`.trim(),
          dateOfBirth: details.dob || '',
          gender: details.gender || '',
          nationality: details.nationality || 'Rwanda', // Default to Rwanda if not provided
          placeOfBirth: details.placeOfBirth || '',
          photo: details.photo || ''
        };
        setNidaData(newNidaData);
        console.log('Frontend: NIDA data set to:', newNidaData);
        toast.success('ID verified successfully');
      } else {
        setNidaData(null);
        console.log('Frontend: No NIDA details found in response.');
        const message = response?.data?.message || (statusCode === 404 ? 'ID not found' : 'Failed to verify ID');
        toast.error(message);
      }
    } catch (error) {
      setNidaData(null);
      const status = error.response?.status || error.response?.data?.status_code;
      if (status === 404) {
        toast.error('ID not found');
      } else {
        toast.error(error.response?.data?.message || 'An error occurred while verifying ID');
      }
    } finally {
      setIsLoadingNIDA(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nidaData) {
      toast.error('Please verify ID first');
      return;
    }

    // Combine NIDA data with form data into the desired format
    const submitData = {
      idPassportNo: idNumber,
      passportPicture: nidaData.photo,
      firstName: nidaData.names.split(' ')[0],
      lastName: nidaData.names.split(' ')[1] || '',
      dateOfBirth: nidaData.dateOfBirth,
      gender: nidaData.gender.toUpperCase(),
      maritalStatus: formData.maritalStatus,
      region: formData.region,
      discipline: formData.discipline,
      function: formData.function,
      license: formData.license,
      nationality: nidaData.nationality,
      otherNationality: formData.otherNationality,
      placeOfResidence: formData.placeOfResidence,
      placeOfBirth: nidaData.placeOfBirth,
      fitnessStatus: formData.fitnessStatus,
      levelOfEducation: formData.levelOfEducation,
      periodOfExperience: formData.periodOfExperience,
      status: formData.status,
      resume: formData.resume
    };

    // Make POST request with axiosInstance
    try {
      // console.log(submitData);
      const response = await axios.post('/official-referees', submitData); // Adjust the endpoint as per your API
      if (response.status === 200) {
        toast.success('Professional Edited successfully');
        // Call onSubmit if provided
        if (typeof onSubmit === 'function') {
          onSubmit(response.data); // Pass back the response data if needed
        }
      } else {
        toast.error('Failed to Edit professional');
      }
    } catch (error) {
      toast.error('An error occurred while submitting the form');
      console.error(error);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ID Type Selection */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="idType"
                value="nid"
                checked={idType === 'nid'}
                onChange={(e) => {
                  setIdType(e.target.value);
                  setIdNumber('');
                  setIdError('');
                  setNidaData(null);
                }}
                className="mr-2"
              />
              National ID
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="idType"
                value="passport"
                checked={idType === 'passport'}
                onChange={(e) => {
                  setIdType(e.target.value);
                  setIdNumber('');
                  setIdError('');
                  setNidaData(null);
                }}
                className="mr-2"
              />
              Passport
            </label>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                {idType === 'nid' ? 'National ID Number' : 'Passport Number'}
              </label>
              <Input
                type="text"
                value={idNumber}
                onChange={(e) => {
                  setIdNumber(e.target.value);
                  setIdError('');
                }}
                className={idError ? 'border-red-500' : ''}
                placeholder={idType === 'nid' ? 'Enter 16-digit ID number' : 'Enter passport number'}
              />
            </div>

            {idType === 'passport' && (
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Passport Expiry Date
                </label>
                <Input
                  type="date"
                  value={passportExpiry}
                  onChange={(e) => {
                    setPassportExpiry(e.target.value);
                    setIdError('');
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className={idError ? 'border-red-500' : ''}
                />
              </div>
            )}

            <Button
              type="button"
              onClick={handleNIDLookup}
              disabled={isLoadingNIDA || !idNumber || (idType === 'passport' && !passportExpiry)}
            >
              {isLoadingNIDA ? 'Verifying...' : 'Verify ID'}
            </Button>
          </div>

          {idError && (
            <p className="text-sm text-red-500 mt-1">{idError}</p>
          )}
        </div>

        {/* Personal Information - Read-only from NIDA */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Passport Photo</label>
            {nidaData?.photo && (
              <img
                src={`data:image/jpeg;base64,${nidaData.photo}`}
                alt="National ID Photo"
                className="mt-2 max-w-[200px] rounded-lg border"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <Input
              value={nidaData?.names || ''}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth</label>
            <Input
              value={nidaData?.dateOfBirth || ''}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select
              value={nidaData?.gender || ''}
              readOnly
              className="bg-gray-50 h-12 w-full px-4 border border-gray-300 rounded-md"
              disabled // Make it disabled as it's read-only
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nationality</label>
            <Input
              value={nidaData?.nationality || ''}
              readOnly
              className="bg-gray-50"
            />
          </div>
        </div>

        {/* Edititional Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Marital Status</label>
            <Input
              value={formData.maritalStatus}
              onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Region</label>
            <Input
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Discipline</label>
            <Input
              value={formData.discipline}
              onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">License</label>
            <Input
              value={formData.license}
              onChange={(e) => setFormData({ ...formData, license: e.target.value })}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 justify-end">
          <Button type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>Submit</Button>
        </div>
      </form>
    </div>
  );
};

export default EditSportsProfessionalForm;
