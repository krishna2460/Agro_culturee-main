import { createContext, useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

export const AuthContext = createContext();

const API_URL = '/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get(`${API_URL}/profile`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      delete api.defaults.headers.common.Authorization;
      setUser(null);
      setLoading(false);
    }
  }, [token, fetchUserProfile]);

  const login = async (username, password, role) => {
    try {
      const response = await api.post(`${API_URL}/login`, { username, password, role });
      const { token: userToken, ...userData } = response.data;
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post(`${API_URL}/register`, userData);
      const { token: userToken, ...newUser } = response.data;
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(newUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put(`${API_URL}/profile`, profileData);
      const { token: userToken, ...updatedUser } = response.data;
      if (userToken) {
        localStorage.setItem('token', userToken);
        setToken(userToken);
      }
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
