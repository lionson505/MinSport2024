import React from 'react';
import Modal from '../ui/Modal';

const ViewPlayerModal = ({ isOpen, onClose, player }) => {
  if (!player) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${player.name} Details`}
      className="max-w-4xl"
    >
      <div className="max-h-[70vh] overflow-y-auto pr-4">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{player.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{player.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Federation</p>
                <p className="font-medium">{player.federation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Club</p>
                <p className="font-medium">{player.club}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{player.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nationality</p>
                <p className="font-medium">{player.nationality}</p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Position/Role</p>
                <p className="font-medium">{player.position || player.role || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Jersey Number</p>
                <p className="font-medium">{player.jerseyNumber || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewPlayerModal; 