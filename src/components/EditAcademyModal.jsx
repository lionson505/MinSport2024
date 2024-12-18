import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { rwandaLocations } from '../data/rwandaLocations';
import toast from 'react-hot-toast';

function EditAcademyModal({ isOpen, onClose, onEdit, academyData }) {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    category: '',
    location_province: '',
    location_district: '',
    location_sector: '',
    location_cell: '',
    location_village: '',
    legalRepresentativeName: '',
    legalRepresentativeGender: '',
    legalRepresentativeEmail: '',
    legalRepresentativePhone: ''
  });

  // Location states
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableSectors, setAvailableSectors] = useState([]);
  const [availableCells, setAvailableCells] = useState([]);
  const [availableVillages, setAvailableVillages] = useState([]);

  // Options
  const domainOptions = ['Sports', 'Education', 'Culture'];
  const categoryOptions = ['Excellence school', 'F.Center', 'Youth Center', 'Centre'];
  const genderOptions = ['Male', 'Female', 'Other'];

  // Load academy data when modal opens and academyData is available
  useEffect(() => {
    if (academyData) {
      setFormData({
        name: academyData.name || '',
        domain: academyData.domain || '',
        category: academyData.category || '',
        location_province: academyData.location_province || '',
        location_district: academyData.location_district || '',
        location_sector: academyData.location_sector || '',
        location_cell: academyData.location_cell || '',
        location_village: academyData.location_village || '',
        legalRepresentativeName: academyData.legalRepresentativeName || '',
        legalRepresentativeGender: academyData.legalRepresentativeGender || '',
        legalRepresentativeEmail: academyData.legalRepresentativeEmail || '',
        legalRepresentativePhone: academyData.legalRepresentativePhone || ''
      });

      // Only trigger location cascading if province exists
      if (academyData.location_province) {
        handleProvinceChange({ target: { value: academyData.location_province } });
        
        // Only trigger district if both province and district exist
        if (academyData.location_district) {
          handleDistrictChange({ target: { value: academyData.location_district } });
          
          // Only trigger sector if province, district and sector exist
          if (academyData.location_sector) {
            handleSectorChange({ target: { value: academyData.location_sector } });
            
            // Only trigger cell if all previous levels exist
            if (academyData.location_cell) {
              handleCellChange({ target: { value: academyData.location_cell } });
            }
          }
        }
      }
    }
  }, [academyData]);

  // Handle location changes
  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setFormData(prev => ({
      ...prev,
      location_province: province,
      location_district: '',
      location_sector: '',
      location_cell: '',
      location_village: ''
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
      location_district: district,
      location_sector: '',
      location_cell: '',
      location_village: ''
    }));

    if (district && rwandaLocations[formData.location_province]?.districts[district]) {
      setAvailableSectors(Object.keys(rwandaLocations[formData.location_province].districts[district].sectors));
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
      location_sector: sector,
      location_cell: '',
      location_village: ''
    }));

    if (sector && rwandaLocations[formData.location_province]?.districts[formData.location_district]?.sectors[sector]) {
      setAvailableCells(Object.keys(rwandaLocations[formData.location_province].districts[formData.location_district].sectors[sector].cells));
    } else {
      setAvailableCells([]);
    }
    setAvailableVillages([]);
  };

  const handleCellChange = (e) => {
    const cell = e.target.value;
    setFormData(prev => ({
      ...prev,
      location_cell: cell,
      location_village: ''
    }));

    if (cell && rwandaLocations[formData.location_province]?.districts[formData.location_district]?.sectors[formData.location_sector]?.cells[cell]) {
      setAvailableVillages(rwandaLocations[formData.location_province].districts[formData.location_district].sectors[formData.location_sector].cells[cell]);
    } else {
      setAvailableVillages([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Basic validation
      if (!formData.name || !formData.domain || !formData.category) {
        throw new Error('Please fill in all required fields');
      }

      // Location validation
      if (!formData.location_province || !formData.location_district || 
          !formData.location_sector || !formData.location_cell || !formData.location_village) {
        throw new Error('Please complete all location fields');
      }

      // Legal representative validation
      if (!formData.legalRepresentativeName || !formData.legalRepresentativeGender || 
          !formData.legalRepresentativeEmail || !formData.legalRepresentativePhone) {
        throw new Error('Please fill in all legal representative details');
      }

      // Phone validation (Rwanda format)
      const phoneRegex = /^(\+?25)?(07[238]\d{7})$/;
      if (!phoneRegex.test(formData.legalRepresentativePhone)) {
        throw new Error('Please enter a valid Rwandan phone number');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.legalRepresentativeEmail)) {
        throw new Error('Please enter a valid email address');
      }

      await onEdit({
        ...academyData,
        ...formData
      });
      onClose();
      toast.success('Academy updated successfully');
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
            <Dialog.Panel className={`w-full max-w-2xl transform overflow-hidden rounded-lg ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
            } p-6 text-left align-middle shadow-xl transition-all`}>
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-xl font-bold">
                  Edit Academy
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
                <div className="space-y-4">
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

                  <div className="grid grid-cols-2 gap-4">
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
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        required
                        className="w-full border rounded-lg p-2"
                      >
                        <option value="">Select Category</option>
                        {categoryOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Location Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Location</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Province</label>
                      <select
                        value={formData.location_province}
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
                        value={formData.location_district}
                        onChange={handleDistrictChange}
                        required
                        disabled={!formData.location_province}
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
                        value={formData.location_sector}
                        onChange={handleSectorChange}
                        required
                        disabled={!formData.location_district}
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
                        value={formData.location_cell}
                        onChange={handleCellChange}
                        required
                        disabled={!formData.location_sector}
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
                        value={formData.location_village}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          location_village: e.target.value
                        }))}
                        required
                        disabled={!formData.location_cell}
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
                        value={formData.legalRepresentativeName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          legalRepresentativeName: e.target.value
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
                        value={formData.legalRepresentativeGender}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          legalRepresentativeGender: e.target.value
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
                        value={formData.legalRepresentativeEmail}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          legalRepresentativeEmail: e.target.value
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
                        value={formData.legalRepresentativePhone}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          legalRepresentativePhone: e.target.value
                        }))}
                        required
                        placeholder="07X XXX XXXX"
                      />
                    </div>
                  </div>
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
                    Update Academy
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

export default EditAcademyModal;
