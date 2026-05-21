import axiosInstance from '../utils/axiosInstance';

export const taskService = {
  getUserTasks: async () => {
    try {
      const response = await axiosInstance.get('/tasks');
      return response.data;
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }
  },
  getAllTasks: async () => {
    try {
      const response = await axiosInstance.get('/tasks');
      return response.data;
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      throw error;
    }
  },
  createTask: async (task) => {
    try {
      const response = await axiosInstance.post('/tasks', task);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },
  updateTask: async (taskId, taskData) => {
    try {
      const response = await axiosInstance.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },
  filterTasks: async (status, priority) => {
    try {
      const params = {};
      if (status) params.status = status;
      if (priority) params.priority = priority;
      const response = await axiosInstance.get('/tasks/filter', { params });
      return response.data;
    } catch (error) {
      console.error('Error filtering tasks:', error);
      throw error;
    }
  },
  searchTasks: async (q) => {
    try {
      const response = await axiosInstance.get('/tasks/search', { params: { q } });
      return response.data;
    } catch (error) {
      console.error('Error searching tasks:', error);
      throw error;
    }
  },
  getStats: async () => {
    try {
      const response = await axiosInstance.get('/tasks/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching task stats:', error);
      throw error;
    }
  },
  deleteTask: async (id) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },
  restoreTask: async (id) => {
    try {
      const response = await axiosInstance.put(`/tasks/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error('Error restoring task:', error);
      throw error;
    }
  },
  bulkUpdate: async (ids, status, priority) => {
    try {
      const response = await axiosInstance.post('/tasks/bulk-update', { taskIds: ids, status, priority });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating tasks:', error);
      throw error;
    }
  },
  bulkDelete: async (ids) => {
    try {
      await axiosInstance.post('/tasks/bulk-delete', { taskIds: ids });
    } catch (error) {
      console.error('Error bulk deleting tasks:', error);
      throw error;
    }
  },
  exportCsv: () => {
    return axiosInstance.get('/tasks/export', { responseType: 'blob' });
  },
  getTaskActivity: async (taskId) => {
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}/activity`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  },
};
