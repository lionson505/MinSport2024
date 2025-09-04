import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { rwandaLocations } from '../data/rwandaLocations';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

function AddAcademyModal({ isOpen, onClose, onAdd, academyData = null }) {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    sportsCategory: '',
    location: {
      province: '',
      district: '',
      sector: '',
      cell: '',
      village: ''
    },
    legalRepresentative: {
      name: '',
      gender: '',
      email: '',
      phone: ''
    }
  });

  useEffect(() => {
    if (academyData) {
      setFormData({
        name: academyData.name || '',
        domain: academyData.domain || '',
        sportsCategory: academyData.category || '',
        location: {
          province: academyData.location_province || '',
          district: academyData.location_district || '',
          sector: academyData.location_sector || '',
          cell: academyData.location_cell || '',
          village: academyData.location_village || ''
        },
        legalRepresentative: {
          name: academyData.legalRepresentativeName || '',
          gender: academyData.legalRepresentativeGender || '',
          email: academyData.legalRepresentativeEmail || '',
          phone: academyData.legalRepresentativePhone || ''
        }
      });
    }
  }, [academyData]);

  // Location states
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableSectors, setAvailableSectors] = useState([]);
  const [availableCells, setAvailableCells] = useState([]);
  const [availableVillages, setAvailableVillages] = useState([]);

  // Domain/Sports Category options (can be expanded)
  const domainOptions = ['Football', 'Basketball', 'Volleyball', 'Tennis', 'Swimming'];
  const categoryOptions = ['Excellence school', 'F.Center', 'Youth Center', 'Centre'];
  const genderOptions = ['Male', 'Female', 'Other'];

  // Handle location changes
  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        province,
        district: '',
        sector: '',
        cell: '',
        village: ''
      }
    }));

    if (province && rwandaLocations[province]) {
      setAvailableDistricts(Object.keys(rwandaLocations[province].districts));
    } else {
      setAvailableDistricts([]);
    }
    setAvailableSectors([]);
    setAvailableCells([]);
    setAvailableVillages([]);
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        district,
        sector: '',
        cell: '',
        village: ''
      }
    }));

    if (district && rwandaLocations[formData.location.province]?.districts[district]) {
      setAvailableSectors(Object.keys(rwandaLocations[formData.location.province].districts[district].sectors));
    } else {
      setAvailableSectors([]);
    }
    setAvailableCells([]);
    setAvailableVillages([]);
  };

  const handleSectorChange = (e) => {
    const sector = e.target.value;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        sector,
        cell: '',
        village: ''
      }
    }));

    if (sector && rwandaLocations[formData.location.province]?.districts[formData.location.district]?.sectors[sector]) {
      setAvailableCells(Object.keys(rwandaLocations[formData.location.province].districts[formData.location.district].sectors[sector].cells));
    } else {
      setAvailableCells([]);
    }
    setAvailableVillages([]);
  };

  const handleCellChange = (e) => {
    const cell = e.target.value;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        cell,
        village: ''
      }
    }));

    if (cell && rwandaLocations[formData.location.province]?.districts[formData.location.district]?.sectors[formData.location.sector]?.cells[cell]) {
      setAvailableVillages(rwandaLocations[formData.location.province].districts[formData.location.district].sectors[formData.location.sector].cells[cell]);
    } else {
      setAvailableVillages([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Basic validation
      if (!formData.name || !formData.domain || !formData.sportsCategory) {
        throw new Error('Please fill in all required fields');
      }

      // Location validation
      if (!formData.location.province || !formData.location.district || 
          !formData.location.sector || !formData.location.cell || !formData.location.village) {
        throw new Error('Please complete all location fields');
      }

      // Legal representative validation
      if (!formData.legalRepresentative.name || !formData.legalRepresentative.gender || 
          !formData.legalRepresentative.email || !formData.legalRepresentative.phone) {
        throw new Error('Please fill in all legal representative details');
      }

      // Phone validation (Rwanda format)
      const phoneRegex = /^(\+?25)?(07[238]\d{7})$/;
      if (!phoneRegex.test(formData.legalRepresentative.phone)) {
        throw new Error('Please enter a valid Rwandan phone number');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.legalRepresentative.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Transform formData to match the required format
      const transformedData = {
        name: formData.name,
        domain: formData.domain,
        category: formData.sportsCategory,
        location_province: formData.location.province,
        location_district: formData.location.district,
        location_sector: formData.location.sector,
        location_cell: formData.location.cell,
        location_village: formData.location.village,
        legalRepresentativeName: formData.legalRepresentative.name,
        legalRepresentativeGender: formData.legalRepresentative.gender,
        legalRepresentativeEmail: formData.legalRepresentative.email,
        legalRepresentativePhone: formData.legalRepresentative.phone
      };

      if (academyData && academyData.id) {
        // Update existing academy
        await axiosInstance.put(`/academies/${academyData.id}`, transformedData);
        toast.success('Academy updated successfully');
      } 

      onAdd(transformedData);
      onClose();
    } catch (error) {
      toast.error(error.message);
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
                    {academyData ? 'Edit Academy' : 'Add New Academy'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Academy Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        placeholder="Enter academy name"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Domain <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.domain}
                        onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                        required
                        className="w-full border rounded-lg p-2"
                      >
                        <option value="">Select Domain</option>
                        {domainOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Sports Category <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.sportsCategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, sportsCategory: e.target.value }))}
                      required
                      placeholder="Enter sports category"
                    />
                  </div>

                  {/* Location Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Location</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">Province</label>
                        <select
                          value={formData.location.province}
                          onChange={handleProvinceChange}
                          required
                          className="w-full border rounded-lg p-2"
                        >
                          <option value="">Select Province</option>
                          {Object.keys(rwandaLocations).map(province => (
                            <option key={province} value={province}>{province}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">District</label>
                        <select
                          value={formData.location.district}
                          onChange={handleDistrictChange}
                          required
                          disabled={!formData.location.province}
                          className="w-full border rounded-lg p-2"
                        >
                          <option value="">Select District</option>
                          {availableDistricts.map(district => (
                            <option key={district} value={district}>{district}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">Sector</label>
                        <select
                          value={formData.location.sector}
                          onChange={handleSectorChange}
                          required
                          disabled={!formData.location.district}
                          className="w-full border rounded-lg p-2"
                        >
                          <option value="">Select Sector</option>
                          {availableSectors.map(sector => (
                            <option key={sector} value={sector}>{sector}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Cell</label>
                        <select
                          value={formData.location.cell}
                          onChange={handleCellChange}
                          required
                          disabled={!formData.location.sector}
                          className="w-full border rounded-lg p-2"
                        >
                          <option value="">Select Cell</option>
                          {availableCells.map(cell => (
                            <option key={cell} value={cell}>{cell}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Village</label>
                        <select
                          value={formData.location.village}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            location: { ...prev.location, village: e.target.value }
                          }))}
                          required
                          disabled={!formData.location.cell}
                          className="w-full border rounded-lg p-2"
                        >
                          <option value="">Select Village</option>
                          {availableVillages.map(village => (
                            <option key={village} value={village}>{village}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Legal Representative Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Legal Representative</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          value={formData.legalRepresentative.name}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            legalRepresentative: { ...prev.legalRepresentative, name: e.target.value }
                          }))}
                          required
                          placeholder="Enter representative name"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.legalRepresentative.gender}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            legalRepresentative: { ...prev.legalRepresentative, gender: e.target.value }
                          }))}
                          required
                          className="w-full border rounded-lg p-2"
                        >
                          <option value="">Select Gender</option>
                          {genderOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="email"
                          value={formData.legalRepresentative.email}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            legalRepresentative: { ...prev.legalRepresentative, email: e.target.value }
                          }))}
                          required
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="tel"
                          value={formData.legalRepresentative.phone}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            legalRepresentative: { ...prev.legalRepresentative, phone: e.target.value }
                          }))}
                          required
                          placeholder="07X XXX XXXX"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Placeholder Image */}
                  <div className="flex justify-center">
                
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
                      {academyData ? 'Update Academy' : 'Add Academy'}
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

export default AddAcademyModal;
