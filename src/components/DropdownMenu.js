// src/components/DropdownMenu.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './DropdownMenu.css';

function DropdownMenu() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dropdown-menu">
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default DropdownMenu;