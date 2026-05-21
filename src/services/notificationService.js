import axiosInstance from '../utils/axiosInstance';

const notificationService = {
  getAll: () => axiosInstance.get('/notifications').then(r => r.data),
  getUnread: () => axiosInstance.get('/notifications/unread').then(r => r.data),
  getUnreadCount: () => axiosInstance.get('/notifications/count').then(r => r.data.count),
  markRead: (id) => axiosInstance.put(`/notifications/${id}/read`),
  markAllRead: () => axiosInstance.put('/notifications/read-all'),
};

export default notificationService;
