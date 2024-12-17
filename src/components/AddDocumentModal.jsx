import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

function AddDocumentModal({ isOpen, onClose, onAddDocument }) {
  const { isDarkMode } = useTheme();

  // Form state
  const [formData, setFormData] = useState({
    documentName: '',
    documentType: 'Incoming', // Default type
    referenceNo: '',
    personOrInstitution: '', // Matches backend naming
    phone: '',
    emailId: '', // Matches backend naming
    dateOfRecording: '',
    dateOfReceptionOrSending: '',
    status: 'Pending', // Default status
  });

  // Document type options
  const documentTypes = ['Incoming', 'Outgoing', 'Internal'];

  // Status options
  const statusOptions = ['Pending', 'Received', 'Sent', 'Processed'];

  // Validation
  const validateForm = () => {
    if (!formData.documentName || !formData.referenceNo || !formData.personOrInstitution) {
      toast.error('Please fill in all required fields');
      return false;
    }

    // Phone validation
    const phoneRegex = /^(\+?25)?(07[238]\d{7})$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid Rwandan phone number');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.emailId && !emailRegex.test(formData.emailId)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Date validation
    if (new Date(formData.dateOfReceptionOrSending) < new Date(formData.dateOfRecording)) {
      toast.error('Reception/Sending date cannot be earlier than the recording date');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await axiosInstance.post('/documents', formData);
      onAddDocument(response.data);
      toast.success('Document added successfully');
      window.location.reload();
      onClose();
    } catch (error) {
      console.error('Error posting document:', error.response?.data || error.message);
      const errorMessage =
        error?.response?.data?.message || 'An error occurred while adding the document';
      toast.error(errorMessage);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
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

        {/* Modal */}
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
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-xl font-bold">Add New Document</Dialog.Title>
                  <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Row 1: Document Name & Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Document Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.documentName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, documentName: e.target.value }))
                        }
                        required
                        placeholder="Enter document name"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Document Type</label>
                      <select
                        value={formData.documentType}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, documentType: e.target.value }))
                        }
                        className="w-full border rounded-lg p-2"
                      >
                        {documentTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Reference No */}
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Reference No. <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.referenceNo}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, referenceNo: e.target.value }))
                      }
                      required
                      placeholder="Enter reference number"
                    />
                  </div>

                  {/* Row 3: Contact Information */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Person/Institution <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.personOrInstitution}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            personOrInstitution: e.target.value,
                          }))
                        }
                        required
                        placeholder="Enter name/institution"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Phone</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="07X XXX XXXX"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Email ID</label>
                      <Input
                        type="email"
                        value={formData.emailId}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, emailId: e.target.value }))
                        }
                        placeholder="Enter email"
                      />
                    </div>
                  </div>

                  {/* Row 4: Dates & Status */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Recording Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.dateOfRecording}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dateOfRecording: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Reception/Sending Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.dateOfReceptionOrSending}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dateOfReceptionOrSending: e.target.value,
                          }))
                        }
                        required
                        min={formData.dateOfRecording} // Validation
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, status: e.target.value }))
                        }
                        className="w-full border rounded-lg p-2"
                      >
                        {statusOptions.map((status) => (
                         
                         <option key={status} value={status}>
                         {status}
                       </option>
                     ))}
                   </select>
                 </div>
               </div>
               <div className="mt-4">
                 <label className="block mb-1 text-sm font-medium">
                   Attachment
                 </label>
                 <Input
                   type="file"
                   onChange={(e) =>
                     setFormData((prev) => ({ ...prev, attachment: e.target.files[0] }))
                   }
                   className="w-full"
                   accept=".pdf,.doc,.docx,.txt"
                 />
                 <p className="text-sm text-gray-500 mt-1">
                   Supported formats: PDF, DOC, DOCX, TXT
                 </p>
               </div>

               {/* Action Buttons */}
               <div className="flex justify-end space-x-4 pt-4">
                 <Button type="button" variant="outline" onClick={onClose}>
                   Cancel
                 </Button>
                 <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                   Add Document
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

export default AddDocumentModal;
