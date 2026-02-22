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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  MenuItem,
  Grid,
  TextField,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  CheckCircle as VerifyIcon,
  Cancel as FailIcon,
} from '@mui/icons-material';
import { paymentService } from '../../services/paymentService';
import { investorService } from '../../services/investorService';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';

const PaymentList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify dialog state
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [paymentToVerify, setPaymentToVerify] = useState(null);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Fail dialog state
  const [failDialogOpen, setFailDialogOpen] = useState(false);
  const [paymentToFail, setPaymentToFail] = useState(null);
  const [failReason, setFailReason] = useState('');
  const [failing, setFailing] = useState(false);

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({});
  const [creating, setCreating] = useState(false);
  const [createErrors, setCreateErrors] = useState({});
  const [investors, setInvestors] = useState([]);
  const [loadingInvestors, setLoadingInvestors] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

  // --- Verify Handlers ---
  const handleVerifyClick = (payment) => {
    setPaymentToVerify(payment);
    setVerifyNotes('');
    setVerifyDialogOpen(true);
  };

  const handleVerifyConfirm = async () => {
    setVerifying(true);
    try {
      await paymentService.verify(paymentToVerify.id, verifyNotes);
      setVerifyDialogOpen(false);
      setSnackbar({ open: true, message: `Payment #${paymentToVerify.id} verified successfully.`, severity: 'success' });
      fetchPayments();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to verify payment.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setVerifying(false);
    }
  };

  // --- Fail Handlers ---
  const handleFailClick = (payment) => {
    setPaymentToFail(payment);
    setFailReason('');
    setFailDialogOpen(true);
  };

  const handleFailConfirm = async () => {
    setFailing(true);
    try {
      await paymentService.fail(paymentToFail.id, failReason);
      setFailDialogOpen(false);
      setSnackbar({ open: true, message: `Payment #${paymentToFail.id} marked as failed.`, severity: 'warning' });
      fetchPayments();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update payment.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setFailing(false);
    }
  };

  // --- Create Handlers ---
  const handleCreateClick = async () => {
    setCreateFormData({
      investor: '',
      payment_type: 'ENTRY_FEE',
      amount: '',
      currency: 'USD',
      payment_method: 'BANK_TRANSFER',
      payment_date: new Date().toISOString().split('T')[0],
      due_date: '',
      reference_number: '',
      quarter: '',
      notes: '',
      receipt_document: null,
    });
    setCreateErrors({});
    setCreateDialogOpen(true);

    // Fetch investors for the dropdown
    try {
      setLoadingInvestors(true);
      const response = await investorService.getAll();
      setInvestors(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching investors:', err);
    } finally {
      setLoadingInvestors(false);
    }
  };

  const handleCreateFormChange = (field) => (e) => {
    setCreateFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (createErrors[field]) {
      setCreateErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    setCreateFormData((prev) => ({ ...prev, receipt_document: file }));
  };

  const handleCreateSave = async () => {
    try {
      setCreating(true);
      setCreateErrors({});

      const dataToSend = { ...createFormData };
      // Remove empty optional fields
      if (!dataToSend.due_date) delete dataToSend.due_date;
      if (!dataToSend.reference_number) delete dataToSend.reference_number;
      if (!dataToSend.quarter) delete dataToSend.quarter;
      if (!dataToSend.notes) delete dataToSend.notes;
      if (!dataToSend.receipt_document) delete dataToSend.receipt_document;

      await paymentService.create(dataToSend);
      setSnackbar({ open: true, message: 'Payment has been recorded successfully.', severity: 'success' });
      setCreateDialogOpen(false);
      fetchPayments();
    } catch (err) {
      console.error('Error creating payment:', err);
      if (err.response?.data) {
        const serverErrors = err.response.data;
        const formattedErrors = {};
        Object.keys(serverErrors).forEach((key) => {
          formattedErrors[key] = Array.isArray(serverErrors[key])
            ? serverErrors[key].join(' ')
            : serverErrors[key];
        });
        setCreateErrors(formattedErrors);
      } else {
        setSnackbar({ open: true, message: 'Failed to create payment. Please try again.', severity: 'error' });
      }
    } finally {
      setCreating(false);
    }
  };

  const handleCreateCancel = () => {
    setCreateDialogOpen(false);
    setCreateErrors({});
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'rgba(201, 169, 97, 0.3)' },
      '&:hover fieldset': { borderColor: '#C9A961' },
      '&.Mui-focused fieldset': { borderColor: '#C9A961' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#C9A961' },
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPayments}
            sx={{ borderColor: '#C9A961', color: '#C9A961' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
            sx={{
              backgroundColor: '#C9A961',
              '&:hover': { backgroundColor: '#B89851' },
            }}
          >
            Add Payment
          </Button>
        </Box>
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
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }} align="right">Amount (USD / KES)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }}>Payment Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }}>Reference</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }} align="center">Receipt</TableCell>
                {isAdmin && (
                  <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }} align="center">Verification</TableCell>
                )}
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
                    <TableCell align="right">
                      {payment.currency === 'KES' ? (
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Chip label="KES" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'rgba(201,169,97,0.2)', color: '#C9A961', fontWeight: 700 }} />
                            <Typography variant="body2">KES {Number(payment.amount).toLocaleString()}</Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            ≈ {formatCurrency(payment.amount_usd)}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Chip label="USD" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'rgba(100,181,246,0.15)', color: '#64B5F6', fontWeight: 700 }} />
                            <Typography variant="body2">{formatCurrency(payment.amount)}</Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: '#C9A961', fontWeight: 600 }}>
                            KES {Number(payment.amount_kes).toLocaleString()}
                          </Typography>
                        </>
                      )}
                    </TableCell>
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
                    {isAdmin && (
                      <TableCell align="center">
                        {payment.payment_status === 'PENDING' && (
                          <>
                            <Tooltip title="Verify Payment">
                              <IconButton
                                size="small"
                                onClick={() => handleVerifyClick(payment)}
                                sx={{ color: '#4CAF50', '&:hover': { backgroundColor: 'rgba(76,175,80,0.1)' } }}
                              >
                                <VerifyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Mark as Failed">
                              <IconButton
                                size="small"
                                onClick={() => handleFailClick(payment)}
                                sx={{ color: '#F44336', '&:hover': { backgroundColor: 'rgba(244,67,54,0.1)' } }}
                              >
                                <FailIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {payment.payment_status === 'VERIFIED' && (
                          <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                            Verified
                          </Typography>
                        )}
                        {payment.payment_status === 'FAILED' && (
                          <Typography variant="caption" sx={{ color: '#F44336', fontWeight: 600 }}>
                            Failed
                          </Typography>
                        )}
                        {payment.payment_status === 'REFUNDED' && (
                          <Typography variant="caption" sx={{ color: '#90CAF9', fontWeight: 600 }}>
                            Refunded
                          </Typography>
                        )}
                      </TableCell>
                    )}
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

      {/* Create Payment Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCreateCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1B2937 0%, #1B4965 100%)',
            border: '1px solid rgba(201, 169, 97, 0.3)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#C9A961' }}>Add Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Investor"
                fullWidth
                required
                select
                value={createFormData.investor || ''}
                onChange={handleCreateFormChange('investor')}
                error={!!createErrors.investor}
                helperText={createErrors.investor}
                disabled={loadingInvestors}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              >
                {loadingInvestors ? (
                  <MenuItem disabled>Loading investors...</MenuItem>
                ) : (
                  investors.map((inv) => (
                    <MenuItem key={inv.id} value={inv.id}>
                      {inv.full_name} ({inv.email})
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Payment Type"
                fullWidth
                required
                select
                value={createFormData.payment_type || 'ENTRY_FEE'}
                onChange={handleCreateFormChange('payment_type')}
                error={!!createErrors.payment_type}
                helperText={createErrors.payment_type}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              >
                <MenuItem value="ENTRY_FEE">Entry Fee</MenuItem>
                <MenuItem value="QUARTERLY">Quarterly Payment</MenuItem>
                <MenuItem value="SHARE_PURCHASE">Share Purchase</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Currency"
                fullWidth
                required
                select
                value={createFormData.currency || 'USD'}
                onChange={handleCreateFormChange('currency')}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="KES">KES</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField
                label={createFormData.currency === 'KES' ? 'Amount (KES)' : 'Amount (USD)'}
                fullWidth
                required
                type="number"
                value={createFormData.amount || ''}
                onChange={handleCreateFormChange('amount')}
                error={!!createErrors.amount}
                helperText={
                  createErrors.amount ||
                  (createFormData.amount && createFormData.currency === 'KES'
                    ? `≈ $${(parseFloat(createFormData.amount) / 129).toFixed(2)} USD`
                    : createFormData.amount && createFormData.currency === 'USD'
                    ? `≈ KES ${(parseFloat(createFormData.amount) * 129).toLocaleString()}`
                    : '')
                }
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Payment Method"
                fullWidth
                required
                select
                value={createFormData.payment_method || 'BANK_TRANSFER'}
                onChange={handleCreateFormChange('payment_method')}
                error={!!createErrors.payment_method}
                helperText={createErrors.payment_method}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              >
                <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                <MenuItem value="WIRE">Wire Transfer</MenuItem>
                <MenuItem value="CHECK">Check</MenuItem>
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Payment Date"
                fullWidth
                required
                type="date"
                value={createFormData.payment_date || ''}
                onChange={handleCreateFormChange('payment_date')}
                error={!!createErrors.payment_date}
                helperText={createErrors.payment_date}
                sx={inputSx}
                InputLabelProps={{ shrink: true, sx: { color: 'rgba(255,255,255,0.7)' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Due Date"
                fullWidth
                type="date"
                value={createFormData.due_date || ''}
                onChange={handleCreateFormChange('due_date')}
                error={!!createErrors.due_date}
                helperText={createErrors.due_date}
                sx={inputSx}
                InputLabelProps={{ shrink: true, sx: { color: 'rgba(255,255,255,0.7)' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Reference Number"
                fullWidth
                value={createFormData.reference_number || ''}
                onChange={handleCreateFormChange('reference_number')}
                error={!!createErrors.reference_number}
                helperText={createErrors.reference_number}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Quarter"
                fullWidth
                placeholder="e.g. Q1 2025"
                value={createFormData.quarter || ''}
                onChange={handleCreateFormChange('quarter')}
                error={!!createErrors.quarter}
                helperText={createErrors.quarter}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Receipt Document"
                fullWidth
                type="file"
                onChange={handleFileChange}
                error={!!createErrors.receipt_document}
                helperText={createErrors.receipt_document}
                sx={inputSx}
                InputLabelProps={{ shrink: true, sx: { color: 'rgba(255,255,255,0.7)' } }}
                inputProps={{ accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={2}
                value={createFormData.notes || ''}
                onChange={handleCreateFormChange('notes')}
                error={!!createErrors.notes}
                helperText={createErrors.notes}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              />
            </Grid>
          </Grid>
          {createErrors.non_field_errors && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {createErrors.non_field_errors}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateCancel} sx={{ color: '#C9A961' }} disabled={creating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateSave}
            variant="contained"
            disabled={creating}
            sx={{ backgroundColor: '#C9A961', '&:hover': { backgroundColor: '#B89851' } }}
          >
            {creating ? 'Adding...' : 'Add Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Verify Payment Dialog */}
      <Dialog
        open={verifyDialogOpen}
        onClose={() => setVerifyDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1B2937 0%, #1B4965 100%)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#4CAF50', display: 'flex', alignItems: 'center', gap: 1 }}>
          <VerifyIcon /> Verify Payment
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
            Confirm verification of{' '}
            <strong style={{ color: 'white' }}>Payment #{paymentToVerify?.id}</strong> from{' '}
            <strong style={{ color: 'white' }}>{paymentToVerify?.investor_name}</strong>.
          </Typography>
          <TextField
            label="Verification Notes (optional)"
            fullWidth
            multiline
            rows={2}
            value={verifyNotes}
            onChange={(e) => setVerifyNotes(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(76,175,80,0.4)' },
                '&:hover fieldset': { borderColor: '#4CAF50' },
                '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#4CAF50' },
            }}
            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setVerifyDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)' }} disabled={verifying}>
            Cancel
          </Button>
          <Button
            onClick={handleVerifyConfirm}
            variant="contained"
            disabled={verifying}
            startIcon={verifying ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <VerifyIcon />}
            sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#388E3C' } }}
          >
            {verifying ? 'Verifying...' : 'Confirm Verify'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark as Failed Dialog */}
      <Dialog
        open={failDialogOpen}
        onClose={() => setFailDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1B2937 0%, #1B4965 100%)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#F44336', display: 'flex', alignItems: 'center', gap: 1 }}>
          <FailIcon /> Mark as Failed
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
            Mark <strong style={{ color: 'white' }}>Payment #{paymentToFail?.id}</strong> from{' '}
            <strong style={{ color: 'white' }}>{paymentToFail?.investor_name}</strong> as failed?
          </Typography>
          <TextField
            label="Reason (optional)"
            fullWidth
            multiline
            rows={2}
            value={failReason}
            onChange={(e) => setFailReason(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(244,67,54,0.4)' },
                '&:hover fieldset': { borderColor: '#F44336' },
                '&.Mui-focused fieldset': { borderColor: '#F44336' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#F44336' },
            }}
            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFailDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)' }} disabled={failing}>
            Cancel
          </Button>
          <Button
            onClick={handleFailConfirm}
            variant="contained"
            disabled={failing}
            startIcon={failing ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <FailIcon />}
            sx={{ backgroundColor: '#F44336', '&:hover': { backgroundColor: '#D32F2F' } }}
          >
            {failing ? 'Updating...' : 'Mark as Failed'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentList;
