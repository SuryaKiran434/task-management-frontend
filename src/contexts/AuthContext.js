import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
          console.log('User loaded from localStorage:', parsedUser);
        } else {
          await checkAuth();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const checkAuth = async () => {
    const token = authService.getToken();
    if (token) {
      console.log('Checking authentication for token:', token);
      if (authService.isTokenExpired(token)) {
        try {
          await refreshAuthToken();
        } catch (error) {
          console.error('Error refreshing token:', error);
          setIsAuthenticated(false);
          authService.logout();
        }
      } else {
        await fetchUserInfo(token);
      }
    } else {
      console.log('No token found');
      setLoading(false);
    }
  };

  const fetchUserInfo = async (token) => {
    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;  // Extract userId from the token
      const roles = decodedToken.roles;

      const userData = {
        id: userId,               // Numeric user ID
        email: decodedToken.sub,   // Email from the `sub` claim
        roles: roles,
        token: token,
        refreshToken: authService.getRefreshToken()
      };

      setCurrentUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      console.log('User authenticated with token:', { userId, roles });
    } catch (error) {
      console.error('Error fetching user info:', error);
      setIsAuthenticated(false);
      authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const refreshAuthToken = async () => {
    try {
      const newToken = await authService.refreshToken();
      if (newToken) {
        await fetchUserInfo(newToken);
      } else {
        setIsAuthenticated(false);
        authService.logout();
      }
    } catch (error) {
      console.error('Error refreshing auth token:', error);
      setIsAuthenticated(false);
      authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const user = await authService.login(email, password);
      const token = user.token;
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId; // Numeric user ID
      const roles = decodedToken.roles;

      const userData = {
        id: userId,
        email: decodedToken.sub, // Store email as well
        roles: roles,
        token: token,
        refreshToken: user.refreshToken
      };

      setCurrentUser(userData);  // Ensure token is set here
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userData));  // Store token and user data
      console.log('User logged in:', { userId, roles });
      return user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsAuthenticated(false);
    console.log('User logged out');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login, logout, refreshAuthToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
