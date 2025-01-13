import React, { useState, useEffect, Fragment } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TablePagination,
} from '../ui/table';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Eye, Pencil, Trash2, Search, Filter, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format, isValid } from 'date-fns';
import axiosInstance from '../../utils/axiosInstance';
import { Dialog, Transition } from '@headlessui/react';
import EditEventModal from '../../components/tourism/EditEventModal'; // Import the EditEventModal component
import PrintButton from '../reusable/Print';
import { usePermissionLogger } from '../../utils/permissionLogger.js';

const TourismEventsList = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    date: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const itemsPerPage = 10;
  const logPermissions = usePermissionLogger('sports_tourism')
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false
  })

  const statuses = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

  useEffect(() => {
    const fetchEvents = async () => {
      const currentPermissions =await logPermissions();
      await setPermissions(currentPermissions);
      // console.log("perms:", permissions)
      try {

        const response = await axiosInstance.get('/sports-tourism-events');
        setEvents(response.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to fetch events');
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/sports-tourism-categories');
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to fetch categories');
      }
    };

    fetchEvents();
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!selectedEvent) return;

    try {
      await axiosInstance.delete(`/sports-tourism-events/${selectedEvent.id}`);
      toast.success('Event deleted successfully');
      setEvents(events.filter((event) => event.id !== selectedEvent.id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleEventUpdated = (updatedEvent) => {
    setEvents(events.map(event => event.id === updatedEvent.id ? updatedEvent : event));
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      searchTerm === '' ||
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.categoryId.toString().includes(searchTerm.toLowerCase());

    const matchesCategory = filters.category === '' || event.categoryId === parseInt(filters.category);
    const matchesStatus = filters.status === '' || event.status === filters.status;
    const matchesDate = filters.date === '' || event.startDate.includes(filters.date);

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search events..."
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              )) || <option disabled>No categories available</option>}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <Input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-gray-500">
        Showing {paginatedEvents.length} of {filteredEvents.length} events
      </div>

      {/* Events Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <PrintButton title='SPORTS TOURISM'>
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="operation">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.name}</TableCell>
                <TableCell>
                  {categories.find(cat => cat.id === event.categoryId)?.name || 'Unknown Category'}
                </TableCell>
                <TableCell>
                  {isValid(new Date(event.startDate))
                    ? format(new Date(event.startDate), 'MMM dd, yyyy')
                    : 'Invalid Date'}
                </TableCell>
                <TableCell>{`${event.province}, ${event.district}`}</TableCell>
                <TableCell className="operation" >
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      title="View Details"
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsViewModalOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {permissions.canUpdate && (<Button
                        size="sm"
                        variant="ghost"
                        title="Edit"
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsEditModalOpen(true);
                        }}
                    >
                      <Pencil className="h-4 w-4 text-black" />
                    </Button>)}
                    {
                      permissions.canDelete && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600"
                                title="Delete"
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setIsDeleteModalOpen(true);
                                }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                        )
                    }

                    <Button
                      size="sm"
                      variant="ghost"
                      title="View Calendar"
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsScheduleModalOpen(true);
                      }}
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </PrintButton>
       

        {/* Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="border-t border-gray-200 dark:border-gray-700"
        />
      </div>

      {/* View Modal */}
      <Transition appear show={isViewModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsViewModalOpen(false)}>
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
                <Dialog.Title className="text-xl font-semibold mb-4">Event Details</Dialog.Title>
                
                {/* Banner Section */}
                {selectedEvent?.banner ? (
                  <div className="mb-4">
                    {console.log('Banner full path:', `${axiosInstance.defaults.baseURL}${selectedEvent.banner}`)}
                    <img 
                      src={`${axiosInstance.defaults.baseURL}/${selectedEvent.banner}`} 
                      controls 
                      className="mt-2 w-full rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="mb-4 p-4 bg-gray-100 rounded-lg text-gray-500 text-center">
                    No banner image available
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {selectedEvent?.name}</p>
                    <p><strong>Category:</strong> {selectedEvent?.category}</p>
                    <p><strong>Sub Category:</strong> {selectedEvent?.subCategory}</p>
                    <p><strong>Start Date:</strong> {isValid(new Date(selectedEvent?.startDate)) ? 
                      format(new Date(selectedEvent?.startDate), 'MMM dd, yyyy') : 'Invalid Date'}</p>
                    <p><strong>End Date:</strong> {isValid(new Date(selectedEvent?.endDate)) ? 
                      format(new Date(selectedEvent?.endDate), 'MMM dd, yyyy') : 'Invalid Date'}</p>
                    <p><strong>Time:</strong> {selectedEvent?.timeFrom} - {selectedEvent?.timeTo}</p>
                    <p><strong>Status:</strong> {selectedEvent?.isPublished ? 'Published' : 'Draft'}</p>
                  </div>

                  <div className="space-y-2">
                    <p><strong>Location:</strong></p>
                    <p className="ml-4">Province: {selectedEvent?.province}</p>
                    <p className="ml-4">District: {selectedEvent?.district}</p>
                    <p className="ml-4">Sector: {selectedEvent?.sector}</p>
                    <p className="ml-4">Cell: {selectedEvent?.cell}</p>
                    <p className="ml-4">Village: {selectedEvent?.village}</p>
                  </div>

                  <div className="space-y-2">
                    <p><strong>Participants:</strong></p>
                    <p className="ml-4">Male: {selectedEvent?.maleParticipants}</p>
                    <p className="ml-4">Female: {selectedEvent?.femaleParticipants}</p>
                    <p className="ml-4">Total: {(selectedEvent?.maleParticipants || 0) + (selectedEvent?.femaleParticipants || 0)}</p>
                  </div>

                  <div className="space-y-2">
                    <p><strong>Financial:</strong></p>
                    <p className="ml-4">Participant Fee: ${selectedEvent?.participantsFee}</p>
                    <p className="ml-4">Amount Generated: ${selectedEvent?.amountGenerated}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p><strong>Description:</strong></p>
                  <p className="mt-1 text-gray-600">{selectedEvent?.description}</p>
                </div>

                {/* Video Section */}
                {selectedEvent?.video ? (
                  <div className="mt-4">
                    <p><strong>Event Video:</strong></p>
                    {console.log('Video full path:', `${axiosInstance.defaults.baseURL}/uploads/video/${selectedEvent.video}`)}
                    <video 
                      src={`${axiosInstance.defaults.baseURL}/${selectedEvent.video}`} 
                      controls 
                      className="mt-2 w-full rounded-lg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg text-gray-500 text-center">
                    No event video available
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Schedule Modal */}
      <Transition appear show={isScheduleModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsScheduleModalOpen(false)}>
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
                <Dialog.Title className="text-lg font-medium mb-4">Event Schedule</Dialog.Title>
                <div className="space-y-2">
                  <p><strong>Start Date:</strong> {isValid(new Date(selectedEvent?.startDate)) ? format(new Date(selectedEvent?.startDate), 'MMM dd, yyyy') : 'Invalid Date'}</p>
                  <p><strong>End Date:</strong> {isValid(new Date(selectedEvent?.endDate)) ? format(new Date(selectedEvent?.endDate), 'MMM dd, yyyy') : 'Invalid Date'}</p>
                  {/* Add more schedule details here */}
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
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
        <Dialog as="div" className="relative z-50" onClose={() => setIsDeleteModalOpen(false)}>
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
                    Delete Event
                  </Dialog.Title>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to delete "{selectedEvent?.name}"? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>
                    Delete Event
                  </Button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Edit Modal */}
      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        event={selectedEvent}
        onEventUpdated={handleEventUpdated}
      />
    </div>
  );
};

export default TourismEventsList;