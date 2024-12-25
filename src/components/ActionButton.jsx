import React from 'react';
import { Button } from './ui/Button';

export const ActionButton = ({ moduleId, action, children, onClick, disabled = false, ...props }) => {
  const checkPermission = () => {
    try {
      // Admin bypass
      if (localStorage.getItem('userRole') === 'admin') return true;

      // Get user permissions
      const accessibleLinks = localStorage.getItem('accessibleLinks');
      if (!accessibleLinks) return false;

      const parsedLinks = JSON.parse(accessibleLinks);
      const module = parsedLinks.find(link => link.moduleId === moduleId);
      
      if (!module) return false;

      // Check specific action permission
      switch (action) {
        case 'create': return module.canCreate;
        case 'read': return module.canRead;
        case 'update': return module.canUpdate;
        case 'delete': return module.canDelete;
        default: return false;
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  // Don't render button if no permission
  if (!checkPermission()) return null;

  return (
    <Button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </Button>
  );
}; 