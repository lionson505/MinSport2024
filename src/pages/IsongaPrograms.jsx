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
import { Search, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
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
        
        const studentData = studentsResponse?.data?.data || [];
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
      const updatedStudents = students.filter(s => s.id !== studentToDelete.id);
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      setMessage({
        type: 'success',
        text: 'Student deleted successfully'
      });
      setShowDeleteStudentModal(false);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to delete student'
      });
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
        const updatedStudents = students.map(s => 
          s.id === selectedStudent.id ? { ...s, ...updateData } : s
        );
        setStudents(updatedStudents);
        setFilteredStudents(updatedStudents);
        toast.success('Student updated successfully');
      } else {
        const response = await axiosInstance.post('/students', studentFormData);
        setStudents([...students, response.data]);
        setFilteredStudents([...students, response.data]);
        toast.success('Student added successfully');
      }
      setShowStudentModal(false);
    } catch (error) {
      toast.error('Failed to save student');
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px] text-xs">Name</TableHead>
                      <TableHead className="min-w-[100px] text-xs">Location</TableHead>
                      <TableHead className="min-w-[150px] text-xs">Category</TableHead>
                      <TableHead className="w-[150px] text-xs">Operation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPrograms.map((program) => (
                      <TableRow key={program.id}>
                        <TableCell className="text-xs font-medium">{program.name}</TableCell>
                        <TableCell className="text-xs">{renderLocation(program.location)}</TableCell>
                        <TableCell className="text-xs">{program.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditInstitution(program)}
                              className="p-1 rounded-lg hover:bg-gray-100"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteInstitution(program)}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px] text-xs">First Name</TableHead>
                      <TableHead className="min-w-[150px] text-xs">Last Name</TableHead>
                      <TableHead className="min-w-[80px] text-xs">Gender</TableHead>
                      <TableHead className="min-w-[120px] text-xs">Date of Birth</TableHead>
                      <TableHead className="min-w-[150px] text-xs">Place of Birth</TableHead>
                      <TableHead className="min-w-[150px] text-xs">Place of Residence</TableHead>
                      <TableHead className="min-w-[150px] text-xs">ID/Passport No</TableHead>
                      <TableHead className="min-w-[100px] text-xs">Nationality</TableHead>
                      <TableHead className="min-w-[150px] text-xs">Other Nationality</TableHead>
                      <TableHead className="min-w-[200px] text-xs">Parents/Guardian Names</TableHead>
                      <TableHead className="min-w-[200px] text-xs">School/Academy/Center</TableHead>
                      <TableHead className="min-w-[150px] text-xs">Type of Institution</TableHead>
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
                        <TableCell className="text-xs">{student.dateOfBirth}</TableCell>
                        <TableCell className="text-xs">{student.placeOfBirth}</TableCell>
                        <TableCell className="text-xs">{student.placeOfResidence}</TableCell>
                        <TableCell className="text-xs">{student.idPassportNo}</TableCell>
                        <TableCell className="text-xs">{student.nationality}</TableCell>
                        <TableCell className="text-xs">{student.otherNationality}</TableCell>
                        <TableCell className="text-xs">{student.namesOfParentsGuardian}</TableCell>
                        <TableCell className="text-xs">{student.nameOfSchoolAcademyTrainingCenter}</TableCell>
                        <TableCell className="text-xs">{student.typeOfSchoolAcademyTrainingCenter}</TableCell>
                        <TableCell className="text-xs">{student.class}</TableCell>
                        <TableCell className="text-xs">{student.typeOfGame}</TableCell>
                        <TableCell className="text-xs">{student.contact}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditStudent(student)}
                              className="p-1 rounded-lg hover:bg-gray-100"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
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
              </div>
            </div>
          </div>
        );

      case 'Student Transfer':
        return (
          <StudentTransferForm
            schools={schools}
            students={students}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        );

      default:
        return null;
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
        <Button 
          onClick={handleAddInstitution}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          disabled={isSubmitting}
        >
          <Plus className="h-5 w-5" />
          <span>Add Institution</span>
        </Button>
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
          <div className="grid grid-cols-2 gap-4">
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
              <input
                type="text"
                name="nationality"
                value={studentFormData.nationality}
                onChange={handleFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Other Nationality</label>
              <input
                type="text"
                name="otherNationality"
                value={studentFormData.otherNationality}
                onChange={handleFormChange}
                className="w-full border rounded-lg px-3 py-2"
              />
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
              <input
                type="text"
                name="nameOfSchoolAcademyTrainingCenter"
                value={studentFormData.nameOfSchoolAcademyTrainingCenter}
                onChange={handleFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type of Institution</label>
              <input
                type="text"
                name="typeOfSchoolAcademyTrainingCenter"
                value={studentFormData.typeOfSchoolAcademyTrainingCenter}
                onChange={handleFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Class</label>
              <input
                type="text"
                name="class"
                value={studentFormData.class}
                onChange={handleFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Game Type</label>
              <input
                type="text"
                name="typeOfGame"
                value={studentFormData.typeOfGame}
                onChange={handleFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
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
    </div>
  );
};

export default IsongaPrograms;
