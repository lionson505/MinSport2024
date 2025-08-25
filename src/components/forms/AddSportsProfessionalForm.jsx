import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { countries } from '../../data/countries'; // Import countries data

const AddSportsProfessionalForm = ({ onCancel, onSubmit, initialData = {}, isSubmitting }) => {
  const [idType, setIdType] = useState('nid');
  const [idNumber, setIdNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [idError, setIdError] = useState('');
  const [isLoadingNIDA, setIsLoadingNIDA] = useState(false);
  const [formData, setFormData] = useState({
    function: '',
    email: '',
    phone: '',
    status: 'ACTIVE',
    maritalStatus: '',
    region: '',
    discipline: '',
    license: '',
    otherNationality: '',
    placeOfResidence: '',
    fitnessStatus: 'FIT',
    levelOfEducation: 'ELEMENTARY',
    periodOfExperience: '',
    resume: '',
    ...initialData // Spread initial data to override defaults if provided
  });
  const [disciplines, setDisciplines] = useState([]);
  const [functions, setFunctions] = useState([]);
  const [nidaData, setNidaData] = useState(null);

  // Predefined marital status options
  const maritalStatusOptions = [
    { value: '', label: 'Select marital status' },
    { value: 'SINGLE', label: 'Single' },
    { value: 'MARRIED', label: 'Married' },
    { value: 'DIVORCED', label: 'Divorced' },
    { value: 'WIDOWED', label: 'Widowed' }
  ];

  // Add these options after maritalStatusOptions
  const fitnessStatusOptions = [
    { value: '', label: 'Select fitness status' },
    { value: 'FIT', label: 'Fit' },
    { value: 'UNFIT', label: 'Unfit' }
  ];

  const educationLevelOptions = [
    { value: '', label: 'Select education level' },
    { value: 'ELEMENTARY', label: 'Elementary' },
    { value: 'HIGH_SCHOOL', label: 'High School' },
    { value: 'ASSOCIATE', label: 'Associate' },
    { value: 'BACHELOR', label: 'Bachelor' },
    { value: 'MASTER', label: 'Master' },
    { value: 'PROFESSIONAL', label: 'Professional' },
    { value: 'DOCTORATE', label: 'Doctorate' }
  ];

  const selectClassName = "h-12 w-full px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500";

  useEffect(() => {
    if (initialData.idPassportNo) {
      setIdNumber(initialData.idPassportNo);
      setNidaData({
        names: `${initialData.firstName} ${initialData.lastName}`,
        dateOfBirth: initialData.dateOfBirth,
        gender: initialData.gender,
        nationality: initialData.nationality,
        placeOfBirth: initialData.placeOfBirth,
        photo: initialData.passportPicture
      });
    }
  }, [initialData]);

  useEffect(() => {
    // Fetch disciplines from API
    const fetchDisciplines = async () => {
      try {
        const response = await axiosInstance.get('/disciplines'); // Adjust the endpoint as needed
        setDisciplines(response.data);
      } catch (error) {
        console.error('Failed to fetch disciplines', error);
      }
    };

    fetchDisciplines();
  }, []);

  useEffect(() => {
    // Fetch functions from API
    const fetchFunctions = async () => {
      try {
        const response = await axiosInstance.get('/functions'); // Adjust endpoint as needed
        setFunctions(response.data);
      } catch (error) {
        console.error('Failed to fetch functions', error);
      }
    };

    fetchFunctions();
  }, []);

  const handleNIDLookup = async () => {
    setIdError('');

    if (idType === 'nid') {
      if (!/^\d{16}$/.test(idNumber)) {
        setIdError('National ID must be exactly 16 digits');
        return;
      }
    } else {
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
      const response = await axiosInstance.get(`/player-staff/citizen/${idNumber}`);
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

  const handleChange = (e) => {
    const { name, files } = e.target;
    if (name === 'passportPicture' || name === 'resume') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('idPassportNo', idNumber || '');
    formDataToSubmit.append('firstName', nidaData?.names.split(' ')[0] || '');
    formDataToSubmit.append('lastName', nidaData?.names.split(' ')[1] || '');
    formDataToSubmit.append('dateOfBirth', nidaData?.dateOfBirth || '');
    formDataToSubmit.append('gender', nidaData?.gender.toUpperCase() || '');
    formDataToSubmit.append('maritalStatus', formData.maritalStatus || '');
    formDataToSubmit.append('region', formData.region || '');
    formDataToSubmit.append('discipline', formData.discipline || '');
    formDataToSubmit.append('function', formData.function || '');
    formDataToSubmit.append('license', formData.license || '');
    formDataToSubmit.append('nationality', nidaData?.nationality || '');
    formDataToSubmit.append('otherNationality', formData.otherNationality || '');
    formDataToSubmit.append('placeOfResidence', formData.placeOfResidence || '');
    formDataToSubmit.append('placeOfBirth', nidaData?.placeOfBirth || '');
    formDataToSubmit.append('fitnessStatus', formData.fitnessStatus || '');
    formDataToSubmit.append('levelOfEducation', formData.levelOfEducation || '');
    formDataToSubmit.append('periodOfExperience', formData.periodOfExperience || '');
    formDataToSubmit.append('status', formData.status || '');

    // Handle file inputs
    if (formData.resume) {
      formDataToSubmit.append('resume', formData.resume);
    }
    if (formData.passportPicture) {
      formDataToSubmit.append('passportPicture', formData.passportPicture);
    } else if (nidaData?.photo) {
      formDataToSubmit.append('passportPicture', nidaData.photo);
    }

    try {
      let response;
      if (initialData.id) {
        response = await axiosInstance.put(`/official-referees/${initialData.id}`, formDataToSubmit, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.data) {
          toast.success('Professional updated successfully');
        }
      } else {
        response = await axiosInstance.post('/official-referees', formDataToSubmit, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.data) {
          toast.success('Professional added successfully');
        }
      }

      if (typeof onSubmit === 'function') {
        onSubmit(response.data);
      }
    } catch (error) {
      console.error('API Error:', error);
      if (error.response) {
        if (error.response.data?.message.includes('already exists')) {
          toast.error('A record with this ID or Passport Number already exists.');
        } else {
          toast.error(error.response?.data?.message || 'Server error occurred');
        }
      } else if (error.request) {
        toast.error('No response from server. Please check your connection.');
      } else {
        toast.error('An error occurred while preparing the request');
      }
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="flex flex-col gap-4">
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Passport Picture</label>
            {idType === 'passport' ? (
              <input
                type="file"
                name="passportPicture"
                accept="image/*"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            ) : (
              <img
                src={`data:image/jpeg;base64,${nidaData?.photo || ''}`}
                alt="National ID Photo"
                className="mt-2 max-w-[200px] rounded-lg border"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <Input
              value={idType === 'passport' ? formData.names : nidaData?.names || ''}
              onChange={(e) => idType === 'passport' && setFormData({ ...formData, names: e.target.value })}
              readOnly={idType !== 'passport'}
              className={idType !== 'passport' ? 'bg-gray-50' : ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth</label>
            <Input
              type="date"
              value={idType === 'passport' ? formData.dateOfBirth : nidaData?.dateOfBirth || ''}
              onChange={(e) => idType === 'passport' && setFormData({ ...formData, dateOfBirth: e.target.value })}
              readOnly={idType !== 'passport'}
              className={idType !== 'passport' ? 'bg-gray-50' : ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select
              value={idType === 'passport' ? formData.gender : nidaData?.gender || ''}
              onChange={(e) => idType === 'passport' && setFormData({ ...formData, gender: e.target.value })}
              disabled={idType !== 'passport'}
              className={idType !== 'passport' ? 'bg-gray-50' : selectClassName}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nationality</label>
            <select
              value={idType === 'passport' ? formData.nationality : nidaData?.nationality || ''}
              onChange={(e) => idType === 'passport' && setFormData({ ...formData, nationality: e.target.value })}
              disabled={idType !== 'passport'}
              className={idType !== 'passport' ? 'bg-gray-50' : selectClassName}
            >
              <option value="">Select a nationality</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Marital Status</label>
            <select
              value={formData.maritalStatus}
              onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
              className={selectClassName}
            >
              {maritalStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
            <select
              value={formData.discipline}
              onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
              className={selectClassName}
            >
              <option value="">Select a discipline</option>
              {disciplines.map((discipline) => (
                <option key={discipline.id} value={discipline.name}>
                  {discipline.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">License</label>
            <Input
              value={formData.license}
              onChange={(e) => setFormData({ ...formData, license: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Function</label>
            <select
              value={formData.function}
              onChange={(e) => setFormData({ ...formData, function: e.target.value })}
              className={selectClassName}
            >
              <option value="">Select a function</option>
              {functions.map((func) => (
                <option key={func.id} value={func.name}>
                  {func.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Other Nationality</label>
            <select
        value={formData.otherNationality}
        onChange={(e) => setFormData({ ...formData, otherNationality: e.target.value })}
        className={selectClassName}
      >
        <option value="">Select a nationality</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>

          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Place of Residence</label>
            <Input
              value={formData.placeOfResidence}
              onChange={(e) => setFormData({ ...formData, placeOfResidence: e.target.value })}
              placeholder="Enter place of residence"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fitness Status</label>
            <select
              value={formData.fitnessStatus}
              onChange={(e) => setFormData({ ...formData, fitnessStatus: e.target.value })}
              className={selectClassName}
            >
              {fitnessStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Level of Education</label>
            <select
              value={formData.levelOfEducation}
              onChange={(e) => setFormData({ ...formData, levelOfEducation: e.target.value })}
              className={selectClassName}
            >
              {educationLevelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Period of Experience</label>
            <Input
              value={formData.periodOfExperience}
              onChange={(e) => setFormData({ ...formData, periodOfExperience: e.target.value })}
              placeholder="Enter period of experience"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Resume</label>
            <input
              type="file"
              name="resume"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
            {formData.resume && (
              <p className="text-sm text-gray-600 mt-1">Selected file: {formData.resume.name}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <Button type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {initialData.id ? 'Update' : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddSportsProfessionalForm;

