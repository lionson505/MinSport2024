import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import data from '../data/data.json';
import { countries } from '../data/countries';
import { institutionTypes } from '../data/institutionTypes';
import { classOptions } from '../data/classOptions';
import { gameTypes } from '../data/gameTypes';

function AddAcademyStudent({ isOpen, onClose, onAdd, studentData = null, isEditing = false, handleAddStudent }) {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    photo_passport: "",
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    placeOfBirth: '',
    placeOfResidence: '',
    idPassportNo: '',
    nationality: '',
    otherNationality: '',
    namesOfParentsGuardian: '',
    nameOfSchoolAcademyTrainingCenter: '',
    typeOfSchoolAcademyTrainingCenter: '',
    class: '',
    typeOfGame: '',
    contact: ''
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [academies, setAcademies] = useState([]);

  useEffect(() => {
    const fetchAcademies = async () => {
      try {
        const response = await axiosInstance.get('/academies');
        setAcademies(response.data);
      } catch (error) {
        console.error('Error fetching academies:', error);
        toast.error('Failed to fetch academies');
      }
    };

    fetchAcademies();
  }, []);

  useEffect(() => {
    if (studentData) {
      setFormData(studentData);
      if (typeof studentData.photo_passport === 'string') {
        setPreviewUrl(studentData.photo_passport);
      } else if (studentData.photo_passport instanceof File) {
        setPreviewUrl(URL.createObjectURL(studentData.photo_passport));
      }
    }
  }, [studentData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo_passport: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditStudent = async (formDataToSend, studentId) => {
    try {
      console.log('Sending data:', Object.fromEntries(formDataToSend.entries()));
      
      const response = await axiosInstance.put(`/academy-students/${studentId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Student updated successfully');
      return response;
    } catch (error) {
      console.error('API Error Details:', {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || 'Failed to update student';
      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      const requiredFields = [
        'firstName',
        'lastName',
        'dateOfBirth',
        'gender',
        'placeOfResidence',
        'idPassportNo',
        'nationality',
        'namesOfParentsGuardian',
        'nameOfSchoolAcademyTrainingCenter',
        'typeOfSchoolAcademyTrainingCenter',
        'class',
        'typeOfGame'
      ];

      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      if (!isEditing && typeof handleAddStudent !== 'function') {
        throw new Error('handleAddStudent prop is required for adding new students');
      }

      const formDataToSend = new FormData();
      const dateFields = ['dateOfBirth'];
      
      Object.keys(formData).forEach(key => {
        if (dateFields.includes(key) && formData[key]) {
          const date = new Date(formData[key]);
          formDataToSend.append(key, date.toISOString().split('T')[0]);
        } else if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (isEditing) {
        const response = await handleEditStudent(formDataToSend, formData.id);
        console.log('Edit response:', response);
        onAdd(response.data);
      } else {
        await handleAddStudent(formDataToSend);
      }

      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error.message || 'An error occurred while submitting the form');
    }
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
            <Dialog.Panel className={`w-full max-w-2xl transform overflow-hidden rounded-lg ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
            } p-6 text-left align-middle shadow-xl transition-all`}>
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-xl font-bold">
                  {isEditing ? 'Edit Academy Student' : 'Add Academy Student'}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-1 text-sm font-medium">Photo Passport</label>
                  <div className="flex items-center space-x-4">
                    {previewUrl && (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.photo_passport ? formData.photo_passport.name : 'No file chosen'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      required
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">Select Gender</option>
                      {data.genderOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">Place of Birth</label>
                    <Input
                      type="text"
                      value={formData.placeOfBirth}
                      onChange={(e) => setFormData(prev => ({ ...prev, placeOfBirth: e.target.value }))}
                      placeholder="Enter place of birth"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Place of Residence <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.placeOfResidence}
                      onChange={(e) => setFormData(prev => ({ ...prev, placeOfResidence: e.target.value }))}
                      required
                      placeholder="Enter place of residence"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      ID/Passport No <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.idPassportNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, idPassportNo: e.target.value }))}
                      required
                      placeholder="Enter ID or Passport number"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Nationality <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.nationality}
                      onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                      required
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">Select Nationality</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">Other Nationality</label>
                    <select
                      value={formData.otherNationality}
                      onChange={(e) => setFormData(prev => ({ ...prev, otherNationality: e.target.value }))}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">Select Other Nationality</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Names of Parents/Guardian <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.namesOfParentsGuardian}
                      onChange={(e) => setFormData(prev => ({ ...prev, namesOfParentsGuardian: e.target.value }))}
                      required
                      placeholder="Enter parent/guardian names"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      School/Academy Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.nameOfSchoolAcademyTrainingCenter}
                      onChange={(e) => setFormData(prev => ({ ...prev, nameOfSchoolAcademyTrainingCenter: e.target.value }))}
                      required
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">Select School/Academy</option>
                      {academies.map(academy => (
                        <option key={academy.id} value={academy.name}>{academy.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Type of School/Academy <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.typeOfSchoolAcademyTrainingCenter}
                      onChange={(e) => setFormData(prev => ({ ...prev, typeOfSchoolAcademyTrainingCenter: e.target.value }))}
                      required
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">Select Type</option>
                      {institutionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.class}
                      onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
                      required
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">Select Class</option>
                      {classOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Type of Game <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.typeOfGame}
                      onChange={(e) => setFormData(prev => ({ ...prev, typeOfGame: e.target.value }))}
                      required
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">Select Game Type</option>
                      {gameTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium">Contact</label>
                  <Input
                    type="tel"
                    value={formData.contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="Enter contact number"
                  />
                </div>

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
                    {isEditing ? 'Update Student' : 'Add Student'}
                  </Button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default AddAcademyStudent;
