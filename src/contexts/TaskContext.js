// src/contexts/TaskContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { useToast } from './ToastContext';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const toast = useToast();

  const fetchTasks = useCallback(async (isAdmin = false, userId = null, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const fetchedTasks = isAdmin
          ? await taskService.getAllTasks()
          : await taskService.getUserTasks(userId);
        setTasks(fetchedTasks);
        setError('');
        return;
      } catch (err) {
        if (i === retries - 1) {
          setError('Failed to load tasks.');
          toast.error('Failed to load tasks.');
        }
      }
    }
  }, [toast]);

  const fetchUserTasks = useCallback(async (userId) => {
    await fetchTasks(false, userId);
  }, [fetchTasks]);

  const createTask = async (taskData) => {
    try {
      const newTask = await taskService.createTask(taskData);
      setTasks((prev) => [...prev, newTask]);
      setUnsavedChanges(false);
      return newTask;
    } catch (err) {
      setError('Failed to create task.');
      toast.error('Failed to create task.');
      throw err;
    }
  };

  const updateTask = async (taskId, updatedData) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, updatedData);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)));
      setUnsavedChanges(false);
      return updatedTask;
    } catch (err) {
      setError('Failed to update task.');
      toast.error('Failed to update task.');
      throw err;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setUnsavedChanges(false);
    } catch (err) {
      setError('Failed to delete task.');
      toast.error('Failed to delete task.');
      throw err;
    }
  };

  const filterTasks = useCallback(async (status, priority) => {
    try {
      const filtered = await taskService.filterTasks(status, priority);
      setTasks(filtered);
      setError('');
    } catch (err) {
      setError('Failed to filter tasks.');
      toast.error('Failed to filter tasks.');
    }
  }, [toast]);

  const searchTasks = useCallback(async (q) => {
    try {
      const results = await taskService.searchTasks(q);
      setTasks(results);
      setError('');
    } catch (err) {
      setError('Failed to search tasks.');
      toast.error('Failed to search tasks.');
    }
  }, [toast]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (unsavedChanges) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  return (
    <TaskContext.Provider value={{
      tasks,
      fetchTasks,
      fetchUserTasks,
      createTask,
      updateTask,
      deleteTask,
      filterTasks,
      searchTasks,
      error,
      setUnsavedChanges,
    }}>
      {children}
    </TaskContext.Provider>
  );
};