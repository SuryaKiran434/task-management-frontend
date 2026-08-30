import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

/**
 * Guards a route by authentication and optional role requirements.
 * - Unauthenticated users → /login
 * - Authenticated but wrong role → /dashboard
 * - Authenticated with correct role → renders the component
 */
function PrivateRoute({ component: Component, roles, ...rest }) {
  const { isAuthenticated, currentUser } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles && roles.length > 0) {
    const userRoles = currentUser?.roles || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    if (!hasRequiredRole) {
      return <Navigate to="/dashboard" />;
    }
  }

  return <Component {...rest} />;
}

export default PrivateRoute;
