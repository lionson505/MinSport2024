import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import AddEmployeeForm from './forms/AddEmployeeForm';

function EditEmployeeModal({ isOpen, onClose, onEdit, employeeData }) {
  const { isDarkMode } = useTheme();

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
              <Dialog.Panel className={`w-full max-w-4xl transform overflow-hidden rounded-lg ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
              } p-6 text-left align-middle shadow-xl transition-all`}>
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-xl font-bold">
                    Edit Employee: {employeeData?.firstname} {employeeData?.lastname}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* AddEmployeeForm Component */}
                <AddEmployeeForm 
                  onSubmit={(data) => {
                    onEdit({ id: employeeData.id, ...data }); // Passing the id along with the updated data
                    onClose(); // Close the modal after the edit
                  }}
                  onCancel={onClose} // onCancel should also close the modal
                  initialData={employeeData} // Initialize form with existing employee data
                  isEditing={true} // Flag to indicate that we're in editing mode
                  employeeId={employeeData?.id}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default EditEmployeeModal;
