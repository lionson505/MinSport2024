import { Modal } from '../../ui/Modal';

export function ProgramDetailsModal({ isOpen, onClose, program }) {
  if (!program) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${program.name} Details`}
    >
      <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4 sticky top-0 bg-white py-2">
            Basic Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* ... Basic info fields ... */}
                     </div>
        </div>
        {/* ... Other sections ... */}
      </div>
    </Modal>
  );
} 