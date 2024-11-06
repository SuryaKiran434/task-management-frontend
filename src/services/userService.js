import axiosInstance from '../utils/axiosInstance';
import jwtDecode from 'jwt-decode';

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

  assignAdmin: async (userId) => {
    try {
      await axiosInstance.post(`/users/${userId}/assign-admin`);
    } catch (error) {
      console.error('Error assigning admin role:', error);
      throw new Error('Failed to assign admin role.');
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
  }
};

export default userService;