import { Modal } from '../../ui/modal';
import { Button } from '../../ui/Button';

export function StudentManagementModal({ 
  isOpen, 
  onClose, 
  program,
  onAddStudent,
  onEditStudent,
  onDeleteStudent 
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${program?.name} Students`}
    >
      {/* Student management content */}
    </Modal>
  );
} 