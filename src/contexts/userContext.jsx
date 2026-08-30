import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import axiosInstance from '../utils/axiosInstance';
import userService from '../services/userService';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const fetchAllUsers = useCallback(async () => {
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
  }, []);

  const updateUser = useCallback(async (userId, updatedData) => {
    try {
      const response = await axiosInstance.put(`/users/${userId}`, updatedData);
      setUsers((prev) => prev.map(user => (user.id === userId ? response.data : user)));
      setUnsavedChanges(false);
    } catch (err) {
      setError('Failed to update user.');
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    try {
      await axiosInstance.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter(user => user.id !== userId));
    } catch (err) {
      setError('Failed to delete user.');
    }
  }, []);

  const assignAdmin = useCallback(async (userId) => {
    try {
      await userService.assignAdmin(userId);
      setUsers((prev) => prev.map(user =>
        user.id === userId ? { ...user, roles: [...user.roles, 'ROLE_ADMIN'] } : user
      ));
    } catch (err) {
      setError('Failed to assign admin role.');
    }
  }, []);

  // No fetch-on-mount: UserProvider wraps the whole app, so this used to fire an
  // unauthenticated GET /users on the public landing page (401 -> token-refresh
  // attempt -> redirect) before anyone had logged in. AdminDashboard — the only
  // consumer — already calls fetchAllUsers() from its own effect.

  const value = useMemo(() => ({
    users,
    error,
    loading,
    fetchAllUsers,
    updateUser,
    deleteUser,
    assignAdmin,
    unsavedChanges,
    setUnsavedChanges,
  }), [users, error, loading, fetchAllUsers, updateUser, deleteUser, assignAdmin, unsavedChanges]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
