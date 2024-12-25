import { Button } from './ui/Button';
import { checkPermission } from '../utils/permissions';

export const ActionButton = ({ 
  moduleId, 
  action, 
  onClick, 
  children, 
  permissions,
  className = "bg-blue-600 hover:bg-blue-700 text-white",
  ...props
}) => {
  const canPerformAction = checkPermission(permissions, moduleId, action);

  if (!canPerformAction) return null;

  return (
    <Button
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}; 