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
import { Eye, Edit, Trash2, Search, Filter, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format, isValid } from 'date-fns';
import axiosInstance from '../../utils/axiosInstance';
import { Dialog, Transition } from '@headlessui/react';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const itemsPerPage = 10;

  const statuses = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

  useEffect(() => {
    const fetchEvents = async () => {
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

  const handleEditSave = async () => {
    if (!selectedEvent) return;

    try {
      const response = await axiosInstance.put(`/sports-tourism-events/${selectedEvent.id}`, selectedEvent);
      setEvents(events.map(event => (event.id === selectedEvent.id ? response.data : event)));
      toast.success('Event updated successfully');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.name}</TableCell>
                <TableCell>{event.categoryId}</TableCell>
                <TableCell>
                  {isValid(new Date(event.startDate))
                    ? format(new Date(event.startDate), 'MMM dd, yyyy')
                    : 'Invalid Date'}
                </TableCell>
                <TableCell>{`${event.province}, ${event.district}`}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      event.status === 'Upcoming'
                        ? 'bg-blue-100 text-blue-800'
                        : event.status === 'Ongoing'
                        ? 'bg-green-100 text-green-800'
                        : event.status === 'Completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {event.status}
                  </span>
                </TableCell>
                <TableCell>
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
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Edit"
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title className="text-lg font-medium mb-4">Event Details</Dialog.Title>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {selectedEvent?.name}</p>
                  <p><strong>Category:</strong> {selectedEvent?.categoryId}</p>
                  <p><strong>Start Date:</strong> {isValid(new Date(selectedEvent?.startDate)) ? format(new Date(selectedEvent?.startDate), 'MMM dd, yyyy') : 'Invalid Date'}</p>
                  <p><strong>Location:</strong> {`${selectedEvent?.province}, ${selectedEvent?.district}`}</p>
                  <p><strong>Status:</strong> {selectedEvent?.status}</p>
                  <p><strong>Description:</strong> {selectedEvent?.description}</p>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Edit Modal */}
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsEditModalOpen(false)}>
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
                <Dialog.Title className="text-lg font-medium mb-4">Edit Event</Dialog.Title>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Event Name</label>
                    <Input
                      value={selectedEvent?.name || ''}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <Select
                      value={selectedEvent?.categoryId || ''}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, categoryId: e.target.value })}
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SubCategory</label>
                    <Input
                      type="number"
                      value={selectedEvent?.subCategory || ''}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, subCategory: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Province</label>
                    <Input
                      value={selectedEvent?.province || ''}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, province: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">District</label>
                    <Input
                      value={selectedEvent?.district || ''}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, district: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sector</label>
                    <Input
                      value={selectedEvent?.sector || ''}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, sector: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cell</label>
                    <Input
                      value={selectedEvent?.cell || ''}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, cell: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Village</label>
                    <Input
                      value={selectedEvent?.village || ''}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, village: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <Input
                      type="date"
                      value={selectedEvent?.startDate || ''}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <Input
                      type="date"
                      value={selectedEvent?.endDate || ''}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, endDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Participants</label>
                    <Input
                      type="number"
                      value={selectedEvent?.participants || ''}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, participants: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Participants Fee</label>
                    <Input
                      type="number"
                      value={selectedEvent?.participantsFee || ''}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, participantsFee: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount Generated</label>
                    <Input
                      type="number"
                      value={selectedEvent?.amountGenerated || ''}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, amountGenerated: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input
                      value={selectedEvent?.description || ''}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Is Published</label>
                    <Select
                      value={selectedEvent?.isPublished ? 'true' : 'false'}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, isPublished: e.target.value === 'true' })}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </Select>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="ml-2" onClick={handleEditSave}>
                      Save
                    </Button>
                  </div>
                </form>
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
    </div>
  );
};

export default TourismEventsList;
