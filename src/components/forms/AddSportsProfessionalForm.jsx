/* src/components/forms/AddSportsProfessionalForm.jsx */
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { toast } from 'react-hot-toast';
import axios from '../../utils/axiosInstance';

const AddSportsProfessionalForm = ({ onCancel, onSubmit, initialData = {}, isSubmitting }) => {
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
      const response = {
        documentNumber: idNumber,
        names: "NSHUTI Jean Baptiste",
        dateOfBirth: "1995-02-19",
        gender: "MALE",
        nationality: "Rwandan",
        placeOfBirth: "Kigali",
        photo: "base64_encoded_photo_string"
      };

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

    if (!nidaData) {
      toast.error('Please verify ID first');
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
        if (response.status === 200) {
          toast.success('Professional updated successfully');
        } else {
          toast.error('Failed to update professional');
        }
      } else {
        // Add new professional
        response = await axios.post('/official-referees', submitData);
        if (response.status === 200) {
          toast.success('Professional added successfully');
        } else {
          toast.error('Failed to add professional');
        }
      }

      if (typeof onSubmit === 'function') {
        onSubmit(response.data);
      }
    } catch (error) {
      toast.error('An error occurred while submitting the form');
      console.error(error);
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

        <div className="grid grid-cols-2 gap-4">
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
