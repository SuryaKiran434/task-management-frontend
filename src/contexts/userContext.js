import React, { createContext, useState, useEffect, useContext } from 'react';
import userService from '../services/userService'; // Import user service

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Fetch all users
  const fetchAllUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token missing.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/users', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  // Update user information
  const updateUser = async (userId, updatedData) => {
    try {
      const response = await fetch(`http://localhost:8081/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedData),
      });
      const updatedUser = await response.json();
      setUsers(users.map(user => (user.id === userId ? updatedUser : user)));
      setUnsavedChanges(false);
    } catch {
      setError('Failed to update user.');
    }
  };

  // Delete user by ID
  const deleteUser = async (userId) => {
    try {
      await fetch(`http://localhost:8081/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(users.filter(user => user.id !== userId));
    } catch {
      setError('Failed to delete user.');
    }
  };

  // Assign admin role to a user
  const assignAdmin = async (userId) => {
    try {
      await userService.assignAdmin(userId);
      setUsers(users.map(user =>
        user.id === userId ? { ...user, roles: [...user.roles, 'ADMIN'] } : user
      ));
    } catch {
      setError('Failed to assign admin role.');
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <UserContext.Provider value={{
      users,
      error,
      loading,
      fetchAllUsers,
      updateUser,
      deleteUser,
      assignAdmin,
      unsavedChanges,
      setUnsavedChanges
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
