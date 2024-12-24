import React, { useState, useMemo, useEffect } from 'react';
import { 
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TablePagination 
} from '../ui/table';
import { Button } from '../ui/Button';
import { Check, X, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import axiosInstance from '../../utils/axiosInstance';
import BookRequestModal from '../../components/infrastructure/BookingRequestModal';
import PrintButton from '../reusable/Print';

// ActionModal component defined within the same file
const ActionModal = ({ isOpen, onClose, onConfirm, actionType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          {actionType === 'grant' ? 'Grant Booking' : 'Reject Booking'}
        </h2>
        <p>Are you sure you want to {actionType} this booking?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button onClick={onConfirm} className={actionType === 'grant' ? 'bg-green-600' : 'bg-red-600'}>
            {actionType === 'grant' ? 'Grant' : 'Reject'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const BookingManagement = () => {
  const [bookings, setBookings] = useState([
    {
      "id": 1,
      "infraCategoryId": 1,
      "infraSubCategoryId": 1,
      "infrastructureId": 10,
      "name": "John Doe",
      "gender": "Male",
      "email": "john.doe@example.com",
      "phone": "+250785283913",
      "reason": "Conference meeting",
      "bookingDateFrom": "2024-01-15T00:00:00.000Z",
      "bookingDateTo": "2024-01-16T00:00:00.000Z",
      "bookingTimeFrom": "2024-01-15T09:00:00.000Z",
      "bookingTimeTo": "2024-01-15T17:00:00.000Z",
      "status": "Pending",
      "approvedBy": null,
      "rejectedBy": null,
      "createdAt": "2024-12-17T16:31:56.021Z",
      "updatedAt": "2024-12-17T16:35:01.114Z",
      "infraCategory": {
        "id": 1,
        "name": "Joshua testjhjn",
        "createdAt": "2024-12-04T12:25:49.979Z",
        "updatedAt": "2024-12-04T15:44:03.005Z"
      },
      "infraSubCategory": {
        "id": 1,
        "name": "good",
        "categoryId": 1,
        "createdAt": "2024-12-04T14:37:47.157Z",
        "updatedAt": "2024-12-05T08:14:44.029Z"
      },
      "infrastructure": {
        "id": 10,
        "name": "mmmwwww",
        "infraCategoryId": 1,
        "infraSubCategoryId": 1,
        "type_level": "International",
        "status": "Active",
        "capacity": 20000,
        "description": "STADIUM",
        "location_province": "Kigali City",
        "location_district": "Gasabo",
        "location_sector": "Kacyiru",
        "location_cell": "Kamatamu",
        "location_village": "Amajyambere",
        "latitude": 22,
        "longitude": 22,
        "upi": "122330",
        "plot_area": 3299,
        "construction_date": "2024-12-06",
        "owner": "FIFA",
        "createdAt": "2024-12-06T10:46:31.011Z",
        "updatedAt": "2024-12-13T06:46:16.486Z",
        "main_users": "sdsdsa",
        "types_of_sports": "sasd",
        "internet_connection": true,
        "electricity_connection": true,
        "water_connection": true,
        "access_road": true,
        "health_facility": true,
        "legal_representative_name": "dsdsd",
        "legal_representative_gender": "Male",
        "legal_representative_email": "asskj@gmail.com",
        "legal_representative_phone": "0987654328"
      }
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [actionType, setActionType] = useState('');
  const itemsPerPage = 5;

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axiosInstance.get('/booking-requests');
      setBookings(response.data);
      // toast.success('Bookings fetched successfully');a
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = 
        booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone.includes(searchTerm);

      const matchesStatus = statusFilter ? booking.status === statusFilter : true;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, currentPage]);

  const handleAction = async () => {
    try {
      const endpoint = `/booking-requests/${selectedBookingId}/${actionType}`;
      await axiosInstance.put(endpoint);
      setBookings(prev => prev.map(booking => 
        booking.id === selectedBookingId ? { ...booking, status: actionType === 'grant' ? 'Approved' : 'Rejected' } : booking
      ));
      toast.success(`Booking ${actionType === 'grant' ? 'granted' : 'rejected'} successfully`);
      setActionModalOpen(false);
    } catch (error) {
      console.error(`Failed to ${actionType} booking:`, error);
      toast.error(`Failed to ${actionType} booking`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-[130px] h-9"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </Select>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="ml-auto"
        >
          Add Booking
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <PrintButton title='BOOKING REQUESTS REPORTS'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facility</TableHead>
                <TableHead>Organizer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="operation">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.infrastructure.name}</TableCell>
                  <TableCell>{booking.name}</TableCell>
                  <TableCell>{new Date(booking.bookingDateFrom).toLocaleDateString()} - {new Date(booking.bookingDateTo).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(booking.bookingTimeFrom).toLocaleTimeString()} - {new Date(booking.bookingTimeTo).toLocaleTimeString()}</TableCell>
                  <TableCell>{booking.reason}</TableCell>
                  <TableCell>{booking.email} / {booking.phone}</TableCell>
                  <TableCell className="operation"> 
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'Approved' 
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {booking.status === 'Pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => {
                              setSelectedBookingId(booking.id);
                              setActionType('grant');
                              setActionModalOpen(true);
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedBookingId(booking.id);
                              setActionType('reject');
                              setActionModalOpen(true);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </PrintButton>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="border-t border-gray-200 dark:border-gray-700"
        />
      </div>

      {isModalOpen && (
        <BookRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onBookingAdded={fetchBookings}
        />
      )}

      <ActionModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onConfirm={handleAction}
        actionType={actionType}
      />
    </div>
  );
};

export default BookingManagement;
