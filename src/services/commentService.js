import axiosInstance from '../utils/axiosInstance';

const commentService = {
  getComments: (taskId) => axiosInstance.get(`/tasks/${taskId}/comments`).then(r => r.data),
  addComment: (taskId, content) => axiosInstance.post(`/tasks/${taskId}/comments`, { content }).then(r => r.data),
  updateComment: (taskId, commentId, content) => axiosInstance.put(`/tasks/${taskId}/comments/${commentId}`, { content }).then(r => r.data),
  deleteComment: (taskId, commentId) => axiosInstance.delete(`/tasks/${taskId}/comments/${commentId}`),
};

export default commentService;
