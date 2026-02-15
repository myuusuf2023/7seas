import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { paymentService } from '../../services/paymentService';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatters';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentService.getAll();
      setPayments(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (paymentId, investorName) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:8000/api/reports/payment-receipt/${paymentId}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${paymentId}_${investorName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading receipt:', err);
      alert('Failed to download receipt. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#C9A961' }}>
          Payments
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchPayments}
          sx={{ borderColor: '#C9A961', color: '#C9A961' }}
        >
          Refresh
        </Button>
      </Box>

      <Paper
        sx={{
          background: 'linear-gradient(135deg, #1B2937 0%, #1B4965 100%)',
          border: '1px solid rgba(201, 169, 97, 0.2)',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(27, 73, 101, 0.5)' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }}>Investor</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }}>Payment Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }} align="right">Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }}>Payment Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }}>Reference</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }} align="center">Receipt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    sx={{
                      '&:hover': { backgroundColor: 'rgba(201, 169, 97, 0.05)' },
                    }}
                  >
                    <TableCell>#{payment.id}</TableCell>
                    <TableCell>{payment.investor_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={payment.payment_type_display}
                        size="small"
                        sx={{ backgroundColor: 'rgba(201, 169, 97, 0.2)' }}
                      />
                    </TableCell>
                    <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell>
                      <Chip
                        label={payment.payment_status_display}
                        color={getStatusColor(payment.payment_status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{payment.reference_number || '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Download Receipt">
                        <IconButton
                          onClick={() => downloadReceipt(payment.id, payment.investor_name)}
                          sx={{ color: '#C9A961' }}
                          size="small"
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Total Payments: {payments.length}
      </Typography>
    </Box>
  );
};

export default PaymentList;
