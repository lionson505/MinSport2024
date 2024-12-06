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
import { Select } from '../ui/select';
import { Eye, Edit, Trash2, MapPin, Search, Filter, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import ExportButton from './ExportButton';
import axiosInstance from '../../utils/axiosInstance';
import { Dialog, Transition } from '@headlessui/react';
import { locations } from '../../data/locations';

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
    owner: ''
  });

  const provinces = ['Kigali City', 'Eastern', 'Western', 'Northern', 'Southern'];
  const statuses = ['Active', 'Under Construction', 'Under Maintenance', 'Inactive'];

  useEffect(() => {
    fetchInfrastructures();
    fetchCategories();
  }, []);

  const fetchInfrastructures = async () => {
    try {
      const response = await axiosInstance.get('/infrastructures');
      setInfrastructures(response.data);
    } catch (error) {
      console.error('Error fetching infrastructures:', error);
      toast.error('Failed to fetch infrastructures');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/infrastructure-categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await axiosInstance.get(`/infrastructure-subcategories?category=${categoryId}`);
      setSubCategories(response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to fetch subcategories');
    }
  };

  const handleDelete = async () => {
    if (!selectedInfrastructure) return;
    try {
      await axiosInstance.delete(`/infrastructures/${selectedInfrastructure.id}`);
      setInfrastructures(prev => prev.filter(infra => infra.id !== selectedInfrastructure.id));
      toast.success('Infrastructure deleted successfully');
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Failed to delete infrastructure:', error);
      toast.error('Failed to delete infrastructure');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/infrastructures/${selectedInfrastructure.id}`, editFormData);
      setInfrastructures(prev => prev.map(infra => infra.id === selectedInfrastructure.id ? { ...infra, ...editFormData } : infra));
      toast.success('Infrastructure updated successfully');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update infrastructure:', error);
      toast.error('Failed to update infrastructure');
    }
  };

  const openDeleteModal = (infrastructure) => {
    setSelectedInfrastructure(infrastructure);
    setIsDeleteModalOpen(true);
  };

  const openViewModal = (infrastructure) => {
    setSelectedInfrastructure(infrastructure);
    setIsViewModalOpen(true);
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
      owner: infrastructure.owner || ''
    });
    fetchSubCategories(infrastructure.infra_category);
    setIsEditModalOpen(true);
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

  return (
    <div className="space-y-6">
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
          <ExportButton 
            data={prepareExportData()} 
            filename="infrastructure-list" 
            type="xlsx" 
          />
          <ExportButton 
            data={prepareExportData()} 
            filename="infrastructure-list" 
            type="csv" 
          />
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
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Province</label>
            <Select
              value={filters.province}
              onChange={(e) => setFilters({ ...filters, province: e.target.value })}
            >
              <option value="">All Provinces</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">District</label>
            <Select
              value={filters.district}
              onChange={(e) => setFilters({ ...filters, district: e.target.value })}
              disabled={!filters.province}
            >
              <option value="">All Districts</option>
              {/* Add districts based on selected province */}
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
                      <Edit className="h-4 w-4" />
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
                  <Edit className="h-6 w-6 text-blue-500" />
                  <Dialog.Title className="text-lg font-medium">
                    Edit Infrastructure
                  </Dialog.Title>
                </div>

                <form onSubmit={handleEditSubmit} className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label htmlFor="name" className="font-medium mb-1">
                      NAME:
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="infra_category" className="font-medium mb-1">
                      INFRASTRUCTURE CATEGORY:
                    </label>
                    <select
                      id="infra_category"
                      name="infra_category"
                      value={editFormData.infra_category}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
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
                    <input
                      type="text"
                      id="type_level"
                      name="type_level"
                      value={editFormData.type_level}
                      onChange={handleEditChange}
                      className="border border-gray-300 rounded p-2"
                    />
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
                      className="border border-gray-300 rounded p-2"
                    />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="h-6 w-6 text-blue-500" />
                  <Dialog.Title className="text-lg font-medium">
                    View Infrastructure Details
                  </Dialog.Title>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  <p><strong>Name:</strong> {selectedInfrastructure?.name}</p>
                  <p><strong>Category:</strong> {selectedInfrastructure?.infra_category}</p>
                  <p><strong>Status:</strong> {selectedInfrastructure?.status}</p>
                  <p><strong>Capacity:</strong> {selectedInfrastructure?.capacity}</p>
                  <p><strong>Location:</strong> {`${selectedInfrastructure?.location_province}, ${selectedInfrastructure?.location_district}`}</p>
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
