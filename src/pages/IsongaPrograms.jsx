// src/pages/IsongaPrograms.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui/table';
import { Search, Plus, Pencil, Trash2, AlertCircle, Eye, Users, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PageLoading from '../components/ui/PageLoading';
import Message from '../components/ui/Message';
import { useDarkMode } from '../contexts/DarkModeContext';
import { Button } from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import InstitutionForm from '../components/forms/InstitutionForm';
import StudentTransferForm from '../components/StudentTransferForm';

import PrintButton from '../components/reusable/Print';

import { countries } from '../data/countries';
import { gameTypes } from '../data/gameTypes';
import { institutionTypes } from '../data/institutionTypes';
import { classOptions } from '../data/classOptions';
import { ActionButton } from '../components/ActionButton';
import { MODULE_IDS, ACTIONS } from '../constants/modules';
import { withRBAC } from '../hoc/withRBAC';


const IsongaPrograms = () => {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('Manage Institution');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Updated to 5 rows per page
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showDeleteStudentModal, setShowDeleteStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [institutionToDelete, setInstitutionToDelete] = useState(null);
  const [showDeleteInstitutionModal, setShowDeleteInstitutionModal] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
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
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [nidaData, setNidaData] = useState(null);
  const [idType, setIdType] = useState('nid');
  const [idNumber, setIdNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [idError, setIdError] = useState('');
  const [isLoadingNIDA, setIsLoadingNIDA] = useState(false);
  const [tabs] = useState(['Manage Institution', 'Manage Students', 'Student Transfer']);
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsResponse, studentsResponse, schoolsResponse] = await Promise.all([
          axiosInstance.get('/institutions'),
          axiosInstance.get('/students'),
          // axiosInstance.get('/schools') // Assuming there's an endpoint for schools
        ]);

        setPrograms(programsResponse?.data || []);
        setFilteredPrograms(programsResponse?.data || []);
        
        const studentData = Array.isArray(studentsResponse?.data?.data) 
          ? studentsResponse.data.data 
          : [];
        setStudents(studentData);
        setFilteredStudents(studentData);

        setSchools(schoolsResponse?.data || []);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load data. Please try again.'
        });
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddInstitution = () => {
    setSelectedInstitution(null);
    setShowInstitutionModal(true);
  };

  const handleEditInstitution = (institution) => {
    setSelectedInstitution(institution);
    setShowInstitutionModal(true);
  };

  const handleDeleteInstitution = (institution) => {
    setInstitutionToDelete(institution);
    setShowDeleteInstitutionModal(true);
  };

  const handleConfirmDeleteInstitution = async () => {
    setIsSubmitting(true);
    try {
      await axiosInstance.delete(`/institutions/${institutionToDelete.id}`);
      const updatedPrograms = programs.filter(p => p.id !== institutionToDelete.id);
      setPrograms(updatedPrograms);
      setFilteredPrograms(updatedPrograms);
      toast.success('Institution deleted successfully');
      setShowDeleteInstitutionModal(false);
    } catch (error) {
      toast.error('Failed to delete institution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (searchValue, type) => {
    if (!searchValue) {
      if (type === 'programs') {
        setFilteredPrograms(programs);
      } else if (type === 'students') {
        setFilteredStudents(students);
      }
      return;
    }

    if (type === 'programs') {
      const filtered = programs.filter(program => 
        program.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        JSON.stringify(program.location)?.toLowerCase().includes(searchValue.toLowerCase()) ||
        program.category?.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredPrograms(filtered);
    } else if (type === 'students') {
      const filtered = students.filter(student => 
        student.firstName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        student.nationality?.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
    setCurrentPage(1);
  };

  const handleInstitutionSubmit = async (institutionData) => {
    setIsSubmitting(true);
    try {
      if (selectedInstitution) {
        // Update institution
        await axiosInstance.put(`/institutions/${selectedInstitution.id}`, institutionData);
        const updatedPrograms = programs.map(p => 
          p.id === selectedInstitution.id ? { ...p, ...institutionData } : p
        );
        setPrograms(updatedPrograms);
        setFilteredPrograms(updatedPrograms);
        toast.success('Institution updated successfully');
      } else {
        // Add new institution
        const response = await axiosInstance.post('/institutions', institutionData);
        setPrograms([...programs, response.data]);
        setFilteredPrograms([...programs, response.data]);
        toast.success('Institution added successfully');
      }
      setShowInstitutionModal(false);
    } catch (error) {
      toast.error('Failed to save institution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStudent = () => {
    setStudentFormData({
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
    setSelectedStudent(null);
    setShowStudentModal(true);
  };

  const handleEditStudent = (student) => {
    const { photo_passport, transfers, ...rest } = student;
    setStudentFormData(rest);
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleDeleteStudent = (student) => {
    setStudentToDelete(student);
    setShowDeleteStudentModal(true);
  };

  const handleConfirmDeleteStudent = async () => {
    setIsSubmitting(true);
    try {
      await axiosInstance.delete(`/students/${studentToDelete.id}`);
      // Fetch fresh data after deletion
      const response = await axiosInstance.get('/students');
      setStudents(response?.data?.data || []);
      setFilteredStudents(response?.data?.data || []);
      
      toast.success('Student deleted successfully');
      setShowDeleteStudentModal(false);
    } catch (error) {
      toast.error('Failed to delete student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setStudentFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmitStudentForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedStudent) {
        const { photo_passport, transfers, ...updateData } = studentFormData;
        await axiosInstance.put(`/students/${selectedStudent.id}`, updateData);
        
        // Fetch fresh data after update
        const response = await axiosInstance.get('/students');
        setStudents(response?.data?.data || []);
        setFilteredStudents(response?.data?.data || []);
        
        toast.success('Student updated successfully');
      } else {
        await axiosInstance.post('/students', studentFormData);
        
        // Fetch fresh data after creation
        const response = await axiosInstance.get('/students');
        setStudents(response?.data?.data || []);
        setFilteredStudents(response?.data?.data || []);
        
        toast.success('Student added successfully');
      }
      setShowStudentModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPrograms = Array.isArray(filteredPrograms) ? filteredPrograms.slice(indexOfFirstItem, indexOfLastItem) : [];
  const currentStudents = Array.isArray(filteredStudents) ? filteredStudents.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalProgramPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  const totalStudentPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const renderLocation = (location) => {
    if (!location) return '';
    const { province, district, sector, cell, village } = location;
    return `${province}, ${district}, ${sector}, ${cell}, ${village}`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Manage Institution':
        return (
          <div className="transition-all duration-300 ease-in-out">
            <div className="space-y-6">
              {/* Search and Entries Section */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                {/* <Button
                  onClick={handleAddInstitution}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Institution
                </Button> */}

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Show entries:</span>
                    <select
                      className="border rounded px-2 py-1"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search institutions..."
                      className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
                      onChange={(e) => handleSearch(e.target.value, 'programs')}
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
                <PrintButton title='Instutitions Report'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px] text-xs">Name</TableHead>
                      <TableHead className="min-w-[150px] text-xs">Domain</TableHead>
                      <TableHead className="min-w-[150px] text-xs">Category</TableHead>
                      {/* <TableHead className="min-w-[200px] text-xs">Location</TableHead> */}
                      {/* <TableHead className="min-w-[150px] text-xs">Legal Rep.</TableHead> */}
                      <TableHead className="w-[150px] text-xs">Operation</TableHead>
                    </TableRow>
                  </TableHeader>  
                  <TableBody>
                    {currentPrograms.map((program) => (
                      <TableRow key={program.id}>
                        <TableCell className="text-xs font-medium">{program.name}</TableCell>
                        <TableCell className="text-xs">{program.domain}</TableCell>
                        <TableCell className="text-xs">{program.category}</TableCell>
                        {/* <TableCell className="text-xs"> */}
                          {/* {`${program.location_province}, ${program.location_district}`} */}
                        {/* </TableCell> */}
                        {/* <TableCell className="text-xs">{program.legalRepresentativeName}</TableCell> */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <ActionButton
                              moduleId={MODULE_IDS.ISONGA_PROGRAMS}
                              action={ACTIONS.READ}
                              onClick={() => handleViewDetails(program)}
                              className="p-1 rounded-lg hover:bg-gray-100"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </ActionButton>
                            
                            <ActionButton
                              moduleId={MODULE_IDS.ISONGA_PROGRAMS}
                              action={ACTIONS.UPDATE}
                              onClick={() => handleEditInstitution(program)}
                              className="p-1 rounded-lg hover:bg-gray-100"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </ActionButton>
                            
                            <ActionButton
                              moduleId={MODULE_IDS.ISONGA_PROGRAMS}
                              action={ACTIONS.DELETE}
                              onClick={() => handleDeleteInstitution(program)}
                              className="p-1 rounded-lg hover:bg-red-50 text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </ActionButton>
                            <button
                              onClick={() => handleViewStudents(program)}
                              className="p-1 rounded-lg hover:bg-gray-100"
                              title="View Students"
                            >
                              <Users className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </PrintButton>
              </div>
            </div>
          </div>
        );

      case 'Manage Students':
        return (
          <div className="transition-all duration-300 ease-in-out">
            <div className="space-y-6">
              {/* Search and Entries Section */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <Button
                  onClick={handleAddStudent}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Student
                </Button>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Show entries:</span>
                    <select
                      className="border rounded px-2 py-1"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
                      onChange={(e) => handleSearch(e.target.value, 'students')}
                    />
                  </div>
                </div>
              </div>

              {/* Students Table */}
              <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
                <PrintButton title='Students Report'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px] text-xs">First Name</TableHead>
                      <TableHead className="min-w-[150px] text-xs">Last Name</TableHead>
                      <TableHead className="min-w-[80px] text-xs">Gender</TableHead>
                      {/* <TableHead className="min-w-[120px] text-xs">Date of Birth</TableHead> */}
                      {/* <TableHead className="min-w-[150px] text-xs">Place of Birth</TableHead> */}
                      {/* <TableHead className="min-w-[150px] text-xs">Place of Residence</TableHead> */}
                      {/* <TableHead className="min-w-[150px] text-xs">ID/Passport No</TableHead> */}
                      {/* <TableHead className="min-w-[100px] text-xs">Nationality</TableHead>
                      <TableHead className="min-w-[150px] text-xs">Other Nationality</TableHead>
                      <TableHead className="min-w-[200px] text-xs">Parents/Guardian Names</TableHead>
                      <TableHead className="min-w-[200px] text-xs">School/Academy/Center</TableHead>
                      <TableHead className="min-w-[150px] text-xs">Type of Institution</TableHead> */}
                      <TableHead className="min-w-[80px] text-xs">Class</TableHead>
                      <TableHead className="min-w-[100px] text-xs">Game Type</TableHead>
                      <TableHead className="min-w-[150px] text-xs">Contact</TableHead>
                      <TableHead className="w-[150px] text-xs">Operation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="text-xs font-medium">{student.firstName}</TableCell>
                        <TableCell className="text-xs">{student.lastName}</TableCell>
                        <TableCell className="text-xs">{student.gender}</TableCell>
                        {/* <TableCell className="text-xs">{student.dateOfBirth}</TableCell> */}
                        {/* <TableCell className="text-xs">{student.placeOfBirth}</TableCell> */}
                        {/* <TableCell className="text-xs">{student.placeOfResidence}</TableCell> */}
                        {/* <TableCell className="text-xs">{student.idPassportNo}</TableCell> */}
                        {/* <TableCell className="text-xs">{student.nationality}</TableCell>
                        <TableCell className="text-xs">{student.otherNationality}</TableCell>
                        <TableCell className="text-xs">{student.namesOfParentsGuardian}</TableCell>
                        <TableCell className="text-xs">{student.nameOfSchoolAcademyTrainingCenter}</TableCell>
                        <TableCell className="text-xs">{student.typeOfSchoolAcademyTrainingCenter}</TableCell> */}
                        <TableCell className="text-xs">{student.class}</TableCell>
                        <TableCell className="text-xs">{student.typeOfGame}</TableCell>
                        <TableCell className="text-xs">{student.contact}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleViewStudentDetails(student)}
                              className="p-1 rounded-lg hover:bg-gray-100"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditStudent(student)}
                              className="p-1 rounded-lg hover:bg-gray-100"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student)}
                              className="p-1 rounded-lg hover:bg-red-50 text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </PrintButton>
              </div>
            </div>
          </div>
        );

      case 'Student Transfer':
        return (
          <StudentTransferForm
            schools={schools}
            students={students || []}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        );

      default:
        return null;
    }
  };

  const handleNIDLookup = async (id, type) => {
    setIsLoadingNIDA(true);
    setIdError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response
      const mockData = {
        firstName: 'John',
        lastName: 'Doe',
        gender: 'Male',
        dateOfBirth: '1990-01-01',
        photo: null,
        address: {
          province: 'Kigali',
          district: 'Gasabo',
          sector: 'Kimironko',
          cell: 'Kibagabaga',
          village: 'Nyagatovu'
        }
      };
      
      setNidaData(mockData);
    } catch (error) {
      setIdError('Failed to verify ID. Please try again.');
    } finally {
      setIsLoadingNIDA(false);
    }
  };

  const handleViewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const handleViewStudents = (program) => {
    setSelectedProgram(program);
    setShowStudentsModal(true);
  };

  const handleViewDetails = (program) => {
    setSelectedStudent(null);
    setSelectedProgram(program);
    setShowDetailsModal(true);
  };

  const handleCreate = async (formData) => {
    try {
      await axiosInstance.post('/isonga-programs', formData);
      toast.success('Program created successfully');
      // Refresh data after creation
      fetchData();
    } catch (error) {
      toast.error('Failed to create program');
      console.error(error);
    }
  };

  const handleEdit = async (program) => {
    try {
      setSelectedProgram(program);
      setShowInstitutionModal(true);
    } catch (error) {
      toast.error('Failed to edit program');
      console.error(error);
    }
  };

  const handleDelete = async (program) => {
    try {
      setInstitutionToDelete(program);
      setShowDeleteInstitutionModal(true);
    } catch (error) {
      toast.error('Failed to delete program');
      console.error(error);
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {message && (
        <Message
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Isonga Programs
        </h1>
        
        <ActionButton 
          moduleId={MODULE_IDS.ISONGA_PROGRAMS}
          action={ACTIONS.CREATE}
          onClick={handleAddInstitution}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          disabled={isSubmitting}
        >
          <Plus className="h-5 w-5" />
          <span>Add Institution</span>
        </ActionButton>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          {['Manage Institution', 'Manage Students', 'Student Transfer'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-500 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Dynamic Tab Content with Transition */}
      <div className="relative">
        {renderTabContent()}
      </div>

      {/* Add/Edit Institution Modal */}
      <Modal
        isOpen={showInstitutionModal}
        onClose={() => setShowInstitutionModal(false)}
        title={selectedInstitution ? "Edit Institution" : "Add Institution"}
        // style={{ maxWidth: '1000px', width: '200%', margin: '0 auto' }}
      >
        <InstitutionForm
          institution={selectedInstitution}
          onSubmit={handleInstitutionSubmit}
          onCancel={() => setShowInstitutionModal(false)}
        />
      </Modal>

      {/* Delete Institution Confirmation Dialog */}
      <Dialog open={showDeleteInstitutionModal} onOpenChange={setShowDeleteInstitutionModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Institution
            </DialogTitle>
            <DialogDescription className="py-4">
              <div className="space-y-2">
                <p>Are you sure you want to delete this institution?</p>
                {institutionToDelete && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p><span className="font-semibold">Name:</span> {institutionToDelete.name}</p>
                    <p><span className="font-semibold">Location:</span> {renderLocation(institutionToDelete.location)}</p>
                    <p><span className="font-semibold">Category:</span> {institutionToDelete.category}</p>
                  </div>
                )}
                <p className="text-sm text-red-600">This action cannot be undone.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteInstitutionModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteInstitution}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Institution'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Student Modal */}
      <Modal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        title={selectedStudent ? "Edit Student" : "Add Student"}
      >
       <form onSubmit={handleSubmitStudentForm} className="max-h-[70vh] overflow-y-auto pr-4 space-y-6">
  <div className="grid grid-cols-1 gap-4"> {/* Change grid-cols-2 to grid-cols-1 */}
    <div>
      <label className="block text-sm font-medium mb-1">First Name</label>
      <input
        type="text"
        name="firstName"
        value={studentFormData.firstName}
        onChange={handleFormChange}
        className="w-full border rounded-lg px-3 py-2"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Last Name</label>
      <input
        type="text"
        name="lastName"
        value={studentFormData.lastName}
        onChange={handleFormChange}
        className="w-full border rounded-lg px-3 py-2"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Gender</label>
      <select
        name="gender"
        value={studentFormData.gender}
        onChange={handleFormChange}
        className="w-full border rounded-lg px-3 py-2"
        required
      >
        <option value="">Select Gender</option>
        <option value="MALE">Male</option>
        <option value="FEMALE">Female</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Date of Birth</label>
      <input
        type="date"
        name="dateOfBirth"
        value={studentFormData.dateOfBirth}
        onChange={handleFormChange}
        className="w-full border rounded-lg px-3 py-2"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Place of Birth</label>
      <input
        type="text"
        name="placeOfBirth"
        value={studentFormData.placeOfBirth}
        onChange={handleFormChange}
        className="w-full border rounded-lg px-3 py-2"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Place of Residence</label>
      <input
        type="text"
        name="placeOfResidence"
        value={studentFormData.placeOfResidence}
        onChange={handleFormChange}
        className="w-full border rounded-lg px-3 py-2"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">ID/Passport No</label>
      <input
        type="text"
        name="idPassportNo"
        value={studentFormData.idPassportNo}
        onChange={handleFormChange}
        className="w-full border rounded-lg px-3 py-2"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Nationality</label>
      <select
        name="nationality"
        value={studentFormData.nationality}
        onChange={handleFormChange}
        className="w-full border rounded-lg px-3 py-2"
        required
      >
        <option value="">Select Nationality</option>
        {countries.map((country) => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Other Nationality</label>
      <select
        name="otherNationality"
        value={studentFormData.otherNationality}
        onChange={handleFormChange}
        className="w-full border rounded-lg px-3 py-2"
      >
        <option value="">Select Other Nationality (Optional)</option>
        {countries.map((country) => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Parents/Guardian Names</label>
      <input
        type="text"
        name="namesOfParentsGuardian"
        value={studentFormData.namesOfParentsGuardian}
        onChange={handleFormChange}
        className="w-full border rounded-lg px-3 py-2"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">School/Academy/Center</label>
      <select
        name="nameOfSchoolAcademyTrainingCenter"
        value={studentFormData.nameOfSchoolAcademyTrainingCenter}
        onChange={handleFormChange}
        className="w-full border rounded-lg px-3 py-2"
        required
      >
        <option value="">Select Institution</option>
        {programs.map((institution) => (
          <option key={institution.id} value={institution.name}>
            {institution.name}
          </option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Type of Institution</label>
      <select
        name="typeOfSchoolAcademyTrainingCenter"
        value={studentFormData.typeOfSchoolAcademyTrainingCenter}
        onChange={handleFormChange}
        className="w-full border rounded-lg px-3 py-2"
        required
      >
        <option value="">Select Institution Type</option>
        {institutionTypes.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Class</label>
      <select
        name="class"
        value={studentFormData.class}
        onChange={handleFormChange}
        className="w-full border rounded-lg px-3 py-2"
        required
      >
        <option value="">Select Class</option>
        {classOptions.map((classOption) => (
          <option key={classOption} value={classOption}>{classOption}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Game Type</label>
      <select
        name="typeOfGame"
        value={studentFormData.typeOfGame}
        onChange={handleFormChange}
        className="w-full border rounded-lg px-3 py-2"
        required
      >
        <option value="">Select Game Type</option>
        {gameTypes.map((game) => (
          <option key={game} value={game}>{game}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Contact</label>
      <input
        type="text"
        name="contact"
        value={studentFormData.contact}
        onChange={handleFormChange}
        className="w-full border rounded-lg px-3 py-2"
        required
      />
    </div>
  </div>

  <div className="flex justify-end gap-3 pt-4 border-t">
    <Button
      type="button"
      variant="outline"
      onClick={() => setShowStudentModal(false)}
    >
      Cancel
    </Button>
    <Button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 text-white"
      disabled={isSubmitting}
    >
      {selectedStudent ? 'Save Changes' : 'Add Student'}
    </Button>
  </div>
</form>

      </Modal>

      {/* Delete Student Confirmation Dialog */}
      <Dialog open={showDeleteStudentModal} onOpenChange={setShowDeleteStudentModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Student
            </DialogTitle>
            <DialogDescription className="py-4">
              <div className="space-y-2">
                <p>Are you sure you want to delete this student?</p>
                {studentToDelete && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p><span className="font-semibold">Name:</span> {studentToDelete.firstName} {studentToDelete.lastName}</p>
                    <p><span className="font-semibold">School:</span> {studentToDelete.nameOfSchoolAcademyTrainingCenter}</p>
                    <p><span className="font-semibold">Class:</span> {studentToDelete.class}</p>
                  </div>
                )}
                <p className="text-sm text-red-600">This action cannot be undone.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteStudentModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteStudent}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Student'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              {selectedStudent ? 'Student Details' : 'Institution Details'}
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => window.print()} 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print Details
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedStudent ? (
            <div className="space-y-6 py-4">
              {/* Photo Section */}
              <div className="flex justify-center">
                {selectedStudent.photo_passport ? (
                  <img 
                    src={selectedStudent.photo_passport} 
                    alt="Student" 
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                    <span className="text-gray-500">No Photo</span>
                  </div>
                )}
              </div>

              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-600 block">Name</label>
                    <p className="mt-1">
                      {`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">School</label>
                    <p className="mt-1">
                      {selectedStudent.nameOfSchoolAcademyTrainingCenter || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Date of Birth</label>
                    <p className="mt-1">
                      {new Date(selectedStudent.dateOfBirth).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Nationality</label>
                    <p className="mt-1">{selectedStudent.nationality || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Gender</label>
                    <p className="mt-1">{selectedStudent.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Class</label>
                    <p className="mt-1">{selectedStudent.class || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Place of Birth</label>
                    <p className="mt-1">{selectedStudent.placeOfBirth || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Place of Residence</label>
                    <p className="mt-1">{selectedStudent.placeOfResidence || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">ID/Passport No</label>
                    <p className="mt-1">{selectedStudent.idPassportNo || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Other Nationality</label>
                    <p className="mt-1">{selectedStudent.otherNationality || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Parents/Guardian</label>
                    <p className="mt-1">{selectedStudent.namesOfParentsGuardian || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Contact</label>
                    <p className="mt-1">{selectedStudent.contact || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Game Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Game Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-600 block">Game Type</label>
                    <p className="mt-1">{selectedStudent.typeOfGame || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Position/Role</label>
                    <p className="mt-1">{selectedStudent.position || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* School Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">School Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-600 block">Institution Type</label>
                    <p className="mt-1">{selectedStudent.typeOfSchoolAcademyTrainingCenter || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">School Name</label>
                    <p className="mt-1">{selectedStudent.nameOfSchoolAcademyTrainingCenter || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedProgram && (
            <div className="space-y-6 py-4">
              {/* Institution Information */}
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Institution Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-600 block">Name</label>
                    <p className="mt-1">{selectedProgram.name}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Domain</label>
                    <p className="mt-1">{selectedProgram.domain || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Category</label>
                    <p className="mt-1">{selectedProgram.category || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Legal Representative</label>
                    <p className="mt-1">{selectedProgram.legalRepresentativeName || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Location Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-600 block">Province</label>
                    <p className="mt-1">{selectedProgram.location_province || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">District</label>
                    <p className="mt-1">{selectedProgram.location_district || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Sector</label>
                    <p className="mt-1">{selectedProgram.location_sector || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Cell</label>
                    <p className="mt-1">{selectedProgram.location_cell || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Village</label>
                    <p className="mt-1">{selectedProgram.location_village || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-600 block">Email</label>
                    <p className="mt-1">{selectedProgram.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Phone</label>
                    <p className="mt-1">{selectedProgram.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Website</label>
                    <p className="mt-1">{selectedProgram.website || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-600 block">Registration Date</label>
                    <p className="mt-1">
                      {selectedProgram.registrationDate ? 
                        new Date(selectedProgram.registrationDate).toLocaleDateString() : 
                        'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Status</label>
                    <p className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedProgram.status === 'active' ? 
                          'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                      }`}>
                        {selectedProgram.status || 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showStudentsModal} onOpenChange={setShowStudentsModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              Students - {selectedProgram?.name}
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => window.print()} 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print List
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px] text-xs">Name</TableHead>
                  <TableHead className="min-w-[100px] text-xs">Gender</TableHead>
                  <TableHead className="min-w-[120px] text-xs">Date of Birth</TableHead>
                  <TableHead className="min-w-[150px] text-xs">Contact</TableHead>
                  <TableHead className="w-[100px] text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students
                  .filter(student => 
                    student.nameOfSchoolAcademyTrainingCenter === selectedProgram?.name
                  )
                  .map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="text-xs font-medium">
                        {`${student.firstName} ${student.lastName}`}
                      </TableCell>
                      <TableCell className="text-xs">{student.gender}</TableCell>
                      <TableCell className="text-xs">
                        {new Date(student.dateOfBirth).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs">{student.contact}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ActionButton
                            moduleId={MODULE_IDS.ISONGA_PROGRAMS}
                            action={ACTIONS.READ}
                            onClick={() => {
                              setShowStudentsModal(false);
                              handleViewStudentDetails(student);
                            }}
                            className="p-1 rounded-lg hover:bg-gray-100"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </ActionButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {students.filter(student => 
              student.nameOfSchoolAcademyTrainingCenter === selectedProgram?.name
            ).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No students found for this institution
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button onClick={() => setShowStudentsModal(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex gap-2 mt-4">
        <ActionButton 
          moduleId={MODULE_IDS.ISONGA_PROGRAMS}
          action={ACTIONS.CREATE}
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Add Program
        </ActionButton>

        {selectedProgram && (
          <>
            <ActionButton 
              moduleId={MODULE_IDS.ISONGA_PROGRAMS}
              action={ACTIONS.UPDATE}
              onClick={() => handleEdit(selectedProgram)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Edit Program
            </ActionButton>

            <ActionButton 
              moduleId={MODULE_IDS.ISONGA_PROGRAMS}
              action={ACTIONS.DELETE}
              onClick={() => handleDelete(selectedProgram)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Program
            </ActionButton>
          </>
        )}
      </div>
    </div>
  );
};

export default withRBAC(IsongaPrograms, MODULE_IDS.ISONGA_PROGRAMS);