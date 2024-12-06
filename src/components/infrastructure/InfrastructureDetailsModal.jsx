import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  MapPin,
  Calendar,
  Users,
  Phone,
  Mail,
  Building,
  Ruler,
  CalendarClock,
  User,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import BookingRequestModal from './BookingRequestModal';

const InfrastructureDetailsModal = ({ isOpen, onClose, infrastructure }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);

  if (!infrastructure) return null;

  const ServiceIndicator = ({ available, label }) => (
    <div className="flex items-center space-x-2">
      {available ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
      <span className="text-sm">{label}</span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={infrastructure.name}
      size="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <span className={`px-3 py-1 rounded-full text-sm ${
              infrastructure.status === 'Active'
                ? 'bg-green-100 text-green-800'
                : infrastructure.status === 'Under Construction'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {infrastructure.status}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Category</label>
              <p className="font-medium">{infrastructure.category}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Sub Category</label>
              <p className="font-medium">{infrastructure.subCategory}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Type/Level</label>
              <p className="font-medium">{infrastructure.type}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Capacity</label>
              <p className="font-medium">{infrastructure.capacity} people</p>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Location</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Province</label>
              <p className="font-medium">{infrastructure.location.province}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">District</label>
              <p className="font-medium">{infrastructure.location.district}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Sector</label>
              <p className="font-medium">{infrastructure.location.sector}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Cell</label>
              <p className="font-medium">{infrastructure.location.cell}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Village</label>
              <p className="font-medium">{infrastructure.location.village}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Latitude</label>
              <p className="font-medium">{infrastructure.coordinates.latitude}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Longitude</label>
              <p className="font-medium">{infrastructure.coordinates.longitude}</p>
            </div>
          </div>
        </div>

        {/* Property Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Property Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">UPI</label>
              <p className="font-medium">{infrastructure.upi}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Plot Area</label>
              <p className="font-medium">{infrastructure.plotArea} SQM</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Construction Date</label>
              <p className="font-medium">{infrastructure.constructionDate}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Owner</label>
              <p className="font-medium">{infrastructure.owner}</p>
            </div>
          </div>
        </div>

        {/* Sports Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sports Types</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(infrastructure.sportsTypes).map(([sport, isAvailable]) => (
              <ServiceIndicator
                key={sport}
                available={isAvailable}
                label={sport.charAt(0).toUpperCase() + sport.slice(1)}
              />
            ))}
          </div>
        </div>

        {/* Available Services */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Available Services</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(infrastructure.services).map(([service, isAvailable]) => (
              <ServiceIndicator
                key={service}
                available={isAvailable}
                label={service.split(/(?=[A-Z])/).join(' ')}
              />
            ))}
          </div>
        </div>

        {/* Legal Representative */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Legal Representative</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Name</label>
              <p className="font-medium">{infrastructure.legalRepresentative.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Gender</label>
              <p className="font-medium">{infrastructure.legalRepresentative.gender}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{infrastructure.legalRepresentative.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Phone</label>
              <p className="font-medium">{infrastructure.legalRepresentative.phone}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowBookingModal(true)}
          >
            Book Facility
          </Button>
        </div>

        {/* Booking Modal */}
        <BookingRequestModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          infrastructure={infrastructure}
        />
      </div>
    </Modal>
  );
};

export default InfrastructureDetailsModal; 