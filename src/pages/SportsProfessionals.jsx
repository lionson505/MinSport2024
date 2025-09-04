import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, AlertCircle, Eye, PencilLine, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PageLoading from '../components/ui/PageLoading';
import Message from '../components/ui/Message';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/table';
import axiosInstance from '../utils/axiosInstance';
import Modal from '../components/ui/Modal';
import AddSportsProfessionalForm from '../components/forms/AddSportsProfessionalForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import PrintButton from '../components/reusable/Print';

const SportsProfessionals = () => {
  const [professionals, setProfessionals] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [functions, setFunctions] = useState([]);

  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [filteredDisciplines, setFilteredDisciplines] = useState([]);
  const [filteredFunctions, setFilteredFunctions] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('Professionals');

  const [disciplineForm, setDisciplineForm] = useState({ name: '', type: '' });
  const [functionForm, setFunctionForm] = useState({ name: '', disciplineId: '' });

  const [editingDiscipline, setEditingDiscipline] = useState(null);
  const [addingDiscipline, setAddingDiscipline] = useState(false);
  const [editingFunction, setEditingFunction] = useState(null);
  const [addingFunction, setAddingFunction] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState(null);
  const [addingProfessional, setAddingProfessional] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const rowsPerPage = 5;

  const [searchTerm, setSearchTerm] = useState('');

  const [viewingProfessional, setViewingProfessional] = useState(null);
  const [viewingDiscipline, setViewingDiscipline] = useState(null);
  const [viewingFunction, setViewingFunction] = useState(null);

  const [passportImage, setPassportImage] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    discipline: '',
    func: '',
    age: '', // e.g., '18-25', '26-35', '36-45', '46-60', '60+'
    gender: '',
    nationality: '',
    status: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: ''
  });

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const getAge = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  // Derive distinct option lists from loaded data
  const derivedOptions = React.useMemo(() => {
    const disciplineOpts = Array.from(new Set((professionals || []).map((p) => p.discipline).filter(Boolean)));
    const functionOpts = Array.from(new Set((professionals || []).map((p) => p.function).filter(Boolean)));
    const genderOpts = Array.from(new Set((professionals || []).map((p) => p.gender).filter(Boolean)));
    const nationalityOpts = Array.from(new Set((professionals || []).map((p) => p.nationality).filter(Boolean)));
    const statusOpts = Array.from(new Set((professionals || []).map((p) => p.status).filter(Boolean)));

    // Parse placeOfResidence as "district, sector, cell, village"
    const regions = (professionals || []).map((p) => (p.placeOfResidence || '')).filter(Boolean);
    const districts = new Set();
    const sectors = new Set();
    const cells = new Set();
    const villages = new Set();
    regions.forEach((r) => {
      const parts = r.split(',').map((s) => s.trim()).filter(Boolean);
      if (parts[0]) districts.add(parts[0]);
      if (parts[1]) sectors.add(parts[1]);
      if (parts[2]) cells.add(parts[2]);
      if (parts[3]) villages.add(parts[3]);
    });

    return {
      disciplineOpts,
      functionOpts,
      genderOpts,
      nationalityOpts,
      statusOpts,
      provinceOpts: Array.from(new Set((professionals || []).map((p) => p.region).filter(Boolean))),
      districtOpts: Array.from(districts),
      sectorOpts: Array.from(sectors),
      cellOpts: Array.from(cells),
      villageOpts: Array.from(villages)
    };
  }, [professionals]);

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/disciplines');
        setDisciplines(response.data);
        setFilteredDisciplines(response.data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.error('Error fetching disciplines');
      }
    };

    const fetchFunctions = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/functions');
        setFunctions(response.data);
        setFilteredFunctions(response.data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.error('Error fetching functions');
      }
    };

    const fetchProfessionals = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/official-referees');
        setProfessionals(response.data?.data || []);
        setFilteredProfessionals(response.data?.data || []);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.error('Error fetching professionals');
      }
    };

    fetchDisciplines();
    fetchFunctions();
    fetchProfessionals();
  }, []);

  useEffect(() => {
    const filterData = () => {
      if (activeTab === 'Professionals') {
        const result = professionals.filter((p) => {
          const hay = `${p.firstName} ${p.lastName} ${p.function} ${p.nationality}`.toLowerCase();
          if (searchTerm && !hay.includes(searchTerm.toLowerCase())) return false;

          // Field filters
          if (filters.discipline && p.discipline !== filters.discipline) return false;
          if (filters.func && p.function !== filters.func) return false;
          if (filters.gender && p.gender !== filters.gender) return false;
          if (filters.nationality && p.nationality !== filters.nationality) return false;
          if (filters.status && p.status !== filters.status) return false;
          if (filters.province && p.region !== filters.province) return false;

          // Region hierarchy parsed from placeOfResidence
          const parts = (p.placeOfResidence || '').split(',').map((s) => s.trim());
          const [district, sector, cell, village] = parts;
          if (filters.district && district !== filters.district) return false;
          if (filters.sector && sector !== filters.sector) return false;
          if (filters.cell && cell !== filters.cell) return false;
          if (filters.village && village !== filters.village) return false;

          // Age filter
          if (filters.age) {
            const a = getAge(p.dateOfBirth);
            if (a == null) return false;
            if (filters.age === '60+' && !(a >= 60)) return false;
            if (filters.age !== '60+') {
              const [min, max] = filters.age.split('-').map((n) => parseInt(n, 10));
              if (!(a >= min && a <= max)) return false;
            }
          }

          return true;
        });
        setFilteredProfessionals(result);
      } else if (activeTab === 'Disciplines') {
        setFilteredDisciplines(
          disciplines.filter((discipline) =>
            `${discipline.name} ${discipline.type}`.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      } else if (activeTab === 'Functions') {
        setFilteredFunctions(
          functions.filter((func) =>
            `${func.name} ${disciplines.find((d) => d.id === func.disciplineId)?.name}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
        );
      }
    };

    filterData();
  }, [searchTerm, activeTab, professionals, disciplines, functions, filters]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getCurrentPageData = (data) => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return data.slice(indexOfFirstRow, indexOfLastRow);
  };

  const handleAddDiscipline = async () => {
    try {
      const response = await axiosInstance.post('/disciplines', disciplineForm);
      setDisciplines((prevState) => [...prevState, response.data]);
      setFilteredDisciplines((prevState) => [...prevState, response.data]);
      toast.success('Discipline added successfully');
      setDisciplineForm({ name: '', type: '' });
      setAddingDiscipline(false);
    } catch (error) {
      toast.error('Error adding discipline');
    }
  };

  const handleEditDiscipline = async () => {
    try {
      const response = await axiosInstance.put(`/disciplines/${editingDiscipline.id}`, disciplineForm);
      setDisciplines((prevState) =>
        prevState.map((d) => (d.id === editingDiscipline.id ? response.data : d))
      );
      setFilteredDisciplines((prevState) =>
        prevState.map((d) => (d.id === editingDiscipline.id ? response.data : d))
      );
      toast.success('Discipline updated successfully');
      setEditingDiscipline(null);
      setDisciplineForm({ name: '', type: '' });
    } catch (error) {
      toast.error('Error updating discipline');
    }
  };

  const handleDeleteDiscipline = async () => {
    try {
      await axiosInstance.delete(`/disciplines/${itemToDelete.id}`);
      setDisciplines((prevState) => prevState.filter((d) => d.id !== itemToDelete.id));
      setFilteredDisciplines((prevState) => prevState.filter((d) => d.id !== itemToDelete.id));
      toast.success('Discipline deleted successfully');
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error('Error deleting discipline');
    }
  };

  const handleAddFunction = async () => {
    try {
      const payload = {
        name: functionForm.name,
        disciplineId: Number(functionForm.disciplineId)
      };

      if (!payload.disciplineId || !payload.name) {
        toast.error('Please ensure both name and discipline are selected');
        return;
      }

      const response = await axiosInstance.post('/functions', payload);
      setFunctions((prevState) => [...prevState, response.data]);
      setFilteredFunctions((prevState) => [...prevState, response.data]);
      toast.success('Function added successfully');
      setFunctionForm({ name: '', disciplineId: '' });
      setAddingFunction(false);
    } catch (error) {
      toast.error('Error adding function');
    }
  };

  const handleEditFunction = async () => {
    try {
      const response = await axiosInstance.put(`/functions/${editingFunction.id}`, functionForm);
      setFunctions((prevState) =>
        prevState.map((f) => (f.id === editingFunction.id ? response.data : f))
      );
      setFilteredFunctions((prevState) =>
        prevState.map((f) => (f.id === editingFunction.id ? response.data : f))
      );
      toast.success('Function updated successfully');
      setEditingFunction(null);
      setFunctionForm({ name: '', disciplineId: '' });
    } catch (error) {
      toast.error('Error updating function');
    }
  };

  const handleDeleteFunction = async () => {
    try {
      await axiosInstance.delete(`/functions/${itemToDelete.id}`);
      setFunctions((prevState) => prevState.filter((f) => f.id !== itemToDelete.id));
      setFilteredFunctions((prevState) => prevState.filter((f) => f.id !== itemToDelete.id));
      toast.success('Function deleted successfully');
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error('Error deleting function');
    }
  };

  const handleDeleteProfessional = async () => {
    try {
      await axiosInstance.delete(`/official-referees/${itemToDelete.id}`);
      setProfessionals((prevState) => prevState.filter((p) => p.id !== itemToDelete.id));
      setFilteredProfessionals((prevState) => prevState.filter((p) => p.id !== itemToDelete.id));
      toast.success('Professional deleted successfully');
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error('Error deleting professional');
    }
  };

  const fetchPassportImage = async (imageUrl) => {
    try {
      const response = await axiosInstance.get(imageUrl, { responseType: 'blob' });
      const imageObjectURL = URL.createObjectURL(response.data);
      setPassportImage(imageObjectURL);
    } catch (error) {
      console.error('Error fetching passport image:', error);
      toast.error('Error fetching passport image');
    }
  };

  const fetchResume = async (resumeUrl) => {
    try {
      const response = await axiosInstance.get(resumeUrl, { responseType: 'blob' });
      const resumeObjectURL = URL.createObjectURL(response.data);
      window.open(resumeObjectURL, '_blank');
    } catch (error) {
      console.error('Error fetching resume:', error);
      toast.error('Error fetching resume');
    }
  };

  const renderDisciplineRow = (discipline) => (
    <TableRow key={discipline.id}>
      <TableCell>{discipline.name}</TableCell>
      <TableCell>{discipline.type}</TableCell>
      <TableCell className="operation">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewingDiscipline(discipline)}
            className="p-2 text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none"
            title="View Discipline"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingDiscipline(discipline);
              setDisciplineForm({ name: discipline.name, type: discipline.type });
            }}
            className="p-2 text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none"
            title="Edit Discipline"
          >
            <PencilLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setItemToDelete(discipline);
              setDeleteModalOpen(true);
            }}
            className="p-2 text-red-500 hover:bg-red-100 rounded-md focus:outline-none"
            title="Delete Discipline"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );

  const renderFunctionRow = (func) => (
    <TableRow key={func.id}>
      <TableCell>{func.name}</TableCell>
      <TableCell>{disciplines.find((d) => d.id === func.disciplineId)?.name}</TableCell>
      <TableCell className="operation">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewingFunction(func)}
            className="p-2 text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none"
            title="View Function"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingFunction(func);
              setFunctionForm({ name: func.name, disciplineId: func.disciplineId });
            }}
            className="p-2 text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none"
            title="Edit Function"
          >
            <PencilLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setItemToDelete(func);
              setDeleteModalOpen(true);
            }}
            className="p-2 text-red-500 hover:bg-red-100 rounded-md focus:outline-none"
            title="Delete Function"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );

  const renderProfessionalRow = (professional) => (
    <TableRow key={professional.id}>
      <TableCell>{`${professional.firstName || ''} ${professional.lastName || ''}`.trim() || 'N/A'}</TableCell>
      <TableCell>{professional.function ? professional.function : 'N/A'}</TableCell>
      <TableCell>{professional.nationality}</TableCell>
      <TableCell>{professional.discipline || 'N/A'}</TableCell>
      <TableCell>
        {professional.dateOfBirth ? new Date(professional.dateOfBirth).toLocaleDateString() : 'N/A'}
      </TableCell>
      <TableCell>{professional.status || 'N/A'}</TableCell>
      <TableCell className="operation">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setViewingProfessional(professional);
              if (professional.passportPicture) {
                fetchPassportImage(professional.passportPicture);
              }
            }}
            className="p-2 text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none"
            title="View Professional"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingProfessional(professional);
              setAddingProfessional(true);
            }}
            className="p-2 text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none"
            title="Edit Professional"
          >
            <PencilLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setItemToDelete(professional);
              setDeleteModalOpen(true);
            }}
            className="p-2 text-red-500 hover:bg-red-100 rounded-md focus:outline-none"
            title="Delete Professional"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (professional.resume) {
                fetchResume(professional.resume);
              }
            }}
            className="p-2 text-blue-600 hover:bg-gray-100 rounded-md focus:outline-none"
            title="View Resume"
          >
            View Resume
          </button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Sports Professionals Management</h1>
      {message && (
        <Message type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      {/* Navigation Tabs */}
      <div className="mb-6 overflow-x-auto">
        <nav className="flex space-x-4 min-w-max">
          {['Professionals', 'Disciplines', 'Functions'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'Professionals' ? 'Sports Professionals' : `Manage ${tab}`}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Add Button Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <Button 
          onClick={() => activeTab === 'Professionals' ? setAddingProfessional(true) : 
                        activeTab === 'Disciplines' ? setAddingDiscipline(true) : 
                        setAddingFunction(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add {activeTab === 'Professionals' ? 'Professional' : 
               activeTab === 'Disciplines' ? 'Discipline' : 'Function'}
        </Button>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              className="border rounded px-2 py-1"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      {activeTab === 'Professionals' && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="text-sm font-semibold mb-3">Search By</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Discipline</label>
              <select className="w-full border rounded px-2 py-1" value={filters.discipline} onChange={(e) => setFilter('discipline', e.target.value)}>
                <option value="">Select Discipline</option>
                {derivedOptions.disciplineOpts.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Function</label>
              <select className="w-full border rounded px-2 py-1" value={filters.func} onChange={(e) => setFilter('func', e.target.value)}>
                <option value="">Select function</option>
                {derivedOptions.functionOpts.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Age</label>
              <select className="w-full border rounded px-2 py-1" value={filters.age} onChange={(e) => setFilter('age', e.target.value)}>
                <option value="">Select Age</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-45">36-45</option>
                <option value="46-60">46-60</option>
                <option value="60+">60+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Sex</label>
              <select className="w-full border rounded px-2 py-1" value={filters.gender} onChange={(e) => setFilter('gender', e.target.value)}>
                <option value="">Select Sex</option>
                {derivedOptions.genderOpts.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Nationality</label>
              <select className="w-full border rounded px-2 py-1" value={filters.nationality} onChange={(e) => setFilter('nationality', e.target.value)}>
                <option value="">Select</option>
                {derivedOptions.nationalityOpts.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Status</label>
              <select className="w-full border rounded px-2 py-1" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
                <option value="">Select Status</option>
                {derivedOptions.statusOpts.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Province</label>
              <select className="w-full border rounded px-2 py-1" value={filters.province} onChange={(e) => setFilter('province', e.target.value)}>
                <option value="">Select Province</option>
                {derivedOptions.provinceOpts.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">District</label>
              <select className="w-full border rounded px-2 py-1" value={filters.district} onChange={(e) => setFilter('district', e.target.value)}>
                <option value="">Select District</option>
                {derivedOptions.districtOpts.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Sector</label>
              <select className="w-full border rounded px-2 py-1" value={filters.sector} onChange={(e) => setFilter('sector', e.target.value)}>
                <option value="">Select Sector</option>
                {derivedOptions.sectorOpts.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Cell</label>
              <select className="w-full border rounded px-2 py-1" value={filters.cell} onChange={(e) => setFilter('cell', e.target.value)}>
                <option value="">Select Cell</option>
                {derivedOptions.cellOpts.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Village</label>
              <select className="w-full border rounded px-2 py-1" value={filters.village} onChange={(e) => setFilter('village', e.target.value)}>
                <option value="">Select Village</option>
                {derivedOptions.villageOpts.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Button variant="outline" onClick={() => setFilters({ discipline: '', func: '', age: '', gender: '', nationality: '', status: '', province: '', district: '', sector: '', cell: '', village: '' })}>View All</Button>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow">
        <PrintButton>
        <Table>
          <TableHeader>
            <TableRow>
              {activeTab === 'Professionals' ? (
                <>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Function</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>Division</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="operation">Actions</TableHead>
                </>
              ) : activeTab === 'Disciplines' ? (
                <>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="operation">Actions</TableHead>
                </>
              ) : (
                <>
                  <TableHead>Name</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead className="operation">Actions</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeTab === 'Professionals'
              ? getCurrentPageData(filteredProfessionals).map(renderProfessionalRow)
              : activeTab === 'Disciplines'
              ? getCurrentPageData(filteredDisciplines).map(renderDisciplineRow)
              : getCurrentPageData(filteredFunctions).map(renderFunctionRow)}
          </TableBody>
        </Table>
        </PrintButton>


        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 border-t">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
            {Math.min(
              currentPage * rowsPerPage,
              activeTab === 'Professionals'
                ? filteredProfessionals.length
                : activeTab === 'Disciplines'
                ? filteredDisciplines.length
                : filteredFunctions.length
            )}{' '}
            of{' '}
            {activeTab === 'Professionals'
              ? filteredProfessionals.length
              : activeTab === 'Disciplines'
              ? filteredDisciplines.length
              : filteredFunctions.length}{' '}
            entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage * rowsPerPage >= filteredProfessionals.length}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {(addingDiscipline || editingDiscipline !== null) && (
        <Modal
          isOpen={addingDiscipline || editingDiscipline !== null}
          onClose={() => {
            setAddingDiscipline(false);
            setEditingDiscipline(null);
          }}
          title={editingDiscipline ? 'Edit Discipline' : 'Add Discipline'}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingDiscipline) {
                handleEditDiscipline();
              } else {
                handleAddDiscipline();
              }
            }}
            className="max-w-lg mx-auto space-y-6 p-4"
          >
            <div className="space-y-4">
              {/* Discipline Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={disciplineForm.name}
                  onChange={(e) => setDisciplineForm({ ...disciplineForm, name: e.target.value })}
                  required
                  placeholder="Enter discipline name"
                />
              </div>

              {/* Discipline Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={disciplineForm.type}
                  onChange={(e) => setDisciplineForm({ ...disciplineForm, type: e.target.value })}
                  required
                >
                  <option value="">Select discipline type</option>
                  <option value="Sports">Sports</option>
                  <option value="Culture">Culture</option>
                </select>
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {(addingFunction || editingFunction !== null) && (
        <Modal
          isOpen={addingFunction || editingFunction !== null}
          onClose={() => {
            setAddingFunction(false);
            setEditingFunction(null);
          }}
          title={editingFunction ? 'Edit Function' : 'Add Function'}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingFunction) {
                handleEditFunction();
              } else {
                handleAddFunction();
              }
            }}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block font-semibold">Name</label>
                <input
                  type="text"
                  className="h-12 w-full px-4 border border-gray-300 rounded-md"
                  value={functionForm.name}
                  onChange={(e) => setFunctionForm({ ...functionForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block font-semibold">Discipline</label>
                <select
                  className="h-12 w-full px-4 border border-gray-300 rounded-md"
                  value={functionForm.disciplineId}
                  onChange={(e) => setFunctionForm({ ...functionForm, disciplineId: e.target.value })}
                  required
                >
                  <option value="">Select Discipline</option>
                  {disciplines.map((discipline) => (
                    <option key={discipline.id} value={discipline.id}>
                      {discipline.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Modal>
      )}

      <Modal
        isOpen={addingProfessional || editingProfessional !== null}
        onClose={() => {
          setAddingProfessional(false);
          setEditingProfessional(null);
        }}
        title={editingProfessional ? 'Edit Professional' : 'Add Professional'}
      >
        <AddSportsProfessionalForm
          onCancel={() => {
            setAddingProfessional(false);
            setEditingProfessional(null);
          }}
          onSubmit={(data) => {
            if (editingProfessional) {
              setProfessionals((prevState) =>
                prevState.map((p) => (p.id === editingProfessional.id ? data : p))
              );
              setFilteredProfessionals((prevState) =>
                prevState.map((p) => (p.id === editingProfessional.id ? data : p))
              );
            } else {
              setProfessionals((prevState) => [...prevState, data]);
              setFilteredProfessionals((prevState) => [...prevState, data]);
            }
            setAddingProfessional(false);
            setEditingProfessional(null);
          }}
          initialData={editingProfessional || { firstName: '', lastName: '', function: '', nationality: '' }}
          isSubmitting={isLoading}
        />
      </Modal>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="py-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{itemToDelete?.name || itemToDelete?.firstName}</span>? This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {
              if (activeTab === 'Professionals') handleDeleteProfessional();
              else if (activeTab === 'Disciplines') handleDeleteDiscipline();
              else if (activeTab === 'Functions') handleDeleteFunction();
            }}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {viewingProfessional && (
        <Dialog open={!!viewingProfessional} onOpenChange={() => setViewingProfessional(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Professional Details</DialogTitle>
            </DialogHeader>
            <div className="py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Full Name</p>
                    <p className="text-base">{`${viewingProfessional.firstName} ${viewingProfessional.lastName}`}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-500">ID/Passport Number</p>
                    <p className="text-base">{viewingProfessional.idPassportNo || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-500">Date of Birth</p>
                    <p className="text-base">{viewingProfessional.dateOfBirth || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-500">Gender</p>
                    <p className="text-base">{viewingProfessional.gender || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-500">Marital Status</p>
                    <p className="text-base">{viewingProfessional.maritalStatus || 'N/A'}</p>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Location Information</h3>
                  
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Region</p>
                    <p className="text-base">{viewingProfessional.region || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-500">Place of Residence</p>
                    <p className="text-base">{viewingProfessional.placeOfResidence || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-500">Place of Birth</p>
                    <p className="text-base">{viewingProfessional.placeOfBirth || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Professional Information</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Discipline</p>
                    <p className="text-base">{viewingProfessional.discipline || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-500">Function</p>
                    <p className="text-base">{viewingProfessional.function || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-500">License</p>
                    <p className="text-base">{viewingProfessional.license || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-500">Status</p>
                    <p className="text-base">{viewingProfessional.status || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* ID Verification Information */}
              {viewingProfessional.idVerified && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">ID Verification</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-semibold text-gray-500">ID Passport Number</p>
                      <p className="text-base">{viewingProfessional.idPassportNo}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-500">Verification Status</p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ Verified
                        </span>
                      </div>
                    </div>

                    {viewingProfessional.idVerificationDate && (
                      <div>
                        <p className="text-sm font-semibold text-gray-500">Verification Date</p>
                        <p className="text-base">
                          {new Date(viewingProfessional.idVerificationDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Additional Information</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Nationality</p>
                    <p className="text-base">{viewingProfessional.nationality || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-500">Other Nationality</p>
                    <p className="text-base">{viewingProfessional.otherNationality || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-500">Fitness Status</p>
                    <p className="text-base">{viewingProfessional.fitnessStatus || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-500">Level of Education</p>
                    <p className="text-base">{viewingProfessional.levelOfEducation || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-500">Period of Experience</p>
                    <p className="text-base">{viewingProfessional.periodOfExperience || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Discipline View Dialog */}
      {viewingDiscipline && (
        <Dialog open={!!viewingDiscipline} onOpenChange={() => setViewingDiscipline(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Discipline Details</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Name</p>
                  <p className="text-base">{viewingDiscipline.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Type</p>
                  <p className="text-base">{viewingDiscipline.type}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Associated Functions</p>
                  <div className="mt-2">
                    {functions
                      .filter(f => f.disciplineId === viewingDiscipline.id)
                      .map(f => (
                        <span 
                          key={f.id}
                          className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                        >
                          {f.name}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setViewingDiscipline(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Function View Dialog */}
      {viewingFunction && (
        <Dialog open={!!viewingFunction} onOpenChange={() => setViewingFunction(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Function Details</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Name</p>
                  <p className="text-base">{viewingFunction.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Discipline</p>
                  <p className="text-base">
                    {disciplines.find(d => d.id === viewingFunction.disciplineId)?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Associated Professionals</p>
                  <div className="mt-2">
                    {professionals
                      .filter(p => p.function === viewingFunction.name)
                      .map(p => (
                        <span 
                          key={p.id}
                          className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                        >
                          {`${p.firstName} ${p.lastName}`}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setViewingFunction(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SportsProfessionals;
