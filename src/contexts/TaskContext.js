// src/contexts/TaskContext.js
import React, { createContext, useState, useEffect } from 'react';
import { taskService } from '../services/taskService';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // General function to fetch tasks based on user role with retry logic
  const fetchTasks = async (isAdmin = false, userId = null, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Fetching tasks (Attempt ${i + 1})...`);
        const fetchedTasks = isAdmin
          ? await taskService.getAllTasks()
          : await taskService.getUserTasks(userId);

        setTasks(fetchedTasks);
        setError('');
        console.log('Tasks fetched successfully.');
        return; // Exit if fetch is successful
      } catch (err) {
        if (i === retries - 1) {
          setError('Failed to load tasks.');
          console.error('Max retries reached. Could not fetch tasks:', err);
        }
      }
    }
  };

  // Wrapper function to fetch tasks for a specific user
  const fetchUserTasks = async (userId) => {
    // Only fetch if tasks are not already loaded to prevent redundant calls
    if (tasks.length === 0) {
      await fetchTasks(false, userId);
    }
  };

  const createTask = async (taskData) => {
    try {
      const newTask = await taskService.createTask(taskData);
      setTasks([...tasks, newTask]);
      setUnsavedChanges(false);
    } catch (err) {
      setError('Failed to create task.');
      console.error(err);
    }
  };

  const updateTask = async (taskId, updatedData) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, updatedData);
      setTasks(tasks.map(task => (task.id === taskId ? updatedTask : task)));
      setUnsavedChanges(false);
    } catch (err) {
      setError('Failed to update task.');
      console.error(err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      setUnsavedChanges(false);
    } catch (err) {
      setError('Failed to delete task.');
      console.error(err);
    }
  };

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
      error,
      setUnsavedChanges,
    }}>
      {children}
    </TaskContext.Provider>
  );
};
