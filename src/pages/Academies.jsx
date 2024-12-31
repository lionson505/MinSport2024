import React, { useState, useEffect, Fragment } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Search, Plus, Eye, PencilIcon, Trash2, AlertTriangle, X } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import AddAcademyModal from '../components/AddAcademyModal';
import AddAcademyStudent from '../components/AddAcademyStudent';
import EditAcademyModal from '../components/EditAcademyModal';
import axiosInstance from '../utils/axiosInstance';
import PrintButton from "../components/reusable/Print";
import EditAcademyStudentModal from '../components/EditAcademyStudentModal';
import {usePermissionLogger} from "../utils/permissionLogger.js";

function Academies() {
  const [activeTab, setActiveTab] = useState('manage');
  const [searchTerm, setSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [entriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentCurrentPage, setStudentCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  const [isViewStudentsModalOpen, setIsViewStudentsModalOpen] = useState(false);
  const [selectedAcademyStudents, setSelectedAcademyStudents] = useState([]);
  const [academies, setAcademies] = useState([]);
  const [students, setStudents] = useState([]);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isViewStudentModalOpen, setIsViewStudentModalOpen] = useState(false);
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [isDeleteStudentModalOpen, setIsDeleteStudentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const logPermissions = usePermissionLogger('academies')

  const[permissions, setPermissions] = useState({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false
  })
  const [transferData, setTransferData] = useState({
    fromSchool: '',
    student: '',
    toSchool: ''
  });

  const totalPages = Math.ceil(academies.length / entriesPerPage);
  const studentTotalPages = Math.ceil(students.length / entriesPerPage);

  useEffect(() => {
    const currentPermissions = logPermissions();
    setPermissions(currentPermissions);
    console.log("perms:", permissions)
    fetchAcademies();
    fetchStudents();
  }, []);

  const fetchAcademies = async () => {
    try {
      const response = await axiosInstance.get('/academies');
      setAcademies(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching academies:', error);
      toast.error('Failed to fetch academies');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get('/academy-students');
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/academies/${selectedAcademy.id}`);
      setIsDeleteModalOpen(false);
      toast.success('Academy deleted successfully');
      fetchAcademies();
    } catch (error) {
      console.error('Error deleting academy:', error);
      toast.error('Failed to delete academy');
    }
  };

  const handleEditSubmit = async (updatedAcademy) => {
    try {
      if (!updatedAcademy.id) {
        throw new Error('Academy ID is required for updating');
      }

      const response = await axiosInstance.put(`/academies/${updatedAcademy.id}`, updatedAcademy);

      if (response.status === 200) {
        setIsEditModalOpen(false);
        toast.success('Academy updated successfully');
        fetchAcademies();
      } else {
        throw new Error('Failed to update academy');
      }
    } catch (error) {
      console.error('Error updating academy:', error);
      toast.error('Failed to update academy');
    }
  };

  const handleDeleteStudentConfirm = async () => {
    try {
      await axiosInstance.delete(`/academy-students/${selectedStudent.id}`);
      setIsDeleteStudentModalOpen(false);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const handleEditStudentSubmit = async (updatedData) => {
    try {
      if (!updatedData.id) {
        throw new Error('Student ID is required for updating');
      }

      // Create FormData object for file upload
      const formData = new FormData();

      // Append all the required fields
      formData.append('firstName', updatedData.firstName);
      formData.append('lastName', updatedData.lastName);
      formData.append('gender', updatedData.gender);
      formData.append('dateOfBirth', updatedData.dateOfBirth);
      formData.append('placeOfBirth', updatedData.placeOfBirth || '');
      formData.append('placeOfResidence', updatedData.placeOfResidence);
      formData.append('idPassportNo', updatedData.idPassportNo);
      formData.append('nationality', updatedData.nationality);
      formData.append('otherNationality', updatedData.otherNationality || '');
      formData.append('namesOfParentsGuardian', updatedData.namesOfParentsGuardian);
      formData.append('nameOfSchoolAcademyTrainingCenter', updatedData.nameOfSchoolAcademyTrainingCenter);
      formData.append('typeOfSchoolAcademyTrainingCenter', updatedData.typeOfSchoolAcademyTrainingCenter);
      formData.append('class', updatedData.class);
      formData.append('typeOfGame', updatedData.typeOfGame);
      formData.append('contact', updatedData.contact);

      // Only append photo if it's provided and it's a File object
      if (updatedData.photo_passport instanceof File) {
        formData.append('photo_passport', updatedData.photo_passport);
      }

      const response = await axiosInstance.put(
        `/academy-students/${updatedData.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        setIsEditStudentModalOpen(false);
        toast.success('Student updated successfully');
        fetchStudents();
      }
    } catch (error) {
      console.error('Error updating student:', error);
      
      // Enhanced error handling
      if (error.response) {
        const errorMessage = error.response.data.message || 'Failed to update student';
        if (error.response.data.details) {
          const validationErrors = error.response.data.details
            .map(detail => detail.message)
            .join(', ');
          toast.error(`Validation errors: ${validationErrors}`);
        } else {
          toast.error(errorMessage);
        }
      } else if (error.request) {
        toast.error('No response received from server');
      } else {
        toast.error('Failed to update student');
      }
      
      throw error;
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Transferring student:', transferData);
      setTransferData({ fromSchool: '', student: '', toSchool: '' });
      toast.success('Student transferred successfully');
    } catch (error) {
      console.error('Error transferring student:', error);
      toast.error('Failed to transfer student');
    }
  };

  const handleFromSchoolChange = (schoolId) => {
    setTransferData(prev => ({ ...prev, fromSchool: schoolId, student: '', toSchool: '' }));
  };

  const availableStudents = students.filter(student => student.nameOfSchoolAcademyTrainingCenter === transferData.fromSchool);

  const renderAcademyDetails = (academy) => {
    if (!academy) return null;

    const details = [
      { label: 'School Name', value: academy.name },
      { label: 'Domain', value: academy.domain || 'Sports' },
      { label: 'Category', value: academy.category },
      { label: 'Province', value: academy.location?.province || 'City of Kigali' },
      { label: 'District', value: academy.location?.district || 'NYARUGENGE' },
      { label: 'Secteur', value: academy.location?.sector || 'Nyarugenge' },
      { label: 'Cellule', value: academy.location?.cell || 'Kiyovu' },
      { label: 'Village', value: academy.location?.village || 'Cercle Sportif' },
      { label: 'LR Name', value: academy.legalRepresentative?.name || 'N/A' },
      { label: 'LR Gender', value: academy.legalRepresentative?.gender || 'N/A' },
      { label: 'LR Email', value: academy.legalRepresentative?.email || 'N/A' },
      { label: 'LR Phone', value: academy.legalRepresentative?.phone || 'N/A' }
    ];

    // Filter students for the selected academy
    const academyStudents = students.filter(student => student.nameOfSchoolAcademyTrainingCenter === academy.name);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {details.map((detail, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 py-2 border-b last:border-b-0">
              <div className="text-sm text-gray-500 font-medium">{detail.label}</div>
              <div className="text-sm">{detail.value}</div>
            </div>
          ))}
        </div>

        {/* Student Table */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Students</h3>
          {academyStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Game</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Gender</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {academyStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{`${student.firstName} ${student.lastName}`}</td>
                      <td className="px-4 py-3">{student.class}</td>
                      <td className="px-4 py-3">{student.typeOfGame}</td>
                      <td className="px-4 py-3">{student.gender}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No students found for this academy.</p>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'manage':
        // Filter academies based on search term
        const filteredAcademies = academies.filter(academy =>
          academy.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Calculate the academies to display based on pagination
        const startIndex = (currentPage - 1) * entriesPerPage;
        const paginatedAcademies = filteredAcademies.slice(startIndex, startIndex + entriesPerPage);

        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search academies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              {permissions.canCreate && (
                  <Button
                      onClick={() => setIsAddModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Academy
                  </Button>
              )}

            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
            <PrintButton title='ACCADEMIES REPORT'>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Students</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 operation">Operation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedAcademies.map((academy) => {
                    // Calculate the number of students for this academy
                    const studentCount = students.filter(student => student.nameOfSchoolAcademyTrainingCenter === academy.name).length;

                    return (
                      <tr key={academy.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{academy.name}</td>
                        <td className="px-4 py-3 text-sm">{academy.location_province},{academy.location_district}</td>
                        <td className="px-4 py-3 text-sm">{academy.category}</td>
                        <td className="px-4 py-3 text-sm">{studentCount}</td>
                        <td className="px-4 py-3 flex gap-2 operation">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setSelectedAcademy(academy);
                              setIsViewModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 text-black" />
                          </Button>
                          {permissions.canUpdate && (
                              <Button
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedAcademy(academy);
                                    setIsEditModalOpen(true);
                                  }}
                              >
                                <PencilIcon className="h-4 w-4 text-black" />
                              </Button>
                          )}
                          {permissions.canDelete && (
                              <Button
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedAcademy(academy);
                                    setIsDeleteModalOpen(true);
                                  }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                          )}

                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </PrintButton>

            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end mt-4 space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border rounded-md"
              >
                Previous
              </Button>

              <div className="flex items-center">
                <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
                  {currentPage}
                </span>
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border rounded-md"
              >
                Next
              </Button>
            </div>
          </>
        );

      case 'students':
        // Filter students based on search term
        const filteredStudents = students.filter(student =>
          `${student.firstName} ${student.lastName}`.toLowerCase().includes(studentSearchTerm.toLowerCase())
        );

        // Calculate the students to display based on pagination
        const studentStartIndex = (studentCurrentPage - 1) * entriesPerPage;
        const paginatedStudents = filteredStudents.slice(studentStartIndex, studentStartIndex + entriesPerPage);

        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search students..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="w-64 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              {permissions.canCreate && (<Button
                  onClick={() => setIsAddStudentModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Academy Student
              </Button>)}

            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <PrintButton title="ACCADEMY STUDENTS">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">School</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Age/Date of Birth</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Nationality</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Gender</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Game</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 operation">Operation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{`${student.firstName} ${student.lastName}`}</td>
                      <td className="px-4 py-3 text-sm">{student.nameOfSchoolAcademyTrainingCenter}</td>
                      <td className="px-4 py-3 text-sm">{new Date(student.dateOfBirth).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">{student.nationality}</td>
                      <td className="px-4 py-3 text-sm">{student.gender}</td>
                      <td className="px-4 py-3 text-sm">{student.typeOfGame }</td>
                      <td className="px-4 py-3 text-sm">{student.class}</td>
                      <td className="px-4 py-3 operation">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewStudent(student)}
                            className="p-1 h-7 w-7"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-black" />
                          </Button>
                          {permissions.canUpdate && (<Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditStudent(student)}
                              className="p-1 h-7 w-7"
                              title="Edit Student"
                          >
                            <PencilIcon className="h-4 w-4 text-black" />
                          </Button>)}
                          {permissions.canDelete && (
                              <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteStudent(student)}
                                  className="p-1 h-7 w-7"
                                  title="Delete Student"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </PrintButton>

            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end mt-4 space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setStudentCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={studentCurrentPage === 1}
                className="px-3 py-1 text-sm border rounded-md"
              >
                Previous
              </Button>

              <div className="flex items-center">
                <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
                  {studentCurrentPage}
                </span>
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setStudentCurrentPage(prev => Math.min(prev + 1, studentTotalPages))}
                disabled={studentCurrentPage === studentTotalPages}
                className="px-3 py-1 text-sm border rounded-md"
              >
                Next
              </Button>
            </div>
          </>
        );

      case 'transfer':
        return (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Academy Student Transfer</h2>
            
            <form onSubmit={handleTransferSubmit} className="space-y-6">
              {/* School From */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  School From <span className="text-red-500">*</span>
                </label>
                <select
                  value={transferData.fromSchool}
                  onChange={(e) => handleFromSchoolChange(e.target.value)}
                  required
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">Select School</option>
                  {academies.map(academy => (
                    <option key={academy.id} value={academy.name}>
                      {academy.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Selection */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Student <span className="text-red-500">*</span>
                </label>
                <select
                  value={transferData.student}
                  onChange={(e) => setTransferData(prev => ({ ...prev, student: e.target.value }))}
                  required
                  disabled={!transferData.fromSchool}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">Select Student</option>
                  {availableStudents.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} - {student.class}
                    </option>
                  ))}
                </select>
              </div>

              {/* School To */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  School To <span className="text-red-500">*</span>
                </label>
                <select
                  value={transferData.toSchool}
                  onChange={(e) => setTransferData(prev => ({ ...prev, toSchool: e.target.value }))}
                  required
                  disabled={!transferData.student}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="">Select School</option>
                  {academies
                    .filter(academy => academy.name !== transferData.fromSchool)
                    .map(academy => (
                      <option key={academy.id} value={academy.name}>
                        {academy.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Transfer Student
                </Button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setIsViewStudentModalOpen(true);
  };

  const renderStudentDetails = (student) => {
    if (!student) return null;

    const details = [
      { section: 'Personal Information', fields: [
        { label: 'Full Name', value: `${student.firstName} ${student.lastName}` },
        { label: 'Gender', value: student.gender },
        { label: 'Date of Birth', value: new Date(student.dateOfBirth).toLocaleDateString() },
        { label: 'Place of Birth', value: student.placeOfBirth || 'N/A' },
        { label: 'Place of Residence', value: student.placeOfResidence },
        { label: 'ID/Passport No', value: student.idPassportNo },
        { label: 'Nationality', value: student.nationality },
        { label: 'Other Nationality', value: student.otherNationality || 'N/A' }
      ]},
      { section: 'Academic Information', fields: [
        { label: 'School/Academy', value: student.nameOfSchoolAcademyTrainingCenter },
        { label: 'Type of School/Academy', value: student.typeOfSchoolAcademyTrainingCenter },
        { label: 'Class', value: student.class },
        { label: 'Type of Game', value: student.typeOfGame }
      ]},
      { section: 'Contact Information', fields: [
        { label: 'Parents/Guardian', value: student.namesOfParentsGuardian },
        { label: 'Contact', value: student.contact }
      ]}
    ];

    return (
      <div className="space-y-6">
        {student.photo_passport && (
          <div className="flex justify-center mb-6">
            {console.log('Student photo full path:', `${axiosInstance.defaults.baseURL}/uploads/students/${student.photo_passport}`)}
            <img 
              src={`${axiosInstance.defaults.baseURL}/uploads/students/${student.photo_passport}`}
              alt="Student Passport"
              className="w-32 h-32 rounded-lg object-cover"
            />
          </div>
        )}

        {details.map((section, index) => (
          <div key={index} className="border-b pb-4 last:border-b-0">
            <h3 className="text-lg font-medium mb-4">{section.section}</h3>
            <div className="grid grid-cols-2 gap-4">
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex}>
                  <label className="text-sm text-gray-500">{field.label}</label>
                  <p className="font-medium">{field.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };


  const handleAddAcademy = async (data) => {
    try {
      await axiosInstance.post('/academies', data);
      toast.success('Academy added successfully');
      fetchAcademies(); // Refresh academies data
      setIsAddModalOpen(false); // Close the modal after successful addition
    } catch (error) {
      console.error('Error adding academy:', error);
      toast.error('Failed to add academy');
    }
  };

  const handleAddStudent = async (formData) => {
    try {
      const response = await axiosInstance.post('/academy-students', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Student added successfully');
      fetchStudents(); // Refresh the students list
      return response;
    } catch (error) {
      console.error('Error adding student:', error);
      // toast.error('Failed to add student');
      throw error;
    }
  };

  const handleDeleteStudent = (student) => {
    setSelectedStudent(student);
    setIsDeleteStudentModalOpen(true);
  };

  const handleEditStudent = (student) => {
    if (!student?.id) {
      toast.error('Invalid student data');
      return;
    }
    setSelectedStudent(student);
    setIsEditStudentModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-6">Manage Academies</h1>

        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              activeTab === 'manage' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Academies
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              activeTab === 'students' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('students')}
          >
            Manage Academy Students
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              activeTab === 'transfer' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('transfer')}
          >
            Transfer Students
          </button>
        </div>

        <div className="transition-all duration-200 ease-in-out">
          {renderContent()}
        </div>
      </div>

      <AddAcademyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddAcademy}
      />
{/* View Student Modal */}
<Transition appear show={isViewStudentModalOpen} as={Fragment}>
  <Dialog 
    as="div" 
    className="relative z-50" 
    onClose={() => setIsViewStudentModalOpen(false)}
  >
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
        <Dialog.Panel className="w-full h-full max-w-none transform overflow-hidden bg-white p-6 text-left align-middle shadow-xl transition-all">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold">
              View Student Details
            </Dialog.Title>
            <button
              onClick={() => setIsViewStudentModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {renderStudentDetails(selectedStudent)}

          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button onClick={() => setIsViewStudentModalOpen(false)}>
              Close
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </div>
  </Dialog>
</Transition>

      {/* Add EditAcademyModal */}
      <EditAcademyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAcademy(null);
        }}
        onEdit={handleEditSubmit}
        academyData={selectedAcademy}
      />
      {/* Add Student Modal */}
      <AddAcademyStudent
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onAdd={handleAddStudent}
        studentData={null}
        isEditing={false}
        handleAddStudent={handleAddStudent}
      />

      {/* View Academy Modal */}
      <Transition appear show={isViewModalOpen} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={() => setIsViewModalOpen(false)}
        >
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-xl font-bold">
                    View Academy Details
                  </Dialog.Title>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {renderAcademyDetails(selectedAcademy)}

                <div className="flex justify-end mt-6 pt-4 border-t">
                  <Button onClick={() => setIsViewModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Student Confirmation Modal */}
      <Transition appear show={isDeleteStudentModalOpen} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={() => setIsDeleteStudentModalOpen(false)}
        >
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <Dialog.Title className="text-lg font-medium">
                    Delete Student
                  </Dialog.Title>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to delete {selectedStudent?.firstName} {selectedStudent?.lastName}? 
                  This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
            
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteStudentModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDeleteStudentConfirm}
                  >
                    Delete Student
                  </Button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

     {/* Edit Student Modal */}
     <EditAcademyStudentModal
        isOpen={isEditStudentModalOpen}
        onClose={() => {
          setIsEditStudentModalOpen(false);
          setSelectedStudent(null);
        }}
        onEdit={handleEditStudentSubmit}
        studentData={selectedStudent}
      />

      {/* Delete Academy Confirmation Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={() => setIsDeleteModalOpen(false)}
        >
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <Dialog.Title className="text-lg font-medium">
                    Delete Academy
                  </Dialog.Title>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to delete "{selectedAcademy?.name}"? 
                  This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDeleteConfirm}
                  >
                    Delete Academy
                  </Button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default Academies;