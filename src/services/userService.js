import axiosInstance from '../utils/axiosInstance';

const userService = {
  registerUser: async (userData) => {
    try {
      const response = await axiosInstance.post('/users/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw new Error('Error registering user.');
    }
  },

  adminCreateUser: async (payload) => {
    const response = await axiosInstance.post('/users', payload);
    return response.data;
  },

  assignAdmin: async (userId) => {
    try {
      const response = await axiosInstance.post(`/users/${userId}/assign-admin`);
      return response.data;
    } catch (error) {
      console.error('Error assigning admin role:', error);
      throw new Error('Failed to assign admin role.');
    }
  },

  removeAdmin: async (userId) => {
    try {
      const response = await axiosInstance.post(`/users/${userId}/remove-admin`);
      return response.data;
    } catch (error) {
      console.error('Error removing admin role:', error);
      throw new Error('Failed to remove admin role.');
    }
  },

  getUserTasksById: async (userId) => {
    try {
      const response = await axiosInstance.get(`/tasks/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw new Error('Failed to fetch user tasks.');
    }
  },

  deleteUser: async (userId) => {
    try {
      await axiosInstance.delete(`/users/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user.');
    }
  },

  getUserInfo: async (userId) => {
    try {
      console.log('Requesting user info for ID:', userId);
      const response = await axiosInstance.get(`/users/${userId}`);
      console.log('getUserInfo response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error.response || error);
      throw new Error('Error fetching user info.');
    }
  },

  updateUserInfo: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/users/${id}`, data);
      if (response.status !== 200) {
        throw new Error('Failed to update user information');
      }
      return response.data;
    } catch (error) {
      console.error('Error updating user info:', error.response || error);
      throw new Error('Failed to update user information');
    }
  },

  getMe: async () => {
    try {
      const response = await axiosInstance.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw new Error('Error fetching current user.');
    }
  },

  // Reset password using email, OTP token, and new password
  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post(`/users/forgot-password?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw new Error(error.response?.data || 'Error requesting password reset');
    }
  },

  resetPassword: async (email, token, newPassword) => {
    try {
      const response = await axiosInstance.post(
        `/users/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(newPassword)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new Error(error.response?.data || 'Error resetting password');
    }
  }
  };

export default userService;
