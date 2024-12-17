import React from 'react';
import Modal from '../ui/Modal';
import { Calendar } from 'lucide-react';

const TransferHistoryModal = ({ isOpen, onClose, player }) => {
  // Sample transfer history data
  const transferHistory = [
    {
      id: 1,
      date: 'Jan 2023',
      fromClub: 'APR FC',
      toClub: 'Rayon Sports FC',
      type: 'Transfer'
    },
    {
      id: 2,
      date: 'Aug 2022',
      fromClub: 'Police FC',
      toClub: 'APR FC',
      type: 'Transfer'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${player?.name} - Transfer History`}
      className="max-w-4xl"
    >
      <div className="max-h-[70vh] overflow-y-auto pr-4">
        <div className="space-y-6">
          {transferHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No transfer history available</p>
          ) : (
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

              {/* Transfer Items */}
              <div className="space-y-6 ml-12">
                {transferHistory.map((transfer) => (
                  <div key={transfer.id} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[2.5rem] mt-1.5">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>

                    {/* Transfer Content */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{transfer.type}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            From: <span className="font-medium">{transfer.fromClub}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            To: <span className="font-medium">{transfer.toClub}</span>
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">{transfer.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TransferHistoryModal; 