import api from './api';

const normalizeAuthResponse = (payload) => ({
  ...payload,
  success: payload?.success ?? Boolean(payload?.token),
});

export const authService = {
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      const payload = normalizeAuthResponse(response.data);
      console.log('Register response:', payload);

      if (payload.success && payload.token) {
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(payload.user));
      }
      return payload;
    } catch (error) {
      console.error('Register service error:', error);
      throw error;
    }
  },

  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      const payload = normalizeAuthResponse(response.data);
      console.log('Login response:', payload);

      if (payload.success && payload.token) {
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(payload.user));
      }
      return payload;
    } catch (error) {
      console.error('Login service error:', error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  async updatePreferences(preferences) {
    try {
      const response = await api.put('/auth/preferences', preferences);
      if (response.data.preferences) {
        const user = this.getCurrentUser();
        if (user) {
          user.preferences = response.data.preferences;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
      return response.data;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }
};