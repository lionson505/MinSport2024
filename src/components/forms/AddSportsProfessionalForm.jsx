import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { toast } from 'react-hot-toast';
import axios from '../../utils/axiosInstance';
import { countries } from '../../data/countries'; // Import countries data

const AddSportsProfessionalForm = ({ onCancel, onSubmit, initialData = {}, isSubmitting }) => {
  const [idType, setIdType] = useState('nid');
  const [idNumber, setIdNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [idError, setIdError] = useState('');
  const [isLoadingNIDA, setIsLoadingNIDA] = useState(false);
  const [nidaData, setNidaData] = useState(null);
  const [formData, setFormData] = useState({
    function: 'lionson',
    email: 'q@gmail.com',
    phone: 'q',
    status: 'ACTIVE',
    maritalStatus: 'w',
    region: 'k',
    discipline: 's',
    license: 's',
    otherNationality: 's',
    placeOfResidence: 's',
    fitnessStatus: 'FIT',
    levelOfEducation: 'ELEMENTARY',
    periodOfExperience: 'sa',
    resume: 'l.p',
    ...initialData // Spread initial data to override defaults if provided
  });
  const [disciplines, setDisciplines] = useState([]);
  const [functions, setFunctions] = useState([]);

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
    { value: 'SECONDARY', label: 'Secondary' },
    { value: 'BACHELOR', label: 'Bachelor' },
    { value: 'MASTER', label: 'Master' },
    { value: 'PHD', label: 'PhD' }
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
        const response = await axios.get('/disciplines'); // Adjust the endpoint as needed
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
        const response = await axios.get('/functions'); // Adjust endpoint as needed
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Two example NIDA responses
      const nidaResponses = {
        '1199880012345678': {
          documentNumber: '1199880012345678',
          names: "NSHUTI Jean Baptiste",
          dateOfBirth: "1995-02-19",
          gender: "MALE",
          nationality: "Rwandan",
          placeOfBirth: "Kigali",
          photo: "base64_encoded_photo_string"
        },
        '1199770012345678': {
          documentNumber: '1199770012345678',
          names: "UWASE Marie Claire",
          dateOfBirth: "1997-06-15",
          gender: "FEMALE",
          nationality: "Rwandan",
          placeOfBirth: "Musanze",
          photo: "base64_encoded_photo_string"
        }
      };

      const response = nidaResponses[idNumber] || nidaResponses['1199880012345678']; // Default to first example if ID not found
      
      setNidaData(response);
      toast.success('ID verified successfully');
    } catch (error) {
      toast.error('Failed to verify ID');
      setNidaData(null);
    } finally {
      setIsLoadingNIDA(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all required fields are filled
    if (!idNumber || !nidaData || !formData.maritalStatus || !formData.region || !formData.discipline || !formData.license) {
      toast.error('Please fill in all required fields');
      return;
    }

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

    try {
      let response;
      if (initialData.id) {
        // Update existing professional
        response = await axios.put(`/official-referees/${initialData.id}`, submitData);
        if (response.data) {
          toast.success('Professional updated successfully');
        }
      } else {
        // Add new professional
        response = await axios.post('/official-referees', submitData);
        if (response.data) {
          toast.success('Professional added successfully');
        }
      }

      if (typeof onSubmit === 'function') {
        onSubmit(response.data);
      }
      
      // Reload the page after successful submission
      window.location.reload();
    } catch (error) {
      console.error('API Error:', error);
      // More specific error messages based on the error response
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(error.response.data?.message || 'Server error occurred');
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
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
      <Input
        value={nidaData?.gender || ''}
        readOnly
        className="bg-gray-50"
      />
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

  <div>
    <label className="block text-sm font-medium mb-1">Resume</label>
    <Input
      type="file"
      accept=".pdf,.doc,.docx"
      onChange={(e) => {
        const fileName = e.target.files[0]?.name || '';
        setFormData({ ...formData, resume: fileName });
      }}
    />
    {formData.resume && (
      <p className="text-sm text-gray-600 mt-1">Selected file: {formData.resume}</p>
    )}
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
