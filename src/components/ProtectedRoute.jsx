import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ moduleId, children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  const checkAccess = () => {
    if (!token) return false;
    if (userRole === 'admin') return true;

    try {
      const accessibleLinks = localStorage.getItem('accessibleLinks');
      if (!accessibleLinks) return false;

      const parsedLinks = JSON.parse(accessibleLinks);
      return parsedLinks.some(link => 
        link.moduleId === moduleId && link.canRead
      );
    } catch (error) {
      return false;
    }
  };

  if (!token) return <Navigate to="/login" />;
  if (!checkAccess()) return <Navigate to="/unauthorized" />;

  return children;
};

export default ProtectedRoute; 