import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { X } from 'lucide-react';
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
  });

  const currencies = [
    { code: 'FRW', symbol: 'FRW' },
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
  ];

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
                  <Input
                    label="Contract Number"
                    value={formData.contract_no}
                    onChange={(e) => handleChange('contract_no', e.target.value)}
                    required
                  />
                  <Input
                    label="Contract Title"
                    value={formData.contract_title}
                    onChange={(e) => handleChange('contract_title', e.target.value)}
                    required
                  />
                  <Input
                    label="Supplier"
                    value={formData.supplier}
                    onChange={(e) => handleChange('supplier', e.target.value)}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                  <Input
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                  <Input
                    label="Amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                  />
                  <div className="flex space-x-4">
                    <Input
                      label="Start Date"
                      type="date"
                      value={formData.start_date.split('T')[0]}
                      onChange={(e) =>
                        handleDateChange('start_date', e.target.value)
                      }
                    />
                    <Input
                      label="Duration (Days)"
                      type="number"
                      value={formData.duration_of_contract}
                      onChange={(e) =>
                        handleDateChange('duration_of_contract', e.target.value)
                      }
                    />
                    <Input
                      label="End Date"
                      type="date"
                      value={formData.contract_end_date.split('T')[0]}
                      readOnly
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
