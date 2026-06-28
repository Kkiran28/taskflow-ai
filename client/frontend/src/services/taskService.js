import api from './api';

export const taskService = {
  async getTasksByBoard(boardId) {
    const response = await api.get(`/tasks/board/${boardId}`);
    return response.data;
  },

  async createTask(taskData) {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  async updateTask(id, taskData) {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  async getAISuggestion(title, description) {
    const response = await api.post('/tasks/suggest', { title, description });
    return response.data;
  }
};