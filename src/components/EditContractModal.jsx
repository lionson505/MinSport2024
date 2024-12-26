import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { X, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

function EditContractModal({ isOpen, onClose, onEdit, contractData }) {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    contract_no: '',
    contract_title: '',
    supplier: '',
    email: '',
    phone: '',
    amount: '',
    currency: 'USD',
    contract_administrator: '',
    start_date: '',
    duration_of_contract: 0,
    contract_end_date: '',
    completion_percentage: 0,
    contract_file_path: null,
    contract_file_name: null,
    contract_file_type: null,
    contract_file_size: null,
  });

  const currencies = [
    { code: 'FRW', symbol: 'FRW' },
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
  ];

  const [employees, setEmployees] = useState([]);
  const [administratorSearch, setAdministratorSearch] = useState('');
  const [showAdministratorDropdown, setShowAdministratorDropdown] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (contractData) {
      setFormData({
        ...contractData,
        start_date: new Date(contractData.start_date).toISOString(),
        contract_end_date: new Date(contractData.contract_end_date).toISOString(),
      });
    }
  }, [contractData]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get('/employees');
        setEmployees(response.data.employees);
      } catch (error) {
        toast.error('Failed to fetch employees');
      }
    };

    fetchEmployees();
  }, []);

  const filteredAdministrators = employees.filter(emp =>
    `${emp.firstname} ${emp.lastname}`.toLowerCase().includes(administratorSearch.toLowerCase()) ||
    emp.department_supervisor.toLowerCase().includes(administratorSearch.toLowerCase())
  );

  const calculateEndDate = (startDate, duration) => {
    if (!startDate || !duration) return '';
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + parseInt(duration));
    return end.toISOString();
  };

  const handleDateChange = (field, value) => {
    const updatedFormData = { ...formData, [field]: value };
    if (field === 'start_date' || field === 'duration_of_contract') {
      const endDate = calculateEndDate(
        updatedFormData.start_date,
        updatedFormData.duration_of_contract
      );
      updatedFormData.contract_end_date = endDate;
    }
    setFormData(updatedFormData);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAdministratorSelect = (employee) => {
    setFormData(prev => ({
      ...prev,
      contract_administrator: `${employee.firstname} ${employee.lastname}`
    }));
    setShowAdministratorDropdown(false);
    setAdministratorSearch('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        contract_file_name: file.name,
        contract_file_type: file.type,
        contract_file_size: file.size,
        contract_file_path: URL.createObjectURL(file), // Temporary URL for preview
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!formData.contract_no || !formData.contract_title || !formData.email) {
        throw new Error('Please fill in all required fields');
      }

      // Validate phone number
      const phoneRegex = /^(\+?25)?(07[238]\d{7})$/;
      if (!phoneRegex.test(formData.phone)) {
        throw new Error('Please enter a valid Rwandan phone number');
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate amount
      if (isNaN(formData.amount) || formData.amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Prepare payload
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        duration_of_contract: parseInt(formData.duration_of_contract),
        start_date: new Date(formData.start_date).toISOString(),
        contract_end_date: new Date(formData.contract_end_date).toISOString(),
      };

      // Submit data to API
      await axiosInstance.put(`/contracts/${contractData.id}`, payload);
      onEdit(payload);
      onClose();
      toast.success('Contract updated successfully');
    } catch (error) {
      toast.error(error.message || 'An error occurred');
      setError(error.message || 'An error occurred');
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
              <Dialog.Panel
                className={`w-full max-w-2xl transform overflow-hidden rounded-lg ${
                  isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
                } p-6 text-left align-middle shadow-xl transition-all`}
              >
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-xl font-bold">Edit Contract</Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {error && <div className="text-red-500 mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Contract No <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.contract_no}
                        onChange={(e) => handleChange('contract_no', e.target.value)}
                        required
                        placeholder="Enter contract number"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.contract_title}
                        onChange={(e) => handleChange('contract_title', e.target.value)}
                        required
                        placeholder="Enter contract title"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Supplier <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.supplier}
                        onChange={(e) => handleChange('supplier', e.target.value)}
                        required
                        placeholder="Enter supplier name"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        required
                        placeholder="07X XXX XXXX"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Amount <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => handleChange('amount', e.target.value)}
                        required
                        min="0"
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Currency</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => handleChange('currency', e.target.value)}
                        className="w-full border rounded-lg p-2"
                      >
                        {currencies.map(currency => (
                          <option key={currency.code} value={currency.code}>
                            {currency.code} ({currency.symbol})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Contract Administrator with Search */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Contract Administrator <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="relative">
                        <Input
                          type="text"
                          value={administratorSearch}
                          onChange={(e) => {
                            setAdministratorSearch(e.target.value);
                            setShowAdministratorDropdown(true);
                          }}
                          onFocus={() => setShowAdministratorDropdown(true)}
                          placeholder="Search administrator..."
                          className="w-full pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      
                      {/* Selected administrator display */}
                      {formData.contract_administrator && !showAdministratorDropdown && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-md flex justify-between items-center">
                          <span>{formData.contract_administrator}</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, contract_administrator: '' }))}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {/* Administrator search dropdown */}
                      {showAdministratorDropdown && administratorSearch && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto border">
                          {filteredAdministrators.length > 0 ? (
                            filteredAdministrators.map(employee => (
                              <button
                                key={employee.id}
                                type="button"
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                onClick={() => handleAdministratorSelect(employee)}
                              >
                                <div className="font-medium">{`${employee.firstname} ${employee.lastname}`}</div>
                                <div className="text-sm text-gray-500">
                                  {employee.department_supervisor}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">
                              No administrators found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.start_date.split('T')[0]}
                        onChange={(e) => handleDateChange('start_date', e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block mb-1 text-sm font-medium">Duration</label>
                        <Input
                          type="number"
                          value={formData.duration_of_contract}
                          onChange={(e) => handleDateChange('duration_of_contract', e.target.value)}
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Unit</label>
                        <select
                          value={formData.duration_of_contract_unit}
                          onChange={(e) => handleChange('duration_of_contract_unit', e.target.value)}
                          className="w-full border rounded-lg p-2"
                          required
                        >
                          {['Days', 'Weeks', 'Months', 'Quarters', 'Year'].map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">End Date</label>
                      <Input
                        type="date"
                        value={formData.contract_end_date.split('T')[0]}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Contract File
                    </label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                    {formData.contract_file_name && (
                      <div className="mt-2 text-sm text-gray-500">
                        Current file: {formData.contract_file_name}
                      </div>
                    )}
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
                      Update Contract
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

export default EditContractModal;
