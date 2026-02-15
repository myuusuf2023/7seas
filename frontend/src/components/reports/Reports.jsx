import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { investorService } from '../../services/investorService';
import { paymentService } from '../../services/paymentService';

const Reports = () => {
  const [investors, setInvestors] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedInvestor, setSelectedInvestor] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingStatement, setDownloadingStatement] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [investorsRes, paymentsRes] = await Promise.all([
        investorService.getAll(),
        paymentService.getAll(),
      ]);
      setInvestors(investorsRes.data.results || investorsRes.data);
      setPayments(paymentsRes.data.results || paymentsRes.data);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvestorStatement = async () => {
    if (!selectedInvestor) return;

    try {
      setDownloadingStatement(true);
      const investor = investors.find((inv) => inv.id === selectedInvestor);
      const token = localStorage.getItem('accessToken');

      const response = await fetch(
        `http://localhost:8000/api/reports/investor-statement/${selectedInvestor}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download statement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statement_${investor.last_name}_${investor.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading statement:', err);
      alert('Failed to download statement. Please try again.');
    } finally {
      setDownloadingStatement(false);
    }
  };

  const downloadPaymentReceipt = async () => {
    if (!selectedPayment) return;

    try {
      setDownloadingReceipt(true);
      const payment = payments.find((pmt) => pmt.id === selectedPayment);
      const token = localStorage.getItem('accessToken');

      const response = await fetch(
        `http://localhost:8000/api/reports/payment-receipt/${selectedPayment}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
      a.download = `receipt_${selectedPayment}_${payment.investor_name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading receipt:', err);
      alert('Failed to download receipt. Please try again.');
    } finally {
      setDownloadingReceipt(false);
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
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#C9A961' }}>
        Reports & Documents
      </Typography>

      <Grid container spacing={3}>
        {/* Investor Statements */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #1B2937 0%, #1B4965 100%)',
              border: '1px solid rgba(201, 169, 97, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <DescriptionIcon sx={{ fontSize: 40, color: '#C9A961', mr: 2 }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#C9A961' }}>
                  Investor Statement
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate comprehensive financial statement for an investor
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3, borderColor: 'rgba(201, 169, 97, 0.2)' }} />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ color: '#C9A961' }}>Select Investor</InputLabel>
              <Select
                value={selectedInvestor}
                onChange={(e) => setSelectedInvestor(e.target.value)}
                label="Select Investor"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(201, 169, 97, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#C9A961',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#C9A961',
                  },
                }}
              >
                {investors.map((investor) => (
                  <MenuItem key={investor.id} value={investor.id}>
                    {investor.full_name} - {investor.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              fullWidth
              startIcon={downloadingStatement ? <CircularProgress size={20} /> : <DownloadIcon />}
              onClick={downloadInvestorStatement}
              disabled={!selectedInvestor || downloadingStatement}
              sx={{
                backgroundColor: '#C9A961',
                '&:hover': { backgroundColor: '#B89851' },
                '&:disabled': { backgroundColor: 'rgba(201, 169, 97, 0.3)' },
              }}
            >
              {downloadingStatement ? 'Generating...' : 'Download Statement'}
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Statement includes: investor details, share amount, total paid, outstanding balance,
              payment history, and completion percentage.
            </Typography>
          </Paper>
        </Grid>

        {/* Payment Receipts */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #1B2937 0%, #1B4965 100%)',
              border: '1px solid rgba(201, 169, 97, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <ReceiptIcon sx={{ fontSize: 40, color: '#C9A961', mr: 2 }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#C9A961' }}>
                  Payment Receipt
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate official receipt for a specific payment
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3, borderColor: 'rgba(201, 169, 97, 0.2)' }} />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ color: '#C9A961' }}>Select Payment</InputLabel>
              <Select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
                label="Select Payment"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(201, 169, 97, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#C9A961',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#C9A961',
                  },
                }}
              >
                {payments.map((payment) => (
                  <MenuItem key={payment.id} value={payment.id}>
                    #{payment.id} - {payment.investor_name} - ${payment.amount} -{' '}
                    {payment.payment_type_display}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              fullWidth
              startIcon={downloadingReceipt ? <CircularProgress size={20} /> : <DownloadIcon />}
              onClick={downloadPaymentReceipt}
              disabled={!selectedPayment || downloadingReceipt}
              sx={{
                backgroundColor: '#C9A961',
                '&:hover': { backgroundColor: '#B89851' },
                '&:disabled': { backgroundColor: 'rgba(201, 169, 97, 0.3)' },
              }}
            >
              {downloadingReceipt ? 'Generating...' : 'Download Receipt'}
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Receipt includes: payment details, investor information, amount paid, payment method,
              reference number, and investment summary.
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #1B2937 0%, #1B4965 100%)',
              border: '1px solid rgba(201, 169, 97, 0.2)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#C9A961' }}>
              Report Statistics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#C9A961' }}>
                    {investors.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Investors
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#C9A961' }}>
                    {payments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Payments
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ color: '#C9A961' }}>
                    {payments.filter((p) => p.payment_status === 'VERIFIED').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verified Payments
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
