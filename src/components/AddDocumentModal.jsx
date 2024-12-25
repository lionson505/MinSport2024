import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';

const AddDocumentModal = ({ isOpen, onClose, initialData = '', onDocumentSubmit }) => {
  const [formData, setFormData] = useState({
    documentName: '',
    documentType: 'LETTER',
    referenceNo: '',
    personOrInstitution: '',
    phone: '',
    emailId: '',
    dateOfRecording: new Date().toISOString().split('T')[0],
    dateOfReceptionOrSending: new Date().toISOString().split('T')[0],
    status: 'DRAFT',
    documentFile: null, // Ensure this is initialized as null
  });

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        documentFile: null, // Reset file input for editing
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      documentFile: e.target.files[0], // Use the first file
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formDataToSend = new FormData();
    formDataToSend.append('documentName', formData.documentName || 'string');
    formDataToSend.append('documentType', formData.documentType || 'LETTER');
    formDataToSend.append('referenceNo', formData.referenceNo || 'string');
    formDataToSend.append('personOrInstitution', formData.personOrInstitution || 'string');
    formDataToSend.append('phone', formData.phone || 'string');
    formDataToSend.append('emailId', formData.emailId || 'string');
    formDataToSend.append('dateOfRecording', formData.dateOfRecording || new Date().toISOString().split('T')[0]);
    formDataToSend.append('dateOfReceptionOrSending', formData.dateOfReceptionOrSending || new Date().toISOString().split('T')[0]);
    formDataToSend.append('status', formData.status || 'DRAFT');
  
    // Attach the file if it exists
    if (formData.documentFile) {
      formDataToSend.append('documentFile', formData.documentFile);
    } else {
      console.warn('No file selected');
    }
  
    try {
      let response;
      if (initialData) {
        response = await axiosInstance.put(`/documents/${initialData.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Document updated successfully!');
        window.location.reload();
      } else {
        response = await axiosInstance.post('/documents', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Document uploaded successfully!');
        window.location.reload();
      }
  
      onDocumentSubmit(response.data);
      setFormData({
        documentName: '',
        documentType: 'LETTER',
        referenceNo: '',
        personOrInstitution: '',
        phone: '',
        emailId: '',
        dateOfRecording: new Date().toISOString().split('T')[0],
        dateOfReceptionOrSending: new Date().toISOString().split('T')[0],
        status: 'DRAFT',
        documentFile: null,
      });
      setErrorMessage('');
      onClose();
    } catch (error) {
      console.error('Error posting document:', error.response?.data || error.message);
      setErrorMessage('Failed to upload document. Please check your input and try again.');
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-xl font-bold">
                    {initialData ? 'Edit Document' : 'Add New Document'}
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Document Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="documentName"
                        value={formData.documentName}
                        onChange={handleChange}
                        required
                        placeholder="Enter document name"
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Document Type</label>
                      <select
                        name="documentType"
                        value={formData.documentType}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-2"
                      >
                        <option value="LETTER">LETTER</option>
                        <option value="REPORT">REPORT</option>
                        <option value="INVOICE">INVOICE</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Reference No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="referenceNo"
                      value={formData.referenceNo}
                      onChange={handleChange}
                      required
                      placeholder="Enter reference number"
                      className="w-full border rounded-lg p-2"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Person/Institution <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="personOrInstitution"
                        value={formData.personOrInstitution}
                        onChange={handleChange}
                        required
                        placeholder="Enter name/institution"
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="07X XXX XXXX"
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Email ID</label>
                      <input
                        type="email"
                        name="emailId"
                        value={formData.emailId}
                        onChange={handleChange}
                        placeholder="Enter email"
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Recording Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfRecording"
                        value={formData.dateOfRecording}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Reception/Sending Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfReceptionOrSending"
                        value={formData.dateOfReceptionOrSending}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-2"
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="FINAL">FINAL</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block mb-1 text-sm font-medium">Attachment</label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="w-full"
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Supported formats: PDF, DOC, DOCX, TXT
                    </p>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {initialData ? 'Update Document' : 'Add Document'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddDocumentModal;
