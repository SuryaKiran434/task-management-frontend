import axiosInstance from '../utils/axiosInstance';

const subtaskService = {
  getSubtasks: (taskId) => axiosInstance.get(`/tasks/${taskId}/subtasks`).then(r => r.data),
  createSubtask: (taskId, dto) => axiosInstance.post(`/tasks/${taskId}/subtasks`, dto).then(r => r.data),
  updateSubtask: (taskId, subtaskId, dto) => axiosInstance.put(`/tasks/${taskId}/subtasks/${subtaskId}`, dto).then(r => r.data),
  deleteSubtask: (taskId, subtaskId) => axiosInstance.delete(`/tasks/${taskId}/subtasks/${subtaskId}`),
  toggleSubtask: (taskId, subtaskId) => axiosInstance.put(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`).then(r => r.data),
};

export default subtaskService;
