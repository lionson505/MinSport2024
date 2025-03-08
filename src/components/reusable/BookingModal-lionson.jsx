import React, { useState } from 'react';

const BookingModal = ({ isOpen, onClose, facility }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [bookingDateFrom, setBookingDateFrom] = useState('');
  const [bookingDateTo, setBookingDateTo] = useState('');
  const [bookingTimeFrom, setBookingTimeFrom] = useState('');
  const [bookingTimeTo, setBookingTimeTo] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!facility) {
      alert('Please select a valid facility.');
      return;
    }

    const bookingData = {
      infraCategoryId: facility.infraCategoryId,
      infraSubCategoryId: facility.infraSubCategoryId,
      infrastructureId: facility.id,
      name,
      email,
      gender,
      phone,
      reason,
      bookingDateFrom,
      bookingDateTo,
      bookingTimeFrom,
      bookingTimeTo,
      message,
    };

    console.log('Form submitted:', bookingData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 overflow-y-auto max-h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Book Visit to {facility?.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason
            </label>
            <input
              id="reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="bookingDateFrom" className="block text-sm font-medium text-gray-700">
              Booking Date From
            </label>
            <input
              id="bookingDateFrom"
              type="date"
              value={bookingDateFrom}
              onChange={(e) => setBookingDateFrom(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="bookingDateTo" className="block text-sm font-medium text-gray-700">
              Booking Date To
            </label>
            <input
              id="bookingDateTo"
              type="date"
              value={bookingDateTo}
              onChange={(e) => setBookingDateTo(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="bookingTimeFrom" className="block text-sm font-medium text-gray-700">
              Booking Time From
            </label>
            <input
              id="bookingTimeFrom"
              type="time"
              value={bookingTimeFrom}
              onChange={(e) => setBookingTimeFrom(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="bookingTimeTo" className="block text-sm font-medium text-gray-700">
              Booking Time To
            </label>
            <input
              id="bookingTimeTo"
              type="time"
              value={bookingTimeTo}
              onChange={(e) => setBookingTimeTo(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message (Optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
