import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      console.log('Login response in context:', response);

      if (response?.success || response?.token) {
        setUser(response.user || authService.getCurrentUser());
        setIsAuthenticated(true);
        return response;
      }

      throw new Error(response?.message || 'Login failed');
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response?.success || response?.token) {
        setUser(response.user || authService.getCurrentUser());
        setIsAuthenticated(true);
        return response;
      }

      throw new Error(response?.message || 'Registration failed');
    } catch (error) {
      console.error('Register error in context:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
