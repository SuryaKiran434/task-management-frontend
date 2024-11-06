import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

function LogoutButton() {
  const { logout } = useContext(AuthContext);

  return <button onClick={logout}>Logout</button>;
}

export default LogoutButton;
