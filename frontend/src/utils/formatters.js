import numeral from 'numeral';
import { format, parseISO } from 'date-fns';

export const USD_TO_KES = 129;

/**
 * Format number as currency (USD)
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  return numeral(amount).format('$0,0.00');
};

/**
 * Format a USD amount converted to KES
 */
export const formatKES = (amountUSD) => {
  if (amountUSD === null || amountUSD === undefined) return 'KES 0';
  return `KES ${numeral(parseFloat(amountUSD) * USD_TO_KES).format('0,0')}`;
};

/**
 * Format number as compact currency (e.g., $1.2M)
 */
export const formatCurrencyCompact = (amount) => {
  if (amount === null || amount === undefined) return '$0';
  return numeral(amount).format('$0.0a').toUpperCase();
};

/**
 * Format date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    return dateString;
  }
};

/**
 * Format datetime string
 */
export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  try {
    const date = typeof dateTimeString === 'string' ? parseISO(dateTimeString) : dateTimeString;
    return format(date, 'MMM dd, yyyy HH:mm');
  } catch (error) {
    return dateTimeString;
  }
};

/**
 * Format percentage
 */
export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Get color for payment status
 */
export const getStatusColor = (status) => {
  const colors = {
    VERIFIED: 'success',
    PENDING: 'warning',
    FAILED: 'error',
    REFUNDED: 'info',
    ACTIVE: 'success',
    INACTIVE: 'default',
    SUSPENDED: 'error',
  };
  return colors[status] || 'default';
};

/**
 * Get initials from name
 */
export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}`;
};
