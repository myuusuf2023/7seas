import api from './api';

export const dashboardService = {
  /**
   * Get dashboard overview with KPIs
   */
  getOverview: () => {
    return api.get('/dashboard/overview/');
  },

  /**
   * Get collections timeline data for charts
   * @param {string} period - 'monthly', 'weekly', or 'quarterly'
   */
  getCollectionsTimeline: (period = 'monthly') => {
    return api.get('/dashboard/collections-timeline/', {
      params: { period },
    });
  },

  /**
   * Get payment status distribution for pie chart
   */
  getPaymentStatus: () => {
    return api.get('/dashboard/payment-status/');
  },

  /**
   * Get list of investors with overdue payments
   */
  getOverdueInvestors: () => {
    return api.get('/dashboard/overdue-investors/');
  },

  /**
   * Get recent payment activity
   */
  getRecentActivity: () => {
    return api.get('/dashboard/recent-activity/');
  },

  /**
   * Get top investors
   * @param {string} by - 'share_amount' or 'total_paid'
   */
  getTopInvestors: (by = 'share_amount') => {
    return api.get('/dashboard/top-investors/', {
      params: { by },
    });
  },
};

export default dashboardService;
