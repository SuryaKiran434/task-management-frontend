import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';
import userService from '../services/userService';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId, updatedData) => {
    try {
      const response = await axiosInstance.put(`/users/${userId}`, updatedData);
      setUsers(users.map(user => (user.id === userId ? response.data : user)));
      setUnsavedChanges(false);
    } catch (err) {
      setError('Failed to update user.');
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axiosInstance.delete(`/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  const assignAdmin = async (userId) => {
    try {
      await userService.assignAdmin(userId);
      setUsers(users.map(user =>
        user.id === userId ? { ...user, roles: [...user.roles, 'ROLE_ADMIN'] } : user
      ));
    } catch (err) {
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
