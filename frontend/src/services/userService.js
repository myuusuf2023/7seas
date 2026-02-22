import api from './api';

export const userService = {
  getAll: () => api.get('/auth/users/'),
  getById: (id) => api.get(`/auth/users/${id}/`),
  create: (data) => api.post('/auth/users/', data),
  update: (id, data) => api.patch(`/auth/users/${id}/`, data),
  delete: (id) => api.delete(`/auth/users/${id}/`),
};
