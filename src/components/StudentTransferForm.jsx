import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance'; // Ensure this path is correct
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { AlertCircle } from 'lucide-react';

const StudentTransferForm = ({ students, isLoading, isSubmitting, setIsSubmitting }) => {
  const [schools, setSchools] = useState([]);
  const [fromSchool, setFromSchool] = useState('');
  const [transferStudent, setTransferStudent] = useState('');
  const [toSchool, setToSchool] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axiosInstance.get('/institutions'); // Fetch schools from the institutions endpoint
        setSchools(response.data || []);
      } catch (error) {
        console.error('Error fetching schools:', error);
      }
    };

    fetchSchools();
  }, []);

  const availableStudents = students.filter(student => student.schoolId !== parseInt(fromSchool));

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!fromSchool) {
      setErrorMessage('Please select the school from which the student is transferring.');
      return;
    }
    if (!transferStudent) {
      setErrorMessage('Please select a student to transfer.');
      return;
    }
    if (!toSchool) {
      setErrorMessage('Please select the destination school.');
      return;
    }
    if (!transferDate) {
      setErrorMessage('Please select a transfer date.');
      return;
    }
    setErrorMessage('');
    setShowTransferConfirm(true);
  };

  const processTransfer = async () => {
    setIsSubmitting(true);

    const fromSchoolName = schools.find(school => school.id === parseInt(fromSchool))?.name;
    const toSchoolName = schools.find(school => school.id === parseInt(toSchool))?.name;

    const transferData = {
      studentId: transferStudent,
      fromSchool: fromSchoolName,
      toSchool: toSchoolName,
      transferDate: new Date(transferDate).toISOString(),
    };

    console.log('Transfer Data:', transferData);

    try {
      // Simulate API call for student transfer
      await axiosInstance.post('/transfers', transferData);
      setShowTransferConfirm(false);
      alert('Transfer processed successfully!');
    } catch (error) {
      console.error('Error processing transfer:', error);
      alert('Failed to process transfer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="transition-all duration-300 ease-in-out">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Student Transfer Form</h2>
        
        <form onSubmit={handleTransferSubmit} className="space-y-6">
          {errorMessage && (
            <div className="text-red-500 text-sm mb-4">
              {errorMessage}
            </div>
          )}
          {/* Source School */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School From <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={fromSchool}
              onChange={(e) => setFromSchool(e.target.value)}
              required
            >
              <option value="">Select School</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={transferStudent}
              onChange={(e) => setTransferStudent(e.target.value)}
              required
              disabled={!fromSchool || isLoading}
            >
              <option value="">
                {isLoading 
                  ? 'Loading students...' 
                  : fromSchool 
                    ? 'Select Student'
                    : 'Select school first'
                }
              </option>
              {availableStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} - {student.class}
                </option>
              ))}
            </select>
          </div>

          {/* Destination School */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School To <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={toSchool}
              onChange={(e) => setToSchool(e.target.value)}
              required
              disabled={!transferStudent}
            >
              <option value="">Select School</option>
              {schools
                .filter(school => school.id !== parseInt(fromSchool))
                .map(school => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))
              }
            </select>
          </div>

          {/* Transfer Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transfer Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting || !fromSchool || !transferStudent || !toSchool || !transferDate}
            >
              {isSubmitting ? 'Processing...' : 'Process Transfer'}
            </Button>
          </div>
        </form>
      </div>

      {/* Transfer Confirmation Dialog */}
      <Dialog open={showTransferConfirm} onOpenChange={setShowTransferConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Confirm Transfer
            </DialogTitle>
            <DialogDescription className="py-4">
              <div className="space-y-4">
                <p>Please confirm the following transfer:</p>
                <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                  <p>
                    <span className="font-semibold">Student:</span>{' '}
                    {availableStudents.find(s => s.id === parseInt(transferStudent))?.firstName} {availableStudents.find(s => s.id === parseInt(transferStudent))?.lastName}
                  </p>
                  <p>
                    <span className="font-semibold">From:</span>{' '}
                    {schools.find(s => s.id === parseInt(fromSchool))?.name}
                  </p>
                  <p>
                    <span className="font-semibold">To:</span>{' '}
                    {schools.find(s => s.id === parseInt(toSchool))?.name}
                  </p>
                  <p>
                    <span className="font-semibold">Transfer Date:</span>{' '}
                    {new Date(transferDate).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  This action will transfer all student records to the new school.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowTransferConfirm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={processTransfer}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Transfer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentTransferForm;
