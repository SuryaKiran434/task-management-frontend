import axiosInstance from '../utils/axiosInstance';
import { jwtDecode } from 'jwt-decode';

const authService = {
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/authenticate', { email, password });
      const { token, refreshToken } = response.data;

      if (token && refreshToken) {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);

        const decodedToken = jwtDecode(token);
        return {
          id: decodedToken.id,
          roles: decodedToken.roles || [],
          token,
          refreshToken,
        };
      } else {
        throw new Error('Token or refresh token not found in response.');
      }
    } catch (error) {
      console.error("Login error:", error.response ? error.response.data : error.message);
      throw new Error(error.response ? error.response.data.message : 'An unexpected error occurred. Please try again.');
    }
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.error('No refresh token available.');
      authService.logout();
      window.location.href = '/login';
      throw new Error('No refresh token available.');
    }
    try {
      const response = await axiosInstance.post('/refresh-token', { refreshToken });
      const newToken = response.data.token;
      if (newToken) {
        localStorage.setItem('token', newToken);
        return newToken;
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
      throw new Error('Failed to refresh token.');
    }
    throw new Error('Failed to refresh token.');
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  getToken: () => localStorage.getItem('token'),

  isTokenExpired: (token) => {
    const { exp } = jwtDecode(token);
    return Date.now() >= exp * 1000;
  },

  getUserIdFromToken: (token) => {
    const decodedToken = jwtDecode(token);
    return decodedToken.id;
  },

  getUserRolesFromToken: (token) => {
    const decodedToken = jwtDecode(token);
    return decodedToken.roles || [];
  }
};

export default authService;
