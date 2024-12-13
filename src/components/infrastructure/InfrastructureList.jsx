import React, { useState, useEffect, Fragment } from 'react';
import { 
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell 
} from '../ui/table';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Select,SelectContent,SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Eye, Pencil, Trash2, MapPin, Search, Filter, AlertTriangle } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import ExportButton from './ExportButton';
import axiosInstance from '../../utils/axiosInstance';
import { Dialog, Transition } from '@headlessui/react';
import { locations } from '../../data/locations';
import PrintButton from '../reusable/Print';

const InfrastructureList = () => {
  const [infrastructures, setInfrastructures] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    province: '',
    district: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInfrastructure, setSelectedInfrastructure] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    infra_category: 0,
    infra_sub_category: 0,
    type_level: '',
    status: '',
    capacity: 0,
    description: '',
    location_province: '',
    location_district: '',
    location_sector: '',
    location_cell: '',
    location_village: '',
    latitude: 0,
    longitude: 0,
    upi: '',
    plot_area: 0,
    construction_date: '',
    owner: '',
    main_users: '',
    types_of_sports: '',
    internet_connection: false,
    electricity_connection: false,
    water_connection: false,
    access_road: false,
    health_facility: false,
    legal_representative_name: '',
    legal_representative_gender: '',
    legal_representative_email: '',
    legal_representative_phone: ''
  });
  const provinces = ['Kigali City', 'Eastern', 'Western', 'Northern', 'Southern'];
  const statuses = ['Active', 'Under Construction', 'Under Maintenance', 'Inactive'];
  const typeLevels = ['International', 'National', 'Provincial', 'District', 'Sector'];
  
  const districts = {
    'Kigali City': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
    'Eastern': ['Nyagatare', 'Gatsibo', 'Kayonza', 'Rwamagana', 'Kirehe', 'Ngoma', 'Bugesera'],
    'Western': ['Rubavu', 'Nyabihu', 'Rutsiro', 'Karongi', 'Ngororero', 'Rusizi', 'Nyamasheke'],
    'Northern': ['Musanze', 'Burera', 'Gicumbi', 'Rulindo', 'Gakenke'],
    'Southern': ['Huye', 'Gisagara', 'Nyanza', 'Nyaruguru', 'Muhanga', 'Ruhango', 'Kamonyi']
  };

  useEffect(() => {
    fetchInfrastructures();
    fetchCategories();
  }, []);

  const fetchInfrastructures = async () => {
    try {
      const response = await axiosInstance.get('/infrastructures');
      setInfrastructures(response.data);
      toast.success('Infrastructure list loaded', {
        description: `Successfully loaded ${response.data.length} infrastructures`
      });
    } catch (error) {
      console.error('Error fetching infrastructures:', error);
      toast.error('Failed to load infrastructures', {
        description: 'Please check your connection and try refreshing the page'
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/infrastructure-categories');
      setCategories(response.data);
      toast.success('Categories loaded successfully');
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories', {
        description: 'Some features may be limited. Please refresh the page.'
      });
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await axiosInstance.get(`/infrastructure-subcategories?category=${categoryId}`);
      setSubCategories(response.data);
      toast.success('Subcategories loaded successfully');
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to load subcategories', {
        description: 'Please try selecting the category again'
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedInfrastructure) {
      toast.error('No infrastructure selected');
      return;
    }
    
    try {
      const response = await axiosInstance.delete(`/infrastructures/${selectedInfrastructure.id}`);
      
      if (response.status === 200 || response.status === 204) {
        // First update the state
        setInfrastructures(prev => 
          prev.filter(infra => infra.id !== selectedInfrastructure.id)
        );
        
        // Then close the modal
        setIsDeleteModalOpen(false);
        
        // Finally show the success toast
        toast.success('Infrastructure deleted successfully', {
          description: `"${selectedInfrastructure.name}" has been removed from the system`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to delete infrastructure:', error);
      toast.error('Delete failed', {
        description: error.response?.data?.message || 'Unable to delete infrastructure. Please try again.',
        duration: 3000,
      });
    } finally {
      setSelectedInfrastructure(null);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm(editFormData);
    
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        toast.error('Validation Error', {
          description: error,
          duration: 3000,
        });
      });
      return;
    }

    try {
      const response = await axiosInstance.put(
        `/infrastructures/${selectedInfrastructure.id}`, 
        editFormData
      );
      
      toast.success('Infrastructure added successfully!');
      if (response.status === 200) {
        // First update the state
        setInfrastructures(prevInfrastructures => 
          prevInfrastructures.map(infra => 
            infra.id === selectedInfrastructure.id ? response.data : infra
          )
        );
        
        // Then close the modal
        setIsEditModalOpen(false);
        
        // Finally show the success toast
        toast.success('Infrastructure updated successfully', {
          description: `"${editFormData.name}" has been updated with the new information`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to update infrastructure:', error);
      toast.error('Update failed', {
        description: error.response?.data?.message || 'Unable to update infrastructure. Please try again.',
        duration: 3000,
      });
    } finally {
      setSelectedInfrastructure(null);
      setEditFormData({
        name: '',
        infra_category: 0,
        infra_sub_category: 0,
        type_level: '',
        status: '',
        capacity: 0,
        description: '',
        location_province: '',
        location_district: '',
        location_sector: '',
        location_cell: '',
        location_village: '',
        latitude: 0,
        longitude: 0,
        upi: '',
        plot_area: 0,
        construction_date: '',
        owner: '',
        main_users: '',
        types_of_sports: '',
        internet_connection: false,
        electricity_connection: false,
        water_connection: false,
        access_road: false,
        health_facility: false,
        legal_representative_name: '',
        legal_representative_gender: '',
        legal_representative_email: '',
        legal_representative_phone: ''
      });
    }
  };

  const openDeleteModal = (infrastructure) => {
    setSelectedInfrastructure(infrastructure);
    setIsDeleteModalOpen(true);
    toast.warning('Confirm deletion', {
      description: 'Please confirm if you want to permanently delete this infrastructure'
    });
  };

  const openViewModal = (infrastructure) => {
    setSelectedInfrastructure(infrastructure);
    setIsViewModalOpen(true);
    toast.info('Viewing details', {
      description: `Showing details for "${infrastructure.name}"`
    });
  };

  const openEditModal = (infrastructure) => {
    setSelectedInfrastructure(infrastructure);
    setEditFormData({
      name: infrastructure.name || '',
      infra_category: infrastructure.infra_category || 0,
      infra_sub_category: infrastructure.infra_sub_category || 0,
      type_level: infrastructure.type_level || '',
      status: infrastructure.status || '',
      capacity: infrastructure.capacity || 0,
      description: infrastructure.description || '',
      location_province: infrastructure.location_province || '',
      location_district: infrastructure.location_district || '',
      location_sector: infrastructure.location_sector || '',
      location_cell: infrastructure.location_cell || '',
      location_village: infrastructure.location_village || '',
      latitude: infrastructure.latitude || 0,
      longitude: infrastructure.longitude || 0,
      upi: infrastructure.upi || '',
      plot_area: infrastructure.plot_area || 0,
      construction_date: infrastructure.construction_date || '',
      owner: infrastructure.owner || '',
      main_users: infrastructure.main_users || '',
      types_of_sports: infrastructure.types_of_sports || '',
      internet_connection: infrastructure.internet_connection || false,
      electricity_connection: infrastructure.electricity_connection || false,
      water_connection: infrastructure.water_connection || false,
      access_road: infrastructure.access_road || false,
      health_facility: infrastructure.health_facility || false,
      legal_representative_name: infrastructure.legal_representative_name || '',
      legal_representative_gender: infrastructure.legal_representative_gender || '',
      legal_representative_email: infrastructure.legal_representative_email || '',
      legal_representative_phone: infrastructure.legal_representative_phone || ''
    });
    fetchSubCategories(infrastructure.infra_category);
    setIsEditModalOpen(true);
    toast.info('Edit mode', {
      description: `You are now editing "${infrastructure.name}"`
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: ['infra_category', 'infra_sub_category', 'capacity', 'latitude', 'longitude', 'plot_area'].includes(name)
        ? parseFloat(value)
        : value,
    });

    if (name === 'infra_category') {
      fetchSubCategories(value);
    }
  };

  const handleLocationChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'location_province' && {
        location_district: '',
        location_sector: '',
        location_cell: '',
        location_village: '',
      }),
      ...(field === 'location_district' && {
        location_sector: '',
        location_cell: '',
        location_village: '',
      }),
      ...(field === 'location_sector' && {
        location_cell: '',
        location_village: '',
      }),
      ...(field === 'location_cell' && {
        location_village: '',
      }),
    }));
    
    toast.info('Location updated', {
      description: `${field.replace('location_', '').charAt(0).toUpperCase() + field.slice(11)} has been updated`
    });
  };

  const filteredInfrastructures = infrastructures.filter(infra => {
    const matchesSearch = searchTerm === '' || 
      (infra.name && infra.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (infra.infra_category && infra.infra_category.toString().includes(searchTerm.toLowerCase())) ||
      (infra.location_district && infra.location_district.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = filters.category === '' || (infra.infra_category && infra.infra_category.toString() === filters.category);
    const matchesStatus = filters.status === '' || infra.status === filters.status;
    const matchesProvince = filters.province === '' || infra.location_province === filters.province;
    const matchesDistrict = filters.district === '' || infra.location_district === filters.district;

    return matchesSearch && matchesCategory && matchesStatus && matchesProvince && matchesDistrict;
  });

  const prepareExportData = () => {
    return filteredInfrastructures.map(infra => ({
      Name: infra.name,
      Category: infra.infra_category,
      Status: infra.status,
      Capacity: infra.capacity,
      Location: `${infra.location_province}, ${infra.location_district}`
    }));
  };

  const validateForm = (formData) => {
    const errors = [];

    // Required fields validation
    if (!formData.name.trim()) errors.push("Name is required");
    if (!formData.infra_category) errors.push("Infrastructure Category is required");
    if (!formData.status) errors.push("Status is required");
    if (!formData.location_province) errors.push("Province is required");
    if (!formData.location_district) errors.push("District is required");

    // Numeric validations
    if (formData.capacity < 0) errors.push("Capacity cannot be negative");
    if (formData.plot_area < 0) errors.push("Plot area cannot be negative");

    // Coordinate validations
    if (formData.latitude && (formData.latitude < -90 || formData.latitude > 90)) {
      errors.push("Latitude must be between -90 and 90");
    }
    if (formData.longitude && (formData.longitude < -180 || formData.longitude > 180)) {
      errors.push("Longitude must be between -180 and 180");
    }

    // UPI format validation (assuming it should be alphanumeric)
    if (formData.upi && !/^[a-zA-Z0-9]+$/.test(formData.upi)) {
      errors.push("UPI must contain only letters and numbers");
    }

    return errors;
  };

  return (
    <div className="space-y-6">
      <Toaster
        position="top-right"
        expand={false}
        richColors
        duration={5000}
      />
      
      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search infrastructures..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          
         
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
         <div>
         <label className="block text-sm font-medium mb-1">Category</label>
         <Select
  defaultValue={filters.category}
  onValueChange={(value) => setFilters({ ...filters, category: value })}
>
  <SelectTrigger>
    <SelectValue placeholder="All Categories" />
  </SelectTrigger>
  <SelectContent>
    {categories.map(category => (
      <SelectItem key={category.id} value={category.id}>
        {category.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
</div>
<div>
  <label className="block text-sm font-medium mb-1">Status</label>
  <Select
    defaultValue={filters.status}
    onValueChange={(value) => setFilters({ ...filters, status: value })}
  >
    <SelectTrigger>
      <SelectValue placeholder="All Statuses" />
    </SelectTrigger>
    <SelectContent>
      {statuses.map(status => (
        <SelectItem key={status} value={status}>
          {status}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

<div>
  <label className="block text-sm font-medium mb-1">Province</label>
  <Select
    value={filters.province}
    onValueChange={(value) => setFilters({ ...filters, province: value })}
  >
    <SelectTrigger>
      <SelectValue placeholder="All Provinces" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all_provinces">All Provinces</SelectItem>
      {provinces.map(province => (
        <SelectItem key={province} value={province}>
          {province}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

<div>
  <label className="block text-sm font-medium mb-1">District</label>
  <Select
    value={filters.district}
    onValueChange={(value) => setFilters({ ...filters, district: value })}
    disabled={!filters.province}
  >
    <SelectTrigger>
      <SelectValue placeholder="All Districts" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all_districts">All Districts</SelectItem>
      {filters.province &&
        districts[filters.province]?.map(district => (
          <SelectItem key={district} value={district}>
            {district}
          </SelectItem>
        ))}
    </SelectContent>
  </Select>
</div>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-gray-500">
        Showing {filteredInfrastructures.length} of {infrastructures.length} infrastructures
      </div>

      {/* Infrastructure Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <PrintButton title='Infrastructures Report'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInfrastructures.map((infra) => (
              <TableRow key={infra.id}>
                <TableCell className="font-medium">{infra.name}</TableCell>
                <TableCell>{infra.infra_category}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    infra.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : infra.status === 'Under Construction'
                      ? 'bg-yellow-100 text-yellow-800'
                      : infra.status === 'Under Maintenance'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {infra.status}
                  </span>
                </TableCell>
                <TableCell>{infra.capacity}</TableCell>
                <TableCell>
                  {`${infra.location_province}, ${infra.location_district}`}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost" title="View Details" onClick={() => openViewModal(infra)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" title="Edit" onClick={() => openEditModal(infra)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-600" 
                      title="Delete"
                      onClick={() => openDeleteModal(infra)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" title="View on Map">
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </PrintButton>
      </div>

      {/* Edit Infrastructure Modal */}
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={() => setIsEditModalOpen(false)}
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
                <div className="flex items-center gap-3 mb-4">
                  <Pencil className="h-6 w-6 text-blue-500" />
                  <Dialog.Title className="text-lg font-medium">
                    Edit Infrastructure
                  </Dialog.Title>
                </div>

                <form onSubmit={handleEditSubmit} className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label htmlFor="name" className="font-medium mb-1">
                      NAME: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      className={`border ${!editFormData.name.trim() ? 'border-red-500' : 'border-gray-300'} rounded p-2`}
                    />
                    {!editFormData.name.trim() && (
                      <span className="text-red-500 text-xs mt-1">Name is required</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="infra_category" className="font-medium mb-1">
                      INFRASTRUCTURE CATEGORY: <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="infra_category"
                      name="infra_category"
                      value={editFormData.infra_category}
                      onChange={handleEditChange}
                      className={`border ${!editFormData.infra_category ? 'border-red-500' : 'border-gray-300'} rounded p-2`}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {!editFormData.infra_category && (
                      <span className="text-red-500 text-xs mt-1">Category is required</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="infra_sub_category" className="font-medium mb-1">
                      INFRASTRUCTURE SUB CATEGORY:
                    </label>
                    <select
                      id="infra_sub_category"
                      name="infra_sub_category"
                      value={editFormData.infra_sub_category}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                      disabled={!editFormData.infra_category}
                    >
                      <option value="">Select Sub Category</option>
                      {subCategories.map((subCategory) => (
                        <option key={subCategory.id} value={subCategory.id}>
                          {subCategory.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="type_level" className="font-medium mb-1">
                      TYPE LEVEL:
                    </label>
                    <select
                      id="type_level"
                      name="type_level"
                      value={editFormData.type_level}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    >
                      <option value="">Select Type Level</option>
                      {typeLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="status" className="font-medium mb-1">
                      STATUS:
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    >
                      <option value="">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Under Construction">Under Construction</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="capacity" className="font-medium mb-1">
                      CAPACITY:
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={editFormData.capacity}
                      onChange={handleEditChange}
                      className={`border ${editFormData.capacity < 0 ? 'border-red-500' : 'border-gray-300'} rounded p-2`}
                    />
                    {editFormData.capacity < 0 && (
                      <span className="text-red-500 text-xs mt-1">Capacity cannot be negative</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="description" className="font-medium mb-1">
                      DESCRIPTION:
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    />
                  </div>

                  {/* Location Fields */}
                  <div className="flex flex-col">
                    <label htmlFor="location_province" className="font-medium mb-1">
                      PROVINCE:
                    </label>
                    <select
                      id="location_province"
                      name="location_province"
                      value={editFormData.location_province}
                      onChange={(e) => handleLocationChange('location_province', e.target.value)}
                      className="border border-gray-300 rounded p-2"
                    >
                      <option value="">Select Province</option>
                      {locations.provinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="location_district" className="font-medium mb-1">
                      DISTRICT:
                    </label>
                    <select
                      id="location_district"
                      name="location_district"
                      value={editFormData.location_district}
                      onChange={(e) => handleLocationChange('location_district', e.target.value)}
                      className="border border-gray-300 rounded p-2"
                      disabled={!editFormData.location_province}
                    >
                      <option value="">Select District</option>
                      {(locations.districts[editFormData.location_province] || []).map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="location_sector" className="font-medium mb-1">
                      SECTOR:
                    </label>
                    <select
                      id="location_sector"
                      name="location_sector"
                      value={editFormData.location_sector}
                      onChange={(e) => handleLocationChange('location_sector', e.target.value)}
                      className="border border-gray-300 rounded p-2"
                      disabled={!editFormData.location_district}
                    >
                      <option value="">Select Sector</option>
                      {(locations.sectors[editFormData.location_district] || []).map((sector) => (
                        <option key={sector} value={sector}>
                          {sector}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="location_cell" className="font-medium mb-1">
                      CELL:
                    </label>
                    <select
                      id="location_cell"
                      name="location_cell"
                      value={editFormData.location_cell}
                      onChange={(e) => handleLocationChange('location_cell', e.target.value)}
                      className="border border-gray-300 rounded p-2"
                      disabled={!editFormData.location_sector}
                    >
                      <option value="">Select Cell</option>
                      {(locations.cells[editFormData.location_sector] || []).map((cell) => (
                        <option key={cell} value={cell}>
                          {cell}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="location_village" className="font-medium mb-1">
                      VILLAGE:
                    </label>
                    <select
                      id="location_village"
                      name="location_village"
                      value={editFormData.location_village}
                      onChange={(e) => handleLocationChange('location_village', e.target.value)}
                      className="border border-gray-300 rounded p-2"
                      disabled={!editFormData.location_cell}
                    >
                      <option value="">Select Village</option>
                      {(locations.villages[editFormData.location_cell] || []).map((village) => (
                        <option key={village} value={village}>
                          {village}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="latitude" className="font-medium mb-1">
                      LATITUDE:
                    </label>
                    <input
                      type="number"
                      id="latitude"
                      name="latitude"
                      value={editFormData.latitude}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="longitude" className="font-medium mb-1">
                      LONGITUDE:
                    </label>
                    <input
                      type="number"
                      id="longitude"
                      name="longitude"
                      value={editFormData.longitude}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="upi" className="font-medium mb-1">
                      UPI:
                    </label>
                    <input
                      type="text"
                      id="upi"
                      name="upi"
                      value={editFormData.upi}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="plot_area" className="font-medium mb-1">
                      PLOT AREA:
                    </label>
                    <input
                      type="number"
                      id="plot_area"
                      name="plot_area"
                      value={editFormData.plot_area}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="construction_date" className="font-medium mb-1">
                      CONSTRUCTION DATE:
                    </label>
                    <input
                      type="date"
                      id="construction_date"
                      name="construction_date"
                      value={editFormData.construction_date}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="owner" className="font-medium mb-1">
                      OWNER:
                    </label>
                    <input
                      type="text"
                      id="owner"
                      name="owner"
                      value={editFormData.owner}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    />
                  </div>

                  {/* Facility Information */}
                  <div className="flex flex-col">
                    <label htmlFor="main_users" className="font-medium mb-1">
                      MAIN USERS:
                    </label>
                    <input
                      type="text"
                      id="main_users"
                      name="main_users"
                      value={editFormData.main_users}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="types_of_sports" className="font-medium mb-1">
                      TYPES OF SPORTS:
                    </label>
                    <input
                      type="text"
                      id="types_of_sports"
                      name="types_of_sports"
                      value={editFormData.types_of_sports}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    />
                  </div>

                  {/* Utility Connections */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="internet_connection"
                        name="internet_connection"
                        checked={editFormData.internet_connection}
                        onChange={(e) => handleEditChange({
                          target: {
                            name: 'internet_connection',
                            value: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="internet_connection">Internet Connection</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="electricity_connection"
                        name="electricity_connection"
                        checked={editFormData.electricity_connection}
                        onChange={(e) => handleEditChange({
                          target: {
                            name: 'electricity_connection',
                            value: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="electricity_connection">Electricity Connection</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="water_connection"
                        name="water_connection"
                        checked={editFormData.water_connection}
                        onChange={(e) => handleEditChange({
                          target: {
                            name: 'water_connection',
                            value: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="water_connection">Water Connection</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="access_road"
                        name="access_road"
                        checked={editFormData.access_road}
                        onChange={(e) => handleEditChange({
                          target: {
                            name: 'access_road',
                            value: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="access_road">Access Road</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="health_facility"
                        name="health_facility"
                        checked={editFormData.health_facility}
                        onChange={(e) => handleEditChange({
                          target: {
                            name: 'health_facility',
                            value: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="health_facility">Health Facility</label>
                    </div>
                  </div>

                  {/* Legal Representative Information */}
                  <div className="flex flex-col">
                    <label htmlFor="legal_representative_name" className="font-medium mb-1">
                      LEGAL REPRESENTATIVE NAME:
                    </label>
                    <input
                      type="text"
                      id="legal_representative_name"
                      name="legal_representative_name"
                      value={editFormData.legal_representative_name}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="legal_representative_gender" className="font-medium mb-1">
                      LEGAL REPRESENTATIVE GENDER:
                    </label>
                    <select
                      id="legal_representative_gender"
                      name="legal_representative_gender"
                      value={editFormData.legal_representative_gender}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="legal_representative_email" className="font-medium mb-1">
                      LEGAL REPRESENTATIVE EMAIL:
                    </label>
                    <input
                      type="email"
                      id="legal_representative_email"
                      name="legal_representative_email"
                      value={editFormData.legal_representative_email}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="legal_representative_phone" className="font-medium mb-1">
                      LEGAL REPRESENTATIVE PHONE:
                    </label>
                    <input
                      type="tel"
                      id="legal_representative_phone"
                      name="legal_representative_phone"
                      value={editFormData.legal_representative_phone}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    />
                  </div>

                  <div className="flex justify-end col-span-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* View Details Modal */}
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
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="h-6 w-6 text-blue-500" />
                  <Dialog.Title className="text-lg font-medium">
                    Infrastructure Details
                  </Dialog.Title>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {/* Basic Information */}
                  <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-blue-600">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <p><span className="font-medium">Name:</span> {selectedInfrastructure?.name}</p>
                      <p><span className="font-medium">Category:</span> {selectedInfrastructure?.infra_category}</p>
                      <p><span className="font-medium">Sub Category:</span> {selectedInfrastructure?.infra_sub_category}</p>
                      <p><span className="font-medium">Type Level:</span> {selectedInfrastructure?.type_level}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          selectedInfrastructure?.status === 'Active' ? 'bg-green-100 text-green-800' :
                          selectedInfrastructure?.status === 'Under Construction' ? 'bg-yellow-100 text-yellow-800' :
                          selectedInfrastructure?.status === 'Under Maintenance' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedInfrastructure?.status}
                        </span>
                      </p>
                      <p><span className="font-medium">Capacity:</span> {selectedInfrastructure?.capacity}</p>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-blue-600">Location Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <p><span className="font-medium">Province:</span> {selectedInfrastructure?.location_province}</p>
                      <p><span className="font-medium">District:</span> {selectedInfrastructure?.location_district}</p>
                      <p><span className="font-medium">Sector:</span> {selectedInfrastructure?.location_sector}</p>
                      <p><span className="font-medium">Cell:</span> {selectedInfrastructure?.location_cell}</p>
                      <p><span className="font-medium">Village:</span> {selectedInfrastructure?.location_village}</p>
                      <p><span className="font-medium">UPI:</span> {selectedInfrastructure?.upi}</p>
                      <p><span className="font-medium">Coordinates:</span> {selectedInfrastructure?.latitude}, {selectedInfrastructure?.longitude}</p>
                      <p><span className="font-medium">Plot Area:</span> {selectedInfrastructure?.plot_area} m²</p>
                    </div>
                  </div>

                  {/* Facility Information */}
                  <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-blue-600">Facility Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <p><span className="font-medium">Main Users:</span> {selectedInfrastructure?.main_users}</p>
                      <p><span className="font-medium">Types of Sports:</span> {selectedInfrastructure?.types_of_sports}</p>
                      <p><span className="font-medium">Construction Date:</span> {selectedInfrastructure?.construction_date}</p>
                      <p><span className="font-medium">Owner:</span> {selectedInfrastructure?.owner}</p>
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <p><span className="font-medium">Internet Connection:</span> 
                          <span className={selectedInfrastructure?.internet_connection ? 'text-green-600' : 'text-red-600'}>
                            {selectedInfrastructure?.internet_connection ? ' Yes' : ' No'}
                          </span>
                        </p>
                        <p><span className="font-medium">Electricity Connection:</span> 
                          <span className={selectedInfrastructure?.electricity_connection ? 'text-green-600' : 'text-red-600'}>
                            {selectedInfrastructure?.electricity_connection ? ' Yes' : ' No'}
                          </span>
                        </p>
                        <p><span className="font-medium">Water Connection:</span> 
                          <span className={selectedInfrastructure?.water_connection ? 'text-green-600' : 'text-red-600'}>
                            {selectedInfrastructure?.water_connection ? ' Yes' : ' No'}
                          </span>
                        </p>
                        <p><span className="font-medium">Access Road:</span> 
                          <span className={selectedInfrastructure?.access_road ? 'text-green-600' : 'text-red-600'}>
                            {selectedInfrastructure?.access_road ? ' Yes' : ' No'}
                          </span>
                        </p>
                        <p><span className="font-medium">Health Facility:</span> 
                          <span className={selectedInfrastructure?.health_facility ? 'text-green-600' : 'text-red-600'}>
                            {selectedInfrastructure?.health_facility ? ' Yes' : ' No'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Legal Representative Information */}
                  <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-blue-600">Legal Representative</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <p><span className="font-medium">Name:</span> {selectedInfrastructure?.legal_representative_name}</p>
                      <p><span className="font-medium">Gender:</span> {selectedInfrastructure?.legal_representative_gender}</p>
                      <p><span className="font-medium">Email:</span> {selectedInfrastructure?.legal_representative_email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedInfrastructure?.legal_representative_phone}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-blue-600">Description</h3>
                    <p className="whitespace-pre-wrap">{selectedInfrastructure?.description}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
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
                    Delete Infrastructure
                  </Dialog.Title>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to delete "{selectedInfrastructure?.name}"? 
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
                    onClick={handleDelete}
                  >
                    Delete Infrastructure
                  </Button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default InfrastructureList;
