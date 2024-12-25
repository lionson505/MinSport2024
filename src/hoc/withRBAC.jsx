import { useRBAC } from '../hooks/useRBAC';
import { Navigate } from 'react-router-dom';

export const withRBAC = (WrappedComponent, moduleId) => {
  return function WithRBACComponent(props) {
    const { checkPermission } = useRBAC();

    if (!checkPermission(moduleId, 'read')) {
      return <Navigate to="/unauthorized" />;
    }

    return <WrappedComponent {...props} />;
  };
}; 