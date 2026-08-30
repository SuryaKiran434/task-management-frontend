// src/contexts/TaskContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { taskService } from '../services/taskService';
import { useToast } from './ToastContext';

/**
 * The task state is split into two contexts so that a change in one does not
 * re-render consumers of the other:
 *
 *  - `TaskDataContext`    — slowly-changing server data ({ tasks, error }).
 *                           New identity only when tasks/error actually change.
 *  - `TaskActionsContext` — the mutators. Every function is `useCallback`-stable,
 *                           so this value is created once and NEVER changes.
 *                           A component that only dispatches (CreateTask,
 *                           AdminDashboard, ManageUserTasks) therefore never
 *                           re-renders because someone else loaded tasks.
 *
 * `TaskContext` is kept as the original combined context so existing
 * `useContext(TaskContext)` call sites keep working unchanged.
 */
export const TaskDataContext = createContext({ tasks: [], error: '' });
export const TaskActionsContext = createContext(null);
export const TaskContext = createContext();

export const useTaskData = () => useContext(TaskDataContext);
export const useTaskActions = () => useContext(TaskActionsContext);

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

  const createTask = useCallback(async (taskData) => {
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
  }, [toast]);

  const updateTask = useCallback(async (taskId, updatedData) => {
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
  }, [toast]);

  const deleteTask = useCallback(async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setUnsavedChanges(false);
    } catch (err) {
      setError('Failed to delete task.');
      toast.error('Failed to delete task.');
      throw err;
    }
  }, [toast]);

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
    if (!unsavedChanges) return undefined;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  const actions = useMemo(() => ({
    fetchTasks,
    fetchUserTasks,
    createTask,
    updateTask,
    deleteTask,
    filterTasks,
    searchTasks,
    setUnsavedChanges,
  }), [fetchTasks, fetchUserTasks, createTask, updateTask, deleteTask, filterTasks, searchTasks]);

  const data = useMemo(() => ({ tasks, error }), [tasks, error]);

  // Back-compat value for existing `useContext(TaskContext)` call sites.
  const combined = useMemo(() => ({ ...data, ...actions }), [data, actions]);

  return (
    <TaskActionsContext.Provider value={actions}>
      <TaskDataContext.Provider value={data}>
        <TaskContext.Provider value={combined}>
          {children}
        </TaskContext.Provider>
      </TaskDataContext.Provider>
    </TaskActionsContext.Provider>
  );
};
