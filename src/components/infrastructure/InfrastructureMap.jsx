import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from '../ui/Button';
import { Calendar, MapPin, Users, Phone, Mail, Info } from 'lucide-react';
import BookingRequestModal from './BookingRequestModal';
import { useInfrastructure } from '../../contexts/InfrastructureContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import InfrastructureDetailsModal from './InfrastructureDetailsModal';

// Import marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const InfrastructureMap = () => {
  const { infrastructures } = useInfrastructure();
  const [selectedInfra, setSelectedInfra] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const center = [-1.9403, 29.8739]; // Rwanda center coordinates

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Under Construction':
        return 'bg-yellow-100 text-yellow-800';
      case 'Under Maintenance':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <>
      <div className="h-[calc(100vh-12rem)] rounded-lg overflow-hidden">
        <MapContainer
          center={center}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {infrastructures.map((infra) => (
            <Marker
              key={infra.id}
              position={[infra.coordinates.latitude, infra.coordinates.longitude]}
              eventHandlers={{
                click: () => setSelectedInfra(infra),
              }}
            >
              <Popup className="w-72">
                <div className="p-2 space-y-4">
                  {/* Header */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg">{infra.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{`${infra.location.district}, ${infra.location.province}`}</span>
                    </div>
                  </div>

                  {/* Status and Category */}
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(infra.status)}`}>
                      {infra.status}
                    </span>
                    <span className="text-sm text-gray-600">{infra.category}</span>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>Capacity: {infra.capacity}</span>
                    </div>
                    {infra.services.internet && (
                      <div className="text-green-600">✓ Internet</div>
                    )}
                    {infra.services.electricity && (
                      <div className="text-green-600">✓ Electricity</div>
                    )}
                    {infra.services.water && (
                      <div className="text-green-600">✓ Water</div>
                    )}
                  </div>

                  {/* Contact */}
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{infra.legalRepresentative.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="truncate">{infra.legalRepresentative.email}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowBookingModal(true)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowDetailsModal(true)}
                    >
                      <Info className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Booking Modal */}
        <BookingRequestModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          infrastructure={selectedInfra}
        />
      </div>

      {/* Details Modal */}
      <InfrastructureDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        infrastructure={selectedInfra}
      />
    </>
  );
};

export default InfrastructureMap; 