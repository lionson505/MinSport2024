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
import { Check, X, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import axiosInstance from '../../utils/axiosInstance';
import BookRequestModal from '../../components/infrastructure/BookingRequestModal'; // Import the modal
import PrintButton from '../reusable/Print';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const itemsPerPage = 5;

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axiosInstance.get('/booking-requests');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = 
        booking.facility.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.contact.includes(searchTerm);

      const matchesStatus = statusFilter ? booking.status === statusFilter : true;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, currentPage]);

  const handleApprove = async (bookingId) => {
    try {
      await axiosInstance.put(`/booking-requests/${bookingId}/approve`);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: 'approved' } : booking
      ));
      toast.success('Booking approved successfully');
    } catch (error) {
      console.error('Failed to approve booking:', error);
      toast.error('Failed to approve booking');
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await axiosInstance.put(`/booking-requests/${bookingId}/reject`);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: 'rejected' } : booking
      ));
      toast.success('Booking rejected');
    } catch (error) {
      console.error('Failed to reject booking:', error);
      toast.error('Failed to reject booking');
    }
  };

  return (
    <div className="space-y-4">
      {/* Compact Filter Bar */}
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
        <Button
          onClick={() => setIsModalOpen(true)} // Open the modal
          className="ml-auto"
        >
          Add Booking
        </Button>
      </div>

      {/* Bookings Table */}
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
                <TableCell>{booking.facility}</TableCell>
                <TableCell>{booking.organizer}</TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>{booking.time}</TableCell>
                <TableCell>{booking.purpose}</TableCell>
                <TableCell>{booking.contact}</TableCell>
                <TableCell className="operation"> 
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    booking.status === 'approved' 
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleApprove(booking.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleReject(booking.id)}
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

        {/* Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="border-t border-gray-200 dark:border-gray-700"
        />
      </div>

      {/* Book Request Modal */}
      {isModalOpen && (
        <BookRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onBookingAdded={fetchBookings} // Refresh bookings after adding
        />
      )}
    </div>
  );
};

export default BookingManagement;
