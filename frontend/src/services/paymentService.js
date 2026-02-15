import api from './api';

export const paymentService = {
  /**
   * Get all payments with optional filters
   */
  getAll: (params = {}) => {
    return api.get('/payments/', { params });
  },

  /**
   * Get single payment by ID
   */
  getById: (id) => {
    return api.get(`/payments/${id}/`);
  },

  /**
   * Create new payment
   */
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/payments/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Update payment
   */
  update: (id, data) => {
    return api.put(`/payments/${id}/`, data);
  },

  /**
   * Partial update payment
   */
  partialUpdate: (id, data) => {
    return api.patch(`/payments/${id}/`, data);
  },

  /**
   * Delete payment
   */
  delete: (id) => {
    return api.delete(`/payments/${id}/`);
  },

  /**
   * Verify payment
   */
  verify: (id, notes = '') => {
    return api.post(`/payments/${id}/verify/`, { notes });
  },

  /**
   * Mark payment as failed
   */
  fail: (id, reason = '') => {
    return api.post(`/payments/${id}/fail/`, { reason });
  },

  /**
   * Get all overdue payments
   */
  getOverdue: () => {
    return api.get('/payments/overdue/');
  },
};

export default paymentService;
