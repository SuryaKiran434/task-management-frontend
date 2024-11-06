import React, { useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';  // Update to Navigate for React Router v6
import { AuthContext } from '../../contexts/AuthContext';

function PrivateRoute({ component: Component, ...rest }) {
  const { isAuthenticated } = useContext(AuthContext);

  return isAuthenticated ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/login" />  // Replaces Redirect
  );
}

export default PrivateRoute;
