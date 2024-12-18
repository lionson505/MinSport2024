import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

function Toast({ message, type = 'success', onClose }) {
  const types = {
    success: 'bg-success text-white',
    error: 'bg-danger text-white',
    warning: 'bg-warning text-white',
    info: 'bg-info text-white'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center ${types[type]}`}
      >
        <span className="mr-2">{message}</span>
        <button onClick={onClose} className="p-1 hover:opacity-80">
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

export default Toast; 