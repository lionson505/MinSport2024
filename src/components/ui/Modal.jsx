import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';

export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  return (
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
  );
};

export default Modal; 