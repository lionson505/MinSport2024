// src/pages/IsongaPrograms.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../utils/axiosInstance';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui/table';
import {Search, Plus, Pencil, Trash2, AlertCircle, Eye, Users, Printer, Loader2} from 'lucide-react';
import { toast } from 'react-hot-toast';
import PageLoading from '../components/ui/PageLoading';
import Message from '../components/ui/Message';
import { useDarkMode } from '../contexts/DarkModeContext';
import { Button } from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { usePermissionLogger } from "../utils/permissionLogger.js";
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

const IsongaPrograms = () => {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('Manage School');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [filteredCoaches, setFilteredCoaches] = useState([]);
  const [peTeachers, setPeTeachers] = useState([]);
  const [filteredPeTeachers, setFilteredPeTeachers] = useState([]);
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
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showDeleteCoachModal, setShowDeleteCoachModal] = useState(false);
  const [coachToDelete, setCoachToDelete] = useState(null);
  const [showPeTeacherModal, setShowPeTeacherModal] = useState(false);
  const [selectedPeTeacher, setSelectedPeTeacher] = useState(null);
  const [showDeletePeTeacherModal, setShowDeletePeTeacherModal] = useState(false);
  const [peTeacherToDelete, setPeTeacherToDelete] = useState(null);
  
  // PDF Report Filters
  const [reportFilters, setReportFilters] = useState({
    category: '',
    province: '',
    district: '',
    sector: '',
    sportDiscipline: '',
    section: '',
    schoolName: ''
  });

  // Coach Report Filters
  const [coachFilters, setCoachFilters] = useState({
    name: '',
    school: '',
    sport: '',
    section: '',
    qualification: '',
    position: '',
    trainingType: ''
  });

  // PE Teacher Report Filters
  const [peTeacherFilters, setPeTeacherFilters] = useState({
    name: '',
    school: '',
    sportOfInterest: '',
    experience: ''
  });
  
  const logPermissions = usePermissionLogger('isonga_programs');
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false
  });

  const [studentFormData, setStudentFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'MALE',
    dateOfBirth: '2024-12-31',
    placeOfBirth: '',
    placeOfResidence: '',
    idPassportNo: '',
    sdmsNumber: '',
    nationality: '',
    otherNationality: '',
    fatherGuardianNames: '',
    motherGuardianNames: '',
    typeOfSchoolAcademyTrainingCenter: '',
    class: '',
    typeOfGame: '',
    section: '',
    contact: '',
    institutionId: 0
  });

  const [coachFormData, setCoachFormData] = useState({
    name: '',
    age: '',
    sport: '',
    section: '',
    school: '',
    qualification: '',
    email: '',
    tel: '',
    position: '',
    trainingTypes: []
  });

  // Training type options
  const trainingTypeOptions = [
    'Technical and Tactical Training',
    'Physical Conditioning and Fitness Training',
    'Coaching Methodology and Pedagogy',
    'Communication and Leadership Skills',
    'Sports Psychology and Athlete Well-being',
    'Monitoring, Evaluation, and Data Management',
    'Governance, Ethics, and Professional Development',
    'Administrative and Program Management'
  ];

  const [peTeacherFormData, setPeTeacherFormData] = useState({
    names: '',
    age: '',
    experience: '',
    school: '',
    sportOfInterest: '',
    email: '',
    tel: ''
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
  const [tabs] = useState(['Manage School', 'Manage Students', 'Student Transfer', 'Coaches', 'PE Teachers']);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selected institution derived from chosen institutionId
  const derivedSelectedInstitution = useMemo(() => {
    const id = Number(studentFormData.institutionId);
    if (!id) return null;
    return Array.isArray(programs) ? programs.find(p => Number(p.id) === id) : null;
  }, [programs, studentFormData.institutionId]);

  // Available game types based on selected institution's disciplines/sports
  const availableGameTypes = useMemo(() => {
    const inst = derivedSelectedInstitution;
    if (!inst) return [];
    const candidates = inst.sportsDisciplines || inst.disciplines || inst.sports || inst.gameTypes || inst.types_of_sports || inst.typesOfSports;
    if (Array.isArray(candidates)) return candidates;
    if (typeof candidates === 'string') {
      return candidates.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }, [derivedSelectedInstitution]);

  // Available sections based on selected institution and sport discipline
  const availableSections = useMemo(() => {
    const selectedSport = studentFormData.typeOfGame;
    const inst = derivedSelectedInstitution;
    
    if (!selectedSport || !inst) return [];
    
    // Get sections from institution based on selected sport
    // Institution sections are stored as an object with sport names as keys
    // e.g., { "Football": ["Male", "Female"], "Volleyball": ["Male", "Female"] }
    if (inst.sections && typeof inst.sections === 'object') {
      // If sections is an object with sport-specific sections
      const sportSections = inst.sections[selectedSport];
      if (Array.isArray(sportSections)) {
        return sportSections;
      }
    }
    
    // If sections is a simple array, return it for any sport
    if (Array.isArray(inst.sections)) {
      return inst.sections;
    }
    
    // If sections is a string, split it
    if (typeof inst.sections === 'string') {
      return inst.sections.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    // Fallback: return default sections based on sport
    const defaultSections = {
      'Football': ['Male', 'Female'],
      'Basketball': ['Male', 'Female'],
      'Volleyball': ['Male', 'Female'],
      'Tennis': ['Male', 'Female'],
      'Swimming': ['Male', 'Female'],
      'Athletics': ['Male', 'Female'],
      'Handball': ['Male', 'Female'],
      'Cycling': ['Male', 'Female'],
      'Netball': ['Male', 'Female'],
      'Rugby': ['Male', 'Female'],
      'Hockey': ['Male', 'Female']
    };
    
    return defaultSections[selectedSport] || ['Male', 'Female'];
  }, [studentFormData.typeOfGame, derivedSelectedInstitution]);

  // Reset game type and section when institution selection changes
  useEffect(() => {
    setStudentFormData(prev => ({ ...prev, typeOfGame: '', section: '' }));
  }, [studentFormData.institutionId]);

  // Reset section when sport discipline changes
  useEffect(() => {
    setStudentFormData(prev => ({ ...prev, section: '' }));
  }, [studentFormData.typeOfGame]);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [programsResponse, studentsResponse] = await Promise.all([
          axiosInstance.get('/institutions'),
          axiosInstance.get('/students'),
        ]);
        const currentPermissions = await logPermissions();
        await setPermissions(currentPermissions);
        await setLoading(false);
        setPrograms(programsResponse?.data || []);
        setFilteredPrograms(programsResponse?.data || []);

        const studentData = studentsResponse?.data?.data || [];
        setStudents(studentData);
        setFilteredStudents(studentData);

        // Use institutions as schools for transfer functionality
        setSchools(programsResponse?.data || []);

        // Load coaches and PE teachers from API
        try {
          const [coachesResponse, peTeachersResponse] = await Promise.all([
            axiosInstance.get('/coaches'),
            axiosInstance.get('/pe-teachers')
          ]);

          const coachesData = coachesResponse?.data?.data || [];
          const peTeachersData = peTeachersResponse?.data?.data || [];

          setCoaches(coachesData);
          setFilteredCoaches(coachesData);
          setPeTeachers(peTeachersData);
          setFilteredPeTeachers(peTeachersData);
        } catch (error) {
          console.error('Error loading coaches and PE teachers:', error);
          // Initialize empty arrays if API fails
          setCoaches([]);
          setFilteredCoaches([]);
          setPeTeachers([]);
          setFilteredPeTeachers([]);
        }

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

  // Filter helper functions for PDF reports
  const getUniqueCategories = () => {
    return [...new Set(programs.map(p => p.category).filter(Boolean))];
  };

  const getUniqueProvinces = () => {
    return [...new Set(programs.map(p => p.location_province).filter(Boolean))];
  };

  const getUniqueDistricts = () => {
    if (reportFilters.province) {
      return [...new Set(programs
        .filter(p => p.location_province === reportFilters.province)
        .map(p => p.location_district)
        .filter(Boolean))];
    }
    return [...new Set(programs.map(p => p.location_district).filter(Boolean))];
  };

  const getUniqueSectors = () => {
    let filtered = programs;
    if (reportFilters.province) {
      filtered = filtered.filter(p => p.location_province === reportFilters.province);
    }
    if (reportFilters.district) {
      filtered = filtered.filter(p => p.location_district === reportFilters.district);
    }
    return [...new Set(filtered.map(p => p.location_sector).filter(Boolean))];
  };

  const getUniqueSportDisciplines = () => {
    const allSports = programs.flatMap(p => 
      Array.isArray(p.sportsDisciplines) ? p.sportsDisciplines : []
    );
    return [...new Set(allSports)];
  };

  const getUniqueSections = () => {
    const allSections = programs.flatMap(p => {
      if (!p.sections) return [];
      if (Array.isArray(p.sections)) return p.sections;
      if (typeof p.sections === 'object') return Object.values(p.sections).flat();
      if (typeof p.sections === 'string') return p.sections.split(',').map(s => s.trim());
      return [];
    });
    return [...new Set(allSections.filter(Boolean))];
  };

  // Apply filters to programs for PDF reports
  const getFilteredProgramsForReport = () => {
    return programs.filter(program => {
      if (reportFilters.category && program.category !== reportFilters.category) return false;
      if (reportFilters.province && program.location_province !== reportFilters.province) return false;
      if (reportFilters.district && program.location_district !== reportFilters.district) return false;
      if (reportFilters.sector && program.location_sector !== reportFilters.sector) return false;
      if (reportFilters.schoolName && !program.name.toLowerCase().includes(reportFilters.schoolName.toLowerCase())) return false;
      
      if (reportFilters.sportDiscipline) {
        const hasSport = Array.isArray(program.sportsDisciplines) && 
          program.sportsDisciplines.includes(reportFilters.sportDiscipline);
        if (!hasSport) return false;
      }
      
      if (reportFilters.section) {
        let hasSection = false;
        if (Array.isArray(program.sections)) {
          hasSection = program.sections.includes(reportFilters.section);
        } else if (typeof program.sections === 'object' && program.sections !== null) {
          hasSection = Object.values(program.sections).flat().includes(reportFilters.section);
        } else if (typeof program.sections === 'string') {
          hasSection = program.sections.split(',').map(s => s.trim()).includes(reportFilters.section);
        }
        if (!hasSection) return false;
      }
      
      return true;
    });
  };

  // Reset dependent filters when parent filter changes
  const handleFilterChange = (filterName, value) => {
    setReportFilters(prev => {
      const newFilters = { ...prev, [filterName]: value };
      
      // Reset dependent filters
      if (filterName === 'province') {
        newFilters.district = '';
        newFilters.sector = '';
      } else if (filterName === 'district') {
        newFilters.sector = '';
      }
      
      return newFilters;
    });
  };

  // Coach filter functions
  const getUniqueCoachSchools = () => {
    return [...new Set(coaches.map(c => c.school).filter(Boolean))];
  };

  const getUniqueCoachSports = () => {
    return [...new Set(coaches.map(c => c.sport).filter(Boolean))];
  };

  const getUniqueCoachSections = () => {
    return [...new Set(coaches.map(c => c.section).filter(Boolean))];
  };

  const getUniqueCoachQualifications = () => {
    return [...new Set(coaches.map(c => c.qualification).filter(Boolean))];
  };

  const getUniqueCoachPositions = () => {
    return [...new Set(coaches.map(c => c.position).filter(Boolean))];
  };

  const getUniqueCoachTrainingTypes = () => {
    const allTypes = coaches.flatMap(c => c.trainingTypes || []);
    return [...new Set(allTypes)].filter(Boolean);
  };

  const getFilteredCoachesForReport = () => {
    return coaches.filter(coach => {
      if (coachFilters.name && !coach.name?.toLowerCase().includes(coachFilters.name.toLowerCase())) return false;
      if (coachFilters.school && coach.school !== coachFilters.school) return false;
      if (coachFilters.sport && coach.sport !== coachFilters.sport) return false;
      if (coachFilters.section && coach.section !== coachFilters.section) return false;
      if (coachFilters.qualification && coach.qualification !== coachFilters.qualification) return false;
      if (coachFilters.position && coach.position !== coachFilters.position) return false;
      if (coachFilters.trainingType && (!coach.trainingTypes || !coach.trainingTypes.includes(coachFilters.trainingType))) return false;
      return true;
    });
  };

  const handleCoachFilterChange = (filterName, value) => {
    setCoachFilters(prev => ({ ...prev, [filterName]: value }));
  };

  // PE Teacher filter functions
  const getUniquePeTeacherSchools = () => {
    return [...new Set(peTeachers.map(t => t.school).filter(Boolean))];
  };

  const getUniquePeTeacherSports = () => {
    return [...new Set(peTeachers.map(t => t.sportOfInterest).filter(Boolean))];
  };

  const getUniquePeTeacherExperience = () => {
    return [...new Set(peTeachers.map(t => t.experience).filter(Boolean))];
  };

  const getFilteredPeTeachersForReport = () => {
    return peTeachers.filter(teacher => {
      if (peTeacherFilters.name && !teacher.names?.toLowerCase().includes(peTeacherFilters.name.toLowerCase())) return false;
      if (peTeacherFilters.school && teacher.school !== peTeacherFilters.school) return false;
      if (peTeacherFilters.sportOfInterest && teacher.sportOfInterest !== peTeacherFilters.sportOfInterest) return false;
      if (peTeacherFilters.experience && teacher.experience !== peTeacherFilters.experience) return false;
      return true;
    });
  };

  const handlePeTeacherFilterChange = (filterName, value) => {
    setPeTeacherFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleAddInstitution = () => {
    setSelectedInstitution(null);
    setShowInstitutionModal(true);
  };

  const handleEditInstitution = (institution) => {
    setSelectedInstitution(institution);
    setShowInstitutionModal(true);
  };

  if(loading) {
    return(
        <div className="flex animate-spin animate justify-center items-center h-screen">
          <Loader2/>
        </div>
    )

  }

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

  const handleSearch = async (searchValue, type) => {
    if (!searchValue) {
      if (type === 'programs') {
        setFilteredPrograms(programs);
      } else if (type === 'students') {
        setFilteredStudents(students);
      } else if (type === 'coaches') {
        setFilteredCoaches(coaches);
      } else if (type === 'peTeachers') {
        setFilteredPeTeachers(peTeachers);
      }
      return;
    }

    if (type === 'programs') {
      const filtered = programs.filter(program =>
        program.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        program.domain?.toLowerCase().includes(searchValue.toLowerCase()) ||
        program.category?.toLowerCase().includes(searchValue.toLowerCase()) ||
        program.location_province?.toLowerCase().includes(searchValue.toLowerCase()) ||
        program.location_district?.toLowerCase().includes(searchValue.toLowerCase()) ||
        program.location_sector?.toLowerCase().includes(searchValue.toLowerCase()) ||
        program.legalRepresentativeName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        program.legalRepresentativeEmail?.toLowerCase().includes(searchValue.toLowerCase()) ||
        (Array.isArray(program.sportsDisciplines) && 
         program.sportsDisciplines.some(sport => sport?.toLowerCase().includes(searchValue.toLowerCase()))) ||
        (Array.isArray(program.sections) && 
         program.sections.some(section => section?.toLowerCase().includes(searchValue.toLowerCase())))
      );
      setFilteredPrograms(filtered);
    } else if (type === 'students') {
      const filtered = students.filter(student => {
        // Find the institution for this student
        const studentInstitution = programs.find(p => 
          Number(p.id) === Number(student.institutionId)
        );
        
        return (
          student.firstName?.toLowerCase().includes(searchValue.toLowerCase()) ||
          student.lastName?.toLowerCase().includes(searchValue.toLowerCase()) ||
          student.sdmsNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
          student.nationality?.toLowerCase().includes(searchValue.toLowerCase()) ||
          studentInstitution?.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
          student.section?.toLowerCase().includes(searchValue.toLowerCase()) ||
          student.typeOfGame?.toLowerCase().includes(searchValue.toLowerCase())
        );
      });
      setFilteredStudents(filtered);
    } else if (type === 'coaches') {
      try {
        const response = await axiosInstance.get(`/coaches/search?q=${encodeURIComponent(searchValue)}`);
        const searchResults = response?.data?.data || [];
        setFilteredCoaches(searchResults);
      } catch (error) {
        console.error('Error searching coaches:', error);
        // Fallback to local search
        const filtered = coaches.filter(coach =>
          coach.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
          coach.sport?.toLowerCase().includes(searchValue.toLowerCase()) ||
          coach.school?.toLowerCase().includes(searchValue.toLowerCase()) ||
          coach.position?.toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredCoaches(filtered);
      }
    } else if (type === 'peTeachers') {
      try {
        const response = await axiosInstance.get(`/pe-teachers/search?q=${encodeURIComponent(searchValue)}`);
        const searchResults = response?.data?.data || [];
        setFilteredPeTeachers(searchResults);
      } catch (error) {
        console.error('Error searching PE teachers:', error);
        // Fallback to local search
        const filtered = peTeachers.filter(teacher =>
          teacher.names?.toLowerCase().includes(searchValue.toLowerCase()) ||
          teacher.school?.toLowerCase().includes(searchValue.toLowerCase()) ||
          teacher.sportOfInterest?.toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredPeTeachers(filtered);
      }
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
      // Surface backend error to help identify 400 cause
      const backendData = error?.response?.data;
      const msg = backendData?.error || backendData?.message || error.message || 'Failed to save institution';
      console.error('Institution save failed:', backendData || error);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStudent = () => {
    setStudentFormData({
      firstName: '',
      lastName: '',
      gender: 'MALE',
      dateOfBirth: '2024-12-31',
      placeOfBirth: '',
      placeOfResidence: '',
      idPassportNo: '',
      sdmsNumber: '',
      nationality: '',
      otherNationality: '',
      fatherGuardianNames: '',
      motherGuardianNames: '',
      typeOfSchoolAcademyTrainingCenter: '',
      class: '',
      typeOfGame: '',
      section: '',
      contact: '',
      institutionId: 0
    });
    setSelectedStudent(null);
    setShowStudentModal(true);
  };

  const handleEditStudent = (student) => {
    const { photo_passport, transfers, namesOfParentsGuardian, ...rest } = student;
    setStudentFormData({
      ...rest,
      fatherGuardianNames: student.fatherGuardianNames || namesOfParentsGuardian || '',
      motherGuardianNames: student.motherGuardianNames || ''
    });
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
      const formData = {
        ...studentFormData,
        institutionId: parseInt(studentFormData.institutionId, 10), // Ensure institutionId is an integer
        // Ensure type comes from the selected institution's category
        typeOfSchoolAcademyTrainingCenter: derivedSelectedInstitution?.category || studentFormData.typeOfSchoolAcademyTrainingCenter,
        // Backward compatibility: provide combined field if backend still expects it
        namesOfParentsGuardian: `${studentFormData.fatherGuardianNames || ''}${studentFormData.fatherGuardianNames || studentFormData.motherGuardianNames ? ' / ' : ''}${studentFormData.motherGuardianNames || ''}`.trim()
      };
  
      if (selectedStudent) {
        const { photo_passport, transfers, ...updateData } = formData;
        await axiosInstance.put(`/students/${selectedStudent.id}`, updateData);
  
        // Fetch fresh data after update
        const response = await axiosInstance.get('/students');
        setStudents(response?.data?.data || []);
        setFilteredStudents(response?.data?.data || []);
  
        toast.success('Student updated successfully');
      } else {
        await axiosInstance.post('/students', formData);
  
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

  // Coach handlers
  const handleAddCoach = () => {
    setCoachFormData({
      name: '',
      age: '',
      sport: '',
      section: '',
      school: '',
      qualification: '',
      email: '',
      tel: '',
      position: '',
      trainingTypes: []
    });
    setSelectedCoach(null);
    setShowCoachModal(true);
  };

  const handleEditCoach = (coach) => {
    setCoachFormData({
      name: coach.name || '',
      age: coach.age || '',
      sport: coach.sport || '',
      section: coach.section || '',
      school: coach.school || '',
      qualification: coach.qualification || '',
      email: coach.email || '',
      tel: coach.tel || '',
      position: coach.position || '',
      trainingTypes: coach.trainingTypes || []
    });
    setSelectedCoach(coach);
    setShowCoachModal(true);
  };

  const handleCoachFormChange = (e) => {
    const { name, value } = e.target;
    setCoachFormData(prev => {
      // Reset sport and section when school changes
      if (name === 'school') {
        return { ...prev, [name]: value, sport: '', section: '', qualification: '' };
      }
      // Reset section and qualification when sport changes
      if (name === 'sport') {
        return { ...prev, [name]: value, section: '', qualification: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmitCoachForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const coachData = {
        ...coachFormData,
        age: Number(coachFormData.age)
      };

      let response;
      if (selectedCoach) {
        // Update existing coach
        response = await axiosInstance.put(`/coaches/${selectedCoach.id}`, coachData);
        toast.success('Coach updated successfully');
      } else {
        // Add new coach
        response = await axiosInstance.post('/coaches', coachData);
        toast.success('Coach added successfully');
      }

      // Refresh coaches list
      const coachesResponse = await axiosInstance.get('/coaches');
      const coachesData = coachesResponse?.data?.data || [];
      setCoaches(coachesData);
      setFilteredCoaches(coachesData);
      
      setShowCoachModal(false);
    } catch (error) {
      console.error('Error saving coach:', error);
      toast.error(error.response?.data?.error || 'Failed to save coach');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoach = (coach) => {
    setCoachToDelete(coach);
    setShowDeleteCoachModal(true);
  };

  const handleConfirmDeleteCoach = async () => {
    setIsSubmitting(true);
    try {
      await axiosInstance.delete(`/coaches/${coachToDelete.id}`);
      
      // Refresh coaches list
      const coachesResponse = await axiosInstance.get('/coaches');
      const coachesData = coachesResponse?.data?.data || [];
      setCoaches(coachesData);
      setFilteredCoaches(coachesData);

      toast.success('Coach deleted successfully');
      setShowDeleteCoachModal(false);
      setCoachToDelete(null);
    } catch (error) {
      console.error('Error deleting coach:', error);
      toast.error(error.response?.data?.error || 'Failed to delete coach');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Coach view details handler
  const handleViewCoachDetails = (coach) => {
    // TODO: Implement coach details modal
    toast.info(`Viewing details for ${coach.name}`);
  };

  // PE Teacher handlers
  const handleAddPeTeacher = () => {
    setPeTeacherFormData({
      names: '',
      age: '',
      experience: '',
      school: '',
      sportOfInterest: '',
      email: '',
      tel: ''
    });
    setSelectedPeTeacher(null);
    setShowPeTeacherModal(true);
  };

  const handleEditPeTeacher = (teacher) => {
    setPeTeacherFormData({
      names: teacher.names || '',
      age: teacher.age || '',
      experience: teacher.experience || '',
      school: teacher.school || '',
      sportOfInterest: teacher.sportOfInterest || '',
      email: teacher.email || '',
      tel: teacher.tel || ''
    });
    setSelectedPeTeacher(teacher);
    setShowPeTeacherModal(true);
  };

  const handlePeTeacherFormChange = (e) => {
    const { name, value } = e.target;
    setPeTeacherFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitPeTeacherForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const teacherData = {
        ...peTeacherFormData,
        age: Number(peTeacherFormData.age)
      };

      let response;
      if (selectedPeTeacher) {
        // Update existing PE teacher
        response = await axiosInstance.put(`/pe-teachers/${selectedPeTeacher.id}`, teacherData);
        toast.success('PE Teacher updated successfully');
      } else {
        // Add new PE teacher
        response = await axiosInstance.post('/pe-teachers', teacherData);
        toast.success('PE Teacher added successfully');
      }

      // Refresh PE teachers list
      const peTeachersResponse = await axiosInstance.get('/pe-teachers');
      const peTeachersData = peTeachersResponse?.data?.data || [];
      setPeTeachers(peTeachersData);
      setFilteredPeTeachers(peTeachersData);
      
      setShowPeTeacherModal(false);
    } catch (error) {
      console.error('Error saving PE teacher:', error);
      toast.error(error.response?.data?.error || 'Failed to save PE teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePeTeacher = (teacher) => {
    setPeTeacherToDelete(teacher);
    setShowDeletePeTeacherModal(true);
  };

  // PE Teacher view details handler
  const handleViewPeTeacherDetails = (teacher) => {
    // TODO: Implement PE teacher details modal
    toast.info(`Viewing details for ${teacher.names}`);
  };

  const handleConfirmDeletePeTeacher = async () => {
    setIsSubmitting(true);
    try {
      await axiosInstance.delete(`/pe-teachers/${peTeacherToDelete.id}`);
      
      // Refresh PE teachers list
      const peTeachersResponse = await axiosInstance.get('/pe-teachers');
      const peTeachersData = peTeachersResponse?.data?.data || [];
      setPeTeachers(peTeachersData);
      setFilteredPeTeachers(peTeachersData);

      toast.success('PE Teacher deleted successfully');
      setShowDeletePeTeacherModal(false);
      setPeTeacherToDelete(null);
    } catch (error) {
      console.error('Error deleting PE teacher:', error);
      toast.error(error.response?.data?.error || 'Failed to delete PE teacher');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPrograms = Array.isArray(filteredPrograms) ? filteredPrograms.slice(indexOfFirstItem, indexOfLastItem) : [];
  const currentStudents = Array.isArray(filteredStudents) ? filteredStudents.slice(indexOfFirstItem, indexOfLastItem) : [];
  const currentCoaches = Array.isArray(getFilteredCoachesForReport()) ? getFilteredCoachesForReport().slice(indexOfFirstItem, indexOfLastItem) : [];
  const currentPeTeachers = Array.isArray(getFilteredPeTeachersForReport()) ? getFilteredPeTeachersForReport().slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalProgramPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  const totalStudentPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const totalCoachPages = Math.ceil(getFilteredCoachesForReport().length / itemsPerPage);
  const totalPeTeacherPages = Math.ceil(getFilteredPeTeachersForReport().length / itemsPerPage);

  const renderLocation = (location) => {
    if (!location) return 'N/A';
    const { location_province, location_district, location_sector, location_cell, location_village } = location;
    return `${location_province || 'N/A'}, ${location_district || 'N/A'}, ${location_sector || 'N/A'}, ${location_cell || 'N/A'}, ${location_village || 'N/A'}`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Manage School':
        return (
          <div className="transition-all duration-300 ease-in-out">
            <div className="space-y-4">
              {/* PDF Report Filters - Smaller and Above Table */}
              <div className={`rounded-lg p-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">Filters</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {/* Category Filter */}
                  <div>
                    <select
                      value={reportFilters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">All Categories</option>
                      {getUniqueCategories().map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Province Filter */}
                  <div>
                    <select
                      value={reportFilters.province}
                      onChange={(e) => handleFilterChange('province', e.target.value)}
                      className="w-full text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">All Provinces</option>
                      {getUniqueProvinces().map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>

                  {/* District Filter */}
                  <div>
                    <select
                      value={reportFilters.district}
                      onChange={(e) => handleFilterChange('district', e.target.value)}
                      className="w-full text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:border-gray-600"
                      disabled={!reportFilters.province}
                    >
                      <option value="">All Districts</option>
                      {getUniqueDistricts().map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sector Filter */}
                  <div>
                    <select
                      value={reportFilters.sector}
                      onChange={(e) => handleFilterChange('sector', e.target.value)}
                      className="w-full text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:border-gray-600"
                      disabled={!reportFilters.district}
                    >
                      <option value="">All Sectors</option>
                      {getUniqueSectors().map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sport Discipline Filter */}
                  <div>
                    <select
                      value={reportFilters.sportDiscipline}
                      onChange={(e) => handleFilterChange('sportDiscipline', e.target.value)}
                      className="w-full text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">All Sports</option>
                      {getUniqueSportDisciplines().map(sport => (
                        <option key={sport} value={sport}>{sport}</option>
                      ))}
                    </select>
                  </div>

                  {/* Section Filter */}
                  <div>
                    <select
                      value={reportFilters.section}
                      onChange={(e) => handleFilterChange('section', e.target.value)}
                      className="w-full text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">All Sections</option>
                      {getUniqueSections().map(section => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters Button */}
                  <div>
                    <button
                      onClick={() => setReportFilters({
                        category: '',
                        province: '',
                        district: '',
                        sector: '',
                        sportDiscipline: '',
                        section: '',
                        schoolName: ''
                      })}
                      className="w-full text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                {/* Show entries and Filter Summary */}
                <div className="mt-2 flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>Show:</span>
                    <select
                      className="border rounded px-1 py-0.5 text-xs"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>entries</span>
                  </div>
                  <div>
                    Showing {getFilteredProgramsForReport().length} of {programs.length} institutions
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
                <PrintButton title='Institutions Report'>
                  <div className="w-full">
                    <Table className="w-full table-auto">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs p-2 sm:min-w-[140px]">Name</TableHead>
                        <TableHead className="text-xs p-2 hidden sm:table-cell sm:min-w-[80px]">Domain</TableHead>
                        <TableHead className="text-xs p-2 sm:min-w-[100px]">Category</TableHead>
                        <TableHead className="text-xs p-2 sm:min-w-[70px]">Students</TableHead>
                        <TableHead className="text-xs p-2 hidden md:table-cell sm:min-w-[80px]">Province</TableHead>
                        <TableHead className="text-xs p-2 hidden md:table-cell sm:min-w-[80px]">District</TableHead>
                        <TableHead className="text-xs p-2 hidden lg:table-cell sm:min-w-[80px]">Sector</TableHead>
                        <TableHead className="text-xs p-2 hidden lg:table-cell sm:min-w-[120px]">School Representative</TableHead>
                        <TableHead className="text-xs p-2 hidden lg:table-cell sm:min-w-[100px]">Contact</TableHead>
                        <TableHead className="text-xs p-2 hidden xl:table-cell sm:min-w-[120px]">Sports Disciplines</TableHead>
                        <TableHead className="text-xs p-2 hidden xl:table-cell sm:min-w-[80px]">No. of Sports</TableHead>
                        <TableHead className="text-xs p-2 hidden xl:table-cell sm:min-w-[120px]">Sections/Teams</TableHead>
                        <TableHead className="text-xs p-2 w-[80px] sm:w-[100px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredProgramsForReport().slice(indexOfFirstItem, indexOfLastItem).map((program) => {
                        const studentCount = students.filter((s) => (
                          (s.institutionId && Number(s.institutionId) === Number(program.id)) ||
                          (s.nameOfSchoolAcademyTrainingCenter && s.nameOfSchoolAcademyTrainingCenter === program.name)
                        )).length;
                        return (
                        <TableRow key={program.id}>
                          <TableCell className="text-xs font-medium">{program.name}</TableCell>
                          <TableCell className="text-xs">{program.domain || 'N/A'}</TableCell>
                          <TableCell className="text-xs">{program.category}</TableCell>
                          <TableCell className="text-xs">{studentCount}</TableCell>
                          <TableCell className="text-xs">{program.location_province || 'N/A'}</TableCell>
                          <TableCell className="text-xs">{program.location_district || 'N/A'}</TableCell>
                          <TableCell className="text-xs">{program.location_sector || 'N/A'}</TableCell>
                          <TableCell className="text-xs">
                            <div>
                              <p className="font-medium">{program.legalRepresentativeName || 'N/A'}</p>
                              <p className="text-gray-500">{program.legalRepresentativeGender || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div>
                              <p>{program.legalRepresentativeEmail || 'N/A'}</p>
                              <p className="text-gray-500">{program.legalRepresentativePhone || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {program.sportsDisciplines ? (
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(program.sportsDisciplines) 
                                  ? program.sportsDisciplines.map((sport, index) => (
                                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                        {sport}
                                      </span>
                                    ))
                                  : <span className="text-gray-500">N/A</span>
                                }
                              </div>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                              {Array.isArray(program.sportsDisciplines) ? program.sportsDisciplines.length : 0}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">
                            {program.sections ? (
                              <div className="flex flex-wrap gap-1">
                                {(() => {
                                  let sportSectionCombinations = [];
                                  
                                  if (Array.isArray(program.sections)) {
                                    // Simple array format: ["Male", "Female"]
                                    // Combine with all sports disciplines
                                    const sports = Array.isArray(program.sportsDisciplines) ? program.sportsDisciplines : [];
                                    if (sports.length > 0) {
                                      sports.forEach(sport => {
                                        program.sections.forEach(section => {
                                          sportSectionCombinations.push(`${sport} ${section}`);
                                        });
                                      });
                                    } else {
                                      // If no sports, just show sections
                                      sportSectionCombinations = program.sections;
                                    }
                                  } else if (typeof program.sections === 'object' && program.sections !== null) {
                                    // Object format: { "Football": ["Male", "Female"], "Volleyball": ["Male", "Female"] }
                                    Object.entries(program.sections).forEach(([sport, sections]) => {
                                      if (Array.isArray(sections)) {
                                        sections.forEach(section => {
                                          sportSectionCombinations.push(`${sport} ${section}`);
                                        });
                                      }
                                    });
                                  } else if (typeof program.sections === 'string') {
                                    // String format: "Male,Female,Mixed"
                                    const sections = program.sections.split(',').map(s => s.trim()).filter(Boolean);
                                    const sports = Array.isArray(program.sportsDisciplines) ? program.sportsDisciplines : [];
                                    if (sports.length > 0) {
                                      sports.forEach(sport => {
                                        sections.forEach(section => {
                                          sportSectionCombinations.push(`${sport} ${section}`);
                                        });
                                      });
                                    } else {
                                      sportSectionCombinations = sections;
                                    }
                                  }
                                  
                                  if (sportSectionCombinations.length === 0) {
                                    return <span className="text-gray-500">N/A</span>;
                                  }
                                  
                                  // Display all combinations
                                  return sportSectionCombinations.map((combination, index) => (
                                    <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                      {combination}
                                    </span>
                                  ));
                                })()}
                              </div>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="operation">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleViewDetails(program)}
                                className="p-1 rounded-lg hover:bg-gray-100"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {permissions.canUpdate && (<button
                                onClick={() => handleEditInstitution(program)}
                                className="p-1 rounded-lg hover:bg-gray-100"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>)}
                              {permissions.canDelete && (<button
                                onClick={() => handleDeleteInstitution(program)}
                                className="p-1 rounded-lg hover:bg-red-50 text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>)}

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
                        );
                      })}
                    </TableBody>
                  </Table>
                  </div>
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
                {permissions.canCreate && (<Button
                  onClick={handleAddStudent}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Student
                </Button>)}

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
                  <div className="w-full">
                    <Table className="w-full table-auto">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs p-2 sm:min-w-[200px]">Names</TableHead>
                        <TableHead className="text-xs p-2 hidden sm:table-cell sm:min-w-[130px]">SDMS Number</TableHead>
                        <TableHead className="text-xs p-2 sm:min-w-[80px]">Gender</TableHead>
                        <TableHead className="text-xs p-2 hidden md:table-cell sm:min-w-[80px]">Class</TableHead>
                        <TableHead className="text-xs p-2 sm:min-w-[150px]">School Name</TableHead>
                        <TableHead className="text-xs p-2 hidden lg:table-cell sm:min-w-[120px]">Section</TableHead>
                        <TableHead className="text-xs p-2 hidden lg:table-cell sm:min-w-[120px]">Sport Discipline</TableHead>
                        <TableHead className="text-xs p-2 hidden xl:table-cell sm:min-w-[150px]">Contact</TableHead>
                        <TableHead className="text-xs p-2 hidden xl:table-cell sm:min-w-[150px]">Nationality</TableHead>
                        <TableHead className="text-xs p-2 w-[80px] sm:w-[150px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentStudents.map((student) => {
                        // Find the institution for this student
                        const studentInstitution = programs.find(p => 
                          Number(p.id) === Number(student.institutionId)
                        );
                        
                        // Get the student's selected section or fallback to first available section
                        const studentSection = student.section || 
                          (studentInstitution?.sections && Array.isArray(studentInstitution.sections) 
                            ? studentInstitution.sections[0] 
                            : 'N/A');
                        
                        return (
                        <TableRow key={student.id}>
                          <TableCell className="text-xs font-medium">
                            {`${student.firstName || ''} ${student.lastName || ''}`.trim() || 'N/A'}
                          </TableCell>
                          <TableCell className="text-xs">{student.sdmsNumber || 'N/A'}</TableCell>
                          <TableCell className="text-xs">{student.gender}</TableCell>
                          <TableCell className="text-xs">{student.class}</TableCell>
                          <TableCell className="text-xs">{studentInstitution?.name || 'N/A'}</TableCell>
                          <TableCell className="text-xs">{studentSection}</TableCell>
                          <TableCell className="text-xs">{student.typeOfGame}</TableCell>
                          <TableCell className="text-xs">{student.contact}</TableCell>
                          <TableCell className="text-xs">{student.nationality || 'N/A'}</TableCell>
                          <TableCell className="operation">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleViewStudentDetails(student)}
                                className="p-1 rounded-lg hover:bg-gray-100"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {permissions.canUpdate && (<button
                                onClick={() => handleEditStudent(student)}
                                className="p-1 rounded-lg hover:bg-gray-100"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>)}
                              {permissions.canDelete && (<button
                                onClick={() => handleDeleteStudent(student)}
                                className="p-1 rounded-lg hover:bg-red-50 text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>)}
                            </div>
                          </TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                    </Table>
                  </div>
                </PrintButton>
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

      case 'Coaches':
        return (
          <div className="transition-all duration-300 ease-in-out">
            <div className="space-y-4">
              {/* Coach Report Filters - Smaller and Above Table */}
              <div className={`rounded-lg p-1.5 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">Filters</h3>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
                  {/* Coach Name Filter */}
                  <div>
                    <input
                      type="text"
                      value={coachFilters.name}
                      onChange={(e) => handleCoachFilterChange('name', e.target.value)}
                      placeholder="Coach name..."
                      className="w-full text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  {/* School Filter */}
                  <div>
                    <select
                      value={coachFilters.school}
                      onChange={(e) => handleCoachFilterChange('school', e.target.value)}
                      className="w-full text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">All Schools</option>
                      {getUniqueCoachSchools().map(school => (
                        <option key={school} value={school}>{school}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sport Filter */}
                  <div>
                    <select
                      value={coachFilters.sport}
                      onChange={(e) => handleCoachFilterChange('sport', e.target.value)}
                      className="w-full text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">All Sports</option>
                      {getUniqueCoachSports().map(sport => (
                        <option key={sport} value={sport}>{sport}</option>
                      ))}
                    </select>
                  </div>

                  {/* Section Filter */}
                  <div>
                    <select
                      value={coachFilters.section}
                      onChange={(e) => handleCoachFilterChange('section', e.target.value)}
                      className="w-full text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">All Sections</option>
                      {getUniqueCoachSections().map(section => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                  </div>

                  {/* Qualification Filter */}
                  <div>
                    <select
                      value={coachFilters.qualification}
                      onChange={(e) => handleCoachFilterChange('qualification', e.target.value)}
                      className="w-full text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">All Qualifications</option>
                      {getUniqueCoachQualifications().map(qualification => (
                        <option key={qualification} value={qualification}>{qualification}</option>
                      ))}
                    </select>
                  </div>

                  {/* Position Filter */}
                  <div>
                    <select
                      value={coachFilters.position}
                      onChange={(e) => handleCoachFilterChange('position', e.target.value)}
                      className="w-full text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">All Positions</option>
                      {getUniqueCoachPositions().map(position => (
                        <option key={position} value={position}>{position}</option>
                      ))}
                    </select>
                  </div>

                  {/* Training Type Filter */}
                  <div>
                    <select
                      value={coachFilters.trainingType}
                      onChange={(e) => handleCoachFilterChange('trainingType', e.target.value)}
                      className="w-full text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">All Training Types</option>
                      {getUniqueCoachTrainingTypes().map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Clear Filters Button */}
                  <div>
                    <button
                      onClick={() => setCoachFilters({
                        name: '',
                        school: '',
                        sport: '',
                        section: '',
                        qualification: '',
                        position: '',
                        trainingType: ''
                      })}
                      className="w-full text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                {/* Show entries and Filter Summary */}
                <div className="mt-2 flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>Show:</span>
                    <select
                      className="border rounded px-1 py-0.5 text-xs"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>entries</span>
                  </div>
                  <div>
                    Showing {getFilteredCoachesForReport().length} of {coaches.length} coaches
                  </div>
                </div>
              </div>

              {/* Coaches Table */}
              <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
                <PrintButton title='Coaches Report'>
                  <div className="w-full content-to-export">
                    <Table className="w-full table-auto">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs p-2 sm:min-w-[120px]">Name</TableHead>
                        <TableHead className="text-xs p-2 hidden sm:table-cell sm:min-w-[60px]">Age</TableHead>
                        <TableHead className="text-xs p-2 sm:min-w-[80px]">Sport</TableHead>
                        <TableHead className="text-xs p-2 hidden md:table-cell sm:min-w-[80px]">Section</TableHead>
                        <TableHead className="text-xs p-2 sm:min-w-[120px]">School</TableHead>
                        <TableHead className="text-xs p-2 hidden lg:table-cell sm:min-w-[100px]">Qualification</TableHead>
                        <TableHead className="text-xs p-2 hidden lg:table-cell sm:min-w-[120px]">Email</TableHead>
                        <TableHead className="text-xs p-2 hidden xl:table-cell sm:min-w-[80px]">Tel</TableHead>
                        <TableHead className="text-xs p-2 hidden xl:table-cell sm:min-w-[100px]">Position</TableHead>
                        <TableHead className="text-xs p-2 hidden xl:table-cell sm:min-w-[250px]">Training Types</TableHead>
                        <TableHead className="text-xs p-2 hidden xl:table-cell sm:min-w-[140px]">Training Count</TableHead>
                        <TableHead className="text-xs p-2 w-[80px] sm:w-[120px] operation">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentCoaches.map((coach) => (
                        <TableRow key={coach.id}>
                          <TableCell className="text-xs font-medium p-2">{coach.name}</TableCell>
                          <TableCell className="text-xs p-2 hidden sm:table-cell">{coach.age}</TableCell>
                          <TableCell className="text-xs p-2">{coach.sport}</TableCell>
                          <TableCell className="text-xs p-2 hidden md:table-cell">{coach.section}</TableCell>
                          <TableCell className="text-xs p-2">{coach.school}</TableCell>
                          <TableCell className="text-xs p-2 hidden lg:table-cell">{coach.qualification}</TableCell>
                          <TableCell className="text-xs p-2 hidden lg:table-cell">{coach.email}</TableCell>
                          <TableCell className="text-xs p-2 hidden xl:table-cell">{coach.tel}</TableCell>
                          <TableCell className="text-xs p-2 hidden xl:table-cell">{coach.position}</TableCell>
                          <TableCell className="text-xs p-2 hidden xl:table-cell">
                            <div className="space-y-1">
                              {coach.trainingTypes && coach.trainingTypes.length > 0 ? (
                                coach.trainingTypes.map((type, index) => (
                                  <div
                                    key={index}
                                    className="text-xs text-gray-700 leading-relaxed"
                                  >
                                    • {type}
                                  </div>
                                ))
                              ) : (
                                <span className="text-gray-400">None</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-center p-2 hidden xl:table-cell">
                            <div className="flex items-center justify-center">
                              <span className={`inline-flex items-center justify-center min-w-[40px] h-8 px-3 rounded-full text-sm font-medium ${
                                coach.trainingTypes && coach.trainingTypes.length > 0 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {coach.trainingTypes ? coach.trainingTypes.length : 0}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="p-2 operation">
                            <div className="flex items-center gap-1">
                              {/* <button
                                onClick={() => handleViewCoachDetails(coach)}
                                className="p-1 rounded-lg hover:bg-gray-100"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button> */}
                              {permissions.canUpdate && (
                                <button
                                  onClick={() => handleEditCoach(coach)}
                                  className="p-1 rounded-lg hover:bg-gray-100"
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                              )}
                              {permissions.canDelete && (
                                <button
                                  onClick={() => handleDeleteCoach(coach)}
                                  className="p-1 rounded-lg hover:bg-red-50 text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    </Table>
                  </div>
                </PrintButton>
              </div>

              {/* Pagination */}
              {totalCoachPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCoaches.length)} of {filteredCoaches.length} entries
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1">
                      Page {currentPage} of {totalCoachPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalCoachPages))}
                      disabled={currentPage === totalCoachPages}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'PE Teachers':
        return (
          <div className="transition-all duration-300 ease-in-out">
            <div className="space-y-4">
              {/* PE Teacher Report Filters - Smaller and Above Table */}
              <div className={`rounded-lg p-1.5 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">Filters</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {/* Teacher Name Filter */}
                  <div>
                    <input
                      type="text"
                      value={peTeacherFilters.name}
                      onChange={(e) => handlePeTeacherFilterChange('name', e.target.value)}
                      placeholder="Teacher name..."
                      className="w-full text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  {/* School Filter */}
                  <div>
                    <select
                      value={peTeacherFilters.school}
                      onChange={(e) => handlePeTeacherFilterChange('school', e.target.value)}
                      className="w-full text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">All Schools</option>
                      {getUniquePeTeacherSchools().map(school => (
                        <option key={school} value={school}>{school}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sport of Interest Filter */}
                  <div>
                    <select
                      value={peTeacherFilters.sportOfInterest}
                      onChange={(e) => handlePeTeacherFilterChange('sportOfInterest', e.target.value)}
                      className="w-full text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">All Sports</option>
                      {getUniquePeTeacherSports().map(sport => (
                        <option key={sport} value={sport}>{sport}</option>
                      ))}
                    </select>
                  </div>

                  {/* Experience Filter */}
                  <div>
                    <select
                      value={peTeacherFilters.experience}
                      onChange={(e) => handlePeTeacherFilterChange('experience', e.target.value)}
                      className="w-full text-xs border rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">All Experience Levels</option>
                      {getUniquePeTeacherExperience().map(experience => (
                        <option key={experience} value={experience}>{experience}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Clear Filters Button */}
                  <div>
                    <button
                      onClick={() => setPeTeacherFilters({
                        name: '',
                        school: '',
                        sportOfInterest: '',
                        experience: ''
                      })}
                      className="w-full text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                {/* Show entries and Filter Summary */}
                <div className="mt-2 flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>Show:</span>
                    <select
                      className="border rounded px-1 py-0.5 text-xs"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>entries</span>
                  </div>
                  <div>
                    Showing {getFilteredPeTeachersForReport().length} of {peTeachers.length} PE teachers
                  </div>
                </div>
              </div>

              {/* PE Teachers Table */}
              <div className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
                <PrintButton title='PE Teachers Report'>
                  <div className="w-full">
                    <Table className="w-full table-auto">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs p-2 sm:min-w-[150px]">Names</TableHead>
                        <TableHead className="text-xs p-2 hidden sm:table-cell sm:min-w-[80px]">Age</TableHead>
                        <TableHead className="text-xs p-2 hidden md:table-cell sm:min-w-[120px]">Experience</TableHead>
                        <TableHead className="text-xs p-2 sm:min-w-[150px]">School</TableHead>
                        <TableHead className="text-xs p-2 hidden lg:table-cell sm:min-w-[150px]">Sport of Interest</TableHead>
                        <TableHead className="text-xs p-2 hidden lg:table-cell sm:min-w-[150px]">Email</TableHead>
                        <TableHead className="text-xs p-2 hidden xl:table-cell sm:min-w-[100px]">Tel</TableHead>
                        <TableHead className="text-xs p-2 w-[80px] sm:w-[150px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPeTeachers.map((teacher) => (
                        <TableRow key={teacher.id}>
                          <TableCell className="text-xs font-medium p-2">{teacher.names}</TableCell>
                          <TableCell className="text-xs p-2 hidden sm:table-cell">{teacher.age}</TableCell>
                          <TableCell className="text-xs p-2 hidden md:table-cell">{teacher.experience}</TableCell>
                          <TableCell className="text-xs p-2">{teacher.school}</TableCell>
                          <TableCell className="text-xs p-2 hidden lg:table-cell">{teacher.sportOfInterest}</TableCell>
                          <TableCell className="text-xs p-2 hidden lg:table-cell">{teacher.email}</TableCell>
                          <TableCell className="text-xs p-2 hidden xl:table-cell">{teacher.tel}</TableCell>
                          <TableCell className="p-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleViewPeTeacherDetails(teacher)}
                                className="p-1 rounded-lg hover:bg-gray-100"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {permissions.canUpdate && (
                                <button
                                  onClick={() => handleEditPeTeacher(teacher)}
                                  className="p-1 rounded-lg hover:bg-gray-100"
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                              )}
                              {permissions.canDelete && (
                                <button
                                  onClick={() => handleDeletePeTeacher(teacher)}
                                  className="p-1 rounded-lg hover:bg-red-50 text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    </Table>
                  </div>
                </PrintButton>
              </div>

              {/* Pagination */}
              {totalPeTeacherPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPeTeachers.length)} of {filteredPeTeachers.length} entries
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1">
                      Page {currentPage} of {totalPeTeacherPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPeTeacherPages))}
                      disabled={currentPage === totalPeTeacherPages}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className={`p-2 sm:p-4 overflow-x-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`} style={{maxWidth: '100vw'}}>
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
      </div>

      {/* Navigation Tabs with Search and Add Button */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Tabs */}
          <nav className="flex space-x-4">
            {tabs.map((tab) => (
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
          
          {/* Search and Add Button for different tabs */}
          {activeTab === 'Manage School' && (
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search School..."
                  className="pl-9 pr-4 py-2 border rounded-lg w-64 text-sm"
                  onChange={(e) => handleSearch(e.target.value, 'programs')}
                />
              </div>
              {permissions.canCreate && (
                <Button
                  onClick={handleAddInstitution}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add School</span>
                </Button>
              )}
            </div>
          )}
          
          {activeTab === 'Coaches' && (
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search coaches..."
                  className="pl-9 pr-4 py-2 border rounded-lg w-64 text-sm"
                  onChange={(e) => handleSearch(e.target.value, 'coaches')}
                />
              </div>
              {permissions.canCreate && (
                <Button
                  onClick={handleAddCoach}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Coach</span>
                </Button>
              )}
            </div>
          )}
          
          {activeTab === 'PE Teachers' && (
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search PE teachers..."
                  className="pl-9 pr-4 py-2 border rounded-lg w-64 text-sm"
                  onChange={(e) => handleSearch(e.target.value, 'peTeachers')}
                />
              </div>
              {permissions.canCreate && (
                <Button
                  onClick={handleAddPeTeacher}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add PE Teacher</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Tab Content with Transition */}
      <div className="relative">
        {renderTabContent()}
      </div>

      {/* Add/Edit Institution Modal */}
      <Modal
        isOpen={showInstitutionModal}
        onClose={() => setShowInstitutionModal(false)}
        title={selectedInstitution ? "Edit School" : "Add School"}
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
              Delete School
            </DialogTitle>
            <DialogDescription className="py-4">
              <div className="space-y-2">
                <p>Are you sure you want to delete this school?</p>
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
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">SDMS Number</label>
              <input
                type="text"
                name="sdmsNumber"
                value={studentFormData.sdmsNumber}
                onChange={handleFormChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g., 370614161237"
                required
              />
            </div>
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
              <label className="block text-sm font-medium mb-1">Child ID/Passport No</label>
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
              <label className="block text-sm font-medium mb-1">Father/Guardian Names</label>
              <input
                type="text"
                name="fatherGuardianNames"
                value={studentFormData.fatherGuardianNames}
                onChange={handleFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mother/Guardian Names</label>
              <input
                type="text"
                name="motherGuardianNames"
                value={studentFormData.motherGuardianNames}
                onChange={handleFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">School</label>
              <select
                name="institutionId"
                value={studentFormData.institutionId}
                onChange={handleFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select School</option>
                {programs.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type of School</label>
              <input
                type="text"
                name="typeOfSchoolAcademyTrainingCenter"
                value={derivedSelectedInstitution?.category || ''}
                readOnly
                className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                placeholder="Auto-filled from selected School"
              />
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
              <label className="block text-sm font-medium mb-1">Sport Discipline</label>
              <select
                name="typeOfGame"
                value={studentFormData.typeOfGame}
                onChange={handleFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
                disabled={!derivedSelectedInstitution || availableGameTypes.length === 0}
              >
                <option value="" disabled>
                  {(!derivedSelectedInstitution) ? 'Select School first' : (availableGameTypes.length === 0 ? 'No Sport Discipline available' : 'Select Sport Discipline')}
                </option>
                {availableGameTypes.map((game) => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Section/Team</label>
              <select
                name="section"
                value={studentFormData.section}
                onChange={handleFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
                disabled={!derivedSelectedInstitution || !studentFormData.typeOfGame || availableSections.length === 0}
              >
                <option value="" disabled>
                  {(!derivedSelectedInstitution) ? 'Select School first' : 
                   (!studentFormData.typeOfGame) ? 'Select Sport Discipline first' : 
                   (availableSections.length === 0 ? 'No sections available for this sport' : 'Select Section/Team')}
                </option>
                {availableSections.map((section) => (
                  <option key={section} value={section}>{section}</option>
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
                    <label className="font-medium text-gray-600 block">School Name</label>
                    <p className="mt-1">{(() => {
                      const studentInstitution = programs.find(p => 
                        Number(p.id) === Number(selectedStudent.institutionId)
                      );
                      return studentInstitution?.name || 'N/A';
                    })()}</p>
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
                    <label className="font-medium text-gray-600 block">Child ID/Passport No</label>
                    <p className="mt-1">{selectedStudent.idPassportNo || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Other Nationality</label>
                    <p className="mt-1">{selectedStudent.otherNationality || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Father/Guardian</label>
                    <p className="mt-1">{selectedStudent.fatherGuardianNames || selectedStudent.namesOfParentsGuardian || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Mother/Guardian</label>
                    <p className="mt-1">{selectedStudent.motherGuardianNames || 'N/A'}</p>
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
                    <label className="font-medium text-gray-600 block">Sport Discipline</label>
                    <p className="mt-1">{selectedStudent.typeOfGame || 'N/A'}</p>
                  </div>
                  {/* <div>
                    <label className="font-medium text-gray-600 block">Position/Role</label>
                    <p className="mt-1">{selectedStudent.section || 'N/A'}</p>
                  </div> */}
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
                    <p className="mt-1 font-semibold">{selectedProgram.name}</p>
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
                    <label className="font-medium text-gray-600 block">Created Date</label>
                    <p className="mt-1">
                      {selectedProgram.createdAt ? new Date(selectedProgram.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Last Updated</label>
                    <p className="mt-1">
                      {selectedProgram.updatedAt ? new Date(selectedProgram.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Institution ID</label>
                    <p className="mt-1 font-mono text-sm">#{selectedProgram.id}</p>
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

              {/* School Representative Information */}
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">School Representative</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-600 block">Full Name</label>
                    <p className="mt-1 font-semibold">{selectedProgram.legalRepresentativeName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Gender</label>
                    <p className="mt-1">{selectedProgram.legalRepresentativeGender || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Email Address</label>
                    <p className="mt-1">{selectedProgram.legalRepresentativeEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Phone Number</label>
                    <p className="mt-1">{selectedProgram.legalRepresentativePhone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Sports Disciplines and Sections */}
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Sports</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-600 block">Disciplines</label>
                    <p className="mt-1">
                      {Array.isArray(selectedProgram.sportsDisciplines)
                        ? (selectedProgram.sportsDisciplines.length > 0 ? selectedProgram.sportsDisciplines.join(', ') : 'N/A')
                        : (typeof selectedProgram.sportsDisciplines === 'string' && selectedProgram.sportsDisciplines.trim())
                          ? selectedProgram.sportsDisciplines
                          : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600 block">Sections</label>
                    <div className="mt-1 space-y-1">
                      {selectedProgram.sections && typeof selectedProgram.sections === 'object' && Object.keys(selectedProgram.sections).length > 0 ? (
                        Object.entries(selectedProgram.sections).map(([disc, secs]) => (
                          <div key={disc} className="text-sm">
                            <span className="font-medium">{disc}: </span>
                            <span>{Array.isArray(secs) ? secs.join(', ') : String(secs)}</span>
                          </div>
                        ))
                      ) : (
                        <p>N/A</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */
              }
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-600 block">Registration Date</label>
                    <p className="mt-1">
                      {selectedProgram.registrationDate
                        ? new Date(selectedProgram.registrationDate).toLocaleDateString()
                        : (selectedProgram.createdAt
                            ? new Date(selectedProgram.createdAt).toLocaleDateString()
                            : 'N/A')}
                    </p>
                  </div>
                  {/* <div>
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
                  </div> */}
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
                          <button
                            onClick={() => {
                              setShowStudentsModal(false);
                              handleViewStudentDetails(student);
                            }}
                            className="p-1 rounded-lg hover:bg-gray-100"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
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

      {/* Add/Edit Coach Modal */}
      <Modal
        isOpen={showCoachModal}
        onClose={() => setShowCoachModal(false)}
        title={selectedCoach ? "Edit Coach" : "Add Coach"}
      >
        <form onSubmit={handleSubmitCoachForm} className="max-h-[70vh] overflow-y-auto pr-4 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={coachFormData.name}
                onChange={handleCoachFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={coachFormData.age}
                onChange={handleCoachFormChange}
                className="w-full border rounded-lg px-3 py-2"
                min="18"
                max="70"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">School</label>
              <select
                name="school"
                value={coachFormData.school}
                onChange={handleCoachFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select School</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.name}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sport Discipline</label>
              <select
                name="sport"
                value={coachFormData.sport}
                onChange={handleCoachFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
                disabled={!coachFormData.school}
              >
                <option value="">Select Sport</option>
                {(() => {
                  const selectedSchool = programs.find(p => p.name === coachFormData.school);
                  if (selectedSchool && selectedSchool.sportsDisciplines) {
                    return Array.isArray(selectedSchool.sportsDisciplines) 
                      ? selectedSchool.sportsDisciplines.map(sport => (
                          <option key={sport} value={sport}>{sport}</option>
                        ))
                      : <option value="">No sports available</option>;
                  }
                  return <option value="">Select school first</option>;
                })()}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Section/Team</label>
              <select
                name="section"
                value={coachFormData.section}
                onChange={handleCoachFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
                disabled={!coachFormData.sport}
              >
                <option value="">Select Section</option>
                {(() => {
                  // Get the selected school
                  const selectedSchool = programs.find(p => p.name === coachFormData.school);
                  
                  if (!selectedSchool || !coachFormData.sport) {
                    return <option value="">Select school and sport first</option>;
                  }
                  
                  // Get sections from the school's database data
                  if (selectedSchool.sections && typeof selectedSchool.sections === 'object') {
                    // Check if the selected sport has sections in the school
                    const sportSections = selectedSchool.sections[coachFormData.sport];
                    
                    if (Array.isArray(sportSections) && sportSections.length > 0) {
                      return sportSections.map(section => (
                        <option key={section} value={section}>{section}</option>
                      ));
                    }
                  }
                  
                  // If sections is an array (not sport-specific), show all sections
                  if (Array.isArray(selectedSchool.sections)) {
                    return selectedSchool.sections.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ));
                  }
                  
                  return <option value="">No sections available for this sport</option>;
                })()}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Qualification</label>
              <select
                name="qualification"
                value={coachFormData.qualification}
                onChange={handleCoachFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select Qualification</option>
                {(coachFormData.sport === 'Football' || coachFormData.sport === 'Handball') ? (
                  <>
                    <option value="License A">License A</option>
                    <option value="License B">License B</option>
                    <option value="License C">License C</option>
                    <option value="License D">License D</option>
                  </>
                ) : (
                  <>
                    <option value="Level 1">Level 1</option>
                    <option value="Level 2">Level 2</option>
                    <option value="Level 3">Level 3</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={coachFormData.email}
                onChange={handleCoachFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tel</label>
              <input
                type="tel"
                name="tel"
                value={coachFormData.tel}
                onChange={handleCoachFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Position</label>
              <select
                name="position"
                value={coachFormData.position}
                onChange={handleCoachFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select Position</option>
                <option value="Head Coach">Head Coach</option>
                <option value="Assistant Coach">Assistant Coach</option>
                <option value="Technical Director">Technical Director</option>
                <option value="Fitness Coach">Fitness Coach</option>
                <option value="Goalkeeper Coach">Goalkeeper Coach</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Training Types</label>
              <div className="border rounded-lg px-3 py-2 max-h-40 overflow-y-auto bg-white">
                <div className="space-y-2">
                  {trainingTypeOptions.map((type) => (
                    <label key={type} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={coachFormData.trainingTypes.includes(type)}
                        onChange={(e) => {
                          const updatedTypes = e.target.checked
                            ? [...coachFormData.trainingTypes, type]
                            : coachFormData.trainingTypes.filter(t => t !== type);
                          setCoachFormData(prev => ({
                            ...prev,
                            trainingTypes: updatedTypes
                          }));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selected: {coachFormData.trainingTypes.length} of {trainingTypeOptions.length}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCoachModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Saving...' : selectedCoach ? 'Update Coach' : 'Add Coach'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit PE Teacher Modal */}
      <Modal
        isOpen={showPeTeacherModal}
        onClose={() => setShowPeTeacherModal(false)}
        title={selectedPeTeacher ? "Edit PE Teacher" : "Add PE Teacher"}
      >
        <form onSubmit={handleSubmitPeTeacherForm} className="max-h-[70vh] overflow-y-auto pr-4 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Names</label>
              <input
                type="text"
                name="names"
                value={peTeacherFormData.names}
                onChange={handlePeTeacherFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={peTeacherFormData.age}
                onChange={handlePeTeacherFormChange}
                className="w-full border rounded-lg px-3 py-2"
                min="18"
                max="70"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience</label>
              <input
                type="text"
                name="experience"
                value={peTeacherFormData.experience}
                onChange={handlePeTeacherFormChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g., 7 years"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">School</label>
              <select
                name="school"
                value={peTeacherFormData.school}
                onChange={handlePeTeacherFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select School</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.name}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sport of Interest</label>
              <select
                name="sportOfInterest"
                value={peTeacherFormData.sportOfInterest}
                onChange={handlePeTeacherFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select Sport of Interest</option>
                <option value="Football">Football</option>
                <option value="Volleyball">Volleyball</option>
                <option value="Basketball">Basketball</option>
                <option value="Handball">Handball</option>
                <option value="Athletics">Athletics</option>
                <option value="Swimming">Swimming</option>
                <option value="Tennis">Tennis</option>
                <option value="Cycling">Cycling</option>
                <option value="Gymnastics">Gymnastics</option>
                <option value="General Physical Education">General Physical Education</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={peTeacherFormData.email}
                onChange={handlePeTeacherFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tel</label>
              <input
                type="tel"
                name="tel"
                value={peTeacherFormData.tel}
                onChange={handlePeTeacherFormChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPeTeacherModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Saving...' : selectedPeTeacher ? 'Update PE Teacher' : 'Add PE Teacher'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Coach Confirmation Dialog */}
      <Dialog open={showDeleteCoachModal} onOpenChange={setShowDeleteCoachModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Coach
            </DialogTitle>
            <DialogDescription className="py-4">
              <div className="space-y-2">
                <p>Are you sure you want to delete this coach?</p>
                {coachToDelete && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{coachToDelete.name}</p>
                    <p className="text-sm text-gray-600">Sport: {coachToDelete.sport}</p>
                    <p className="text-sm text-gray-600">School: {coachToDelete.school}</p>
                    <p className="text-sm text-gray-600">Position: {coachToDelete.position}</p>
                  </div>
                )}
                <p className="text-red-600 font-medium">This action cannot be undone.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteCoachModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteCoach}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Coach'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete PE Teacher Confirmation Dialog */}
      <Dialog open={showDeletePeTeacherModal} onOpenChange={setShowDeletePeTeacherModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete PE Teacher
            </DialogTitle>
            <DialogDescription className="py-4">
              <div className="space-y-2">
                <p>Are you sure you want to delete this PE teacher?</p>
                {peTeacherToDelete && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{peTeacherToDelete.names}</p>
                    <p className="text-sm text-gray-600">Sport of Interest: {peTeacherToDelete.sportOfInterest}</p>
                    <p className="text-sm text-gray-600">School: {peTeacherToDelete.school}</p>
                    <p className="text-sm text-gray-600">Experience: {peTeacherToDelete.experience}</p>
                  </div>
                )}
                <p className="text-red-600 font-medium">This action cannot be undone.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeletePeTeacherModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeletePeTeacher}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete PE Teacher'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IsongaPrograms;
