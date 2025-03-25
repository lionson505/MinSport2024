import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './Button';

export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className={`${
            size === "sm" ? "max-w-sm" :
            size === "md" ? "max-w-md" :
            size === "lg" ? "max-w-lg" :
            size === "xl" ? "max-w-xl" :
            size === "2xl" ? "max-w-2xl" :
            size === "3xl" ? "max-w-3xl" :
            size === "4xl" ? "max-w-4xl" :
            size === "5xl" ? "max-w-5xl" : ""
          }`}>
            {title && (
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
            )}
            {children}
          </DialogContent>
        </Dialog>
        <Button onClick={onClose} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
          Close
        </Button>
      </div>
    </div>
  );
};

export default Modal; 