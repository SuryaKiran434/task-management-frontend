import axiosInstance from '../utils/axiosInstance';

const labelService = {
  getLabels: () => axiosInstance.get('/labels').then(r => r.data),
  createLabel: (dto) => axiosInstance.post('/labels', dto).then(r => r.data),
  updateLabel: (id, dto) => axiosInstance.put(`/labels/${id}`, dto).then(r => r.data),
  deleteLabel: (id) => axiosInstance.delete(`/labels/${id}`),
  addToTask: (taskId, labelId) => axiosInstance.post(`/labels/tasks/${taskId}/add/${labelId}`).then(r => r.data),
  removeFromTask: (taskId, labelId) => axiosInstance.delete(`/labels/tasks/${taskId}/remove/${labelId}`).then(r => r.data),
};

export default labelService;
