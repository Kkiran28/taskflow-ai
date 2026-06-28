import api from './api';

export const boardService = {
  async getBoards() {
    const response = await api.get('/boards');
    return response.data;
  },

  async createBoard(boardData) {
    const response = await api.post('/boards', boardData);
    return response.data;
  },

  async updateBoard(id, boardData) {
    const response = await api.put(`/boards/${id}`, boardData);
    return response.data;
  },

  async deleteBoard(id) {
    const response = await api.delete(`/boards/${id}`);
    return response.data;
  }
};