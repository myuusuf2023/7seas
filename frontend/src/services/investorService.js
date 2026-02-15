import api from './api';

export const investorService = {
  /**
   * Get all investors with optional filters and pagination
   */
  getAll: (params = {}) => {
    return api.get('/investors/', { params });
  },

  /**
   * Get single investor by ID
   */
  getById: (id) => {
    return api.get(`/investors/${id}/`);
  },

  /**
   * Create new investor
   */
  create: (data) => {
    return api.post('/investors/', data);
  },

  /**
   * Update investor
   */
  update: (id, data) => {
    return api.put(`/investors/${id}/`, data);
  },

  /**
   * Partial update investor
   */
  partialUpdate: (id, data) => {
    return api.patch(`/investors/${id}/`, data);
  },

  /**
   * Delete investor (soft delete - sets to INACTIVE)
   */
  delete: (id) => {
    return api.delete(`/investors/${id}/`);
  },

  /**
   * Get financial summary for investor
   */
  getSummary: (id) => {
    return api.get(`/investors/${id}/summary/`);
  },

  /**
   * Get all payments for investor
   */
  getPayments: (id, params = {}) => {
    return api.get(`/investors/${id}/payments/`, { params });
  },
};

export default investorService;
