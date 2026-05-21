import axiosInstance from '../utils/axiosInstance';

const activityService = {
  getTaskActivity: (taskId) => axiosInstance.get(`/tasks/${taskId}/activity`).then(r => r.data),
};

export default activityService;
