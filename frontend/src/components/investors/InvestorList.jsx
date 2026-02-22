import { useState, useEffect } from 'react';
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
  LinearProgress,
  Avatar,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { investorService } from '../../services/investorService';
import { formatCurrency, formatKES } from '../../utils/formatters';

const InvestorList = () => {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [investorToDelete, setInvestorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [investorToEdit, setInvestorToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({});
  const [creating, setCreating] = useState(false);
  const [createErrors, setCreateErrors] = useState({});

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchInvestors();
  }, []);

  const fetchInvestors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await investorService.getAll();
      setInvestors(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load investors');
      console.error('Error fetching investors:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Delete Handlers ---
  const handleDeleteClick = (investor) => {
    setInvestorToDelete(investor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!investorToDelete) return;
    try {
      setDeleting(true);
      await investorService.delete(investorToDelete.id);
      setSnackbar({ open: true, message: `${investorToDelete.full_name} has been deleted.`, severity: 'success' });
      setDeleteDialogOpen(false);
      setInvestorToDelete(null);
      fetchInvestors();
    } catch (err) {
      console.error('Error deleting investor:', err);
      setSnackbar({ open: true, message: 'Failed to delete investor. Please try again.', severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setInvestorToDelete(null);
  };

  // --- Edit Handlers ---
  const handleEditClick = (investor) => {
    setInvestorToEdit(investor);
    setEditFormData({
      first_name: investor.first_name || '',
      last_name: investor.last_name || '',
      email: investor.email || '',
      phone: investor.phone || '',
      investor_type: investor.investor_type || 'LP',
      share_amount: investor.share_amount || '',
      kyc_status: investor.kyc_status || 'PENDING',
    });
    setEditErrors({});
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (field) => (e) => {
    setEditFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (editErrors[field]) {
      setEditErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleEditSave = async () => {
    if (!investorToEdit) return;
    try {
      setSaving(true);
      setEditErrors({});
      await investorService.partialUpdate(investorToEdit.id, editFormData);
      setSnackbar({ open: true, message: `${editFormData.first_name} ${editFormData.last_name} has been updated.`, severity: 'success' });
      setEditDialogOpen(false);
      setInvestorToEdit(null);
      fetchInvestors();
    } catch (err) {
      console.error('Error updating investor:', err);
      if (err.response?.data) {
        const serverErrors = err.response.data;
        const formattedErrors = {};
        Object.keys(serverErrors).forEach((key) => {
          formattedErrors[key] = Array.isArray(serverErrors[key])
            ? serverErrors[key].join(' ')
            : serverErrors[key];
        });
        setEditErrors(formattedErrors);
      } else {
        setSnackbar({ open: true, message: 'Failed to update investor. Please try again.', severity: 'error' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setInvestorToEdit(null);
    setEditErrors({});
  };

  // --- Create Handlers ---
  const handleCreateClick = () => {
    setCreateFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      investor_type: 'LP',
      share_amount: '',
      joined_date: new Date().toISOString().split('T')[0],
    });
    setCreateErrors({});
    setCreateDialogOpen(true);
  };

  const handleCreateFormChange = (field) => (e) => {
    setCreateFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (createErrors[field]) {
      setCreateErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleCreateSave = async () => {
    try {
      setCreating(true);
      setCreateErrors({});
      await investorService.create(createFormData);
      setSnackbar({ open: true, message: `${createFormData.first_name} ${createFormData.last_name} has been added.`, severity: 'success' });
      setCreateDialogOpen(false);
      fetchInvestors();
    } catch (err) {
      console.error('Error creating investor:', err);
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
        setSnackbar({ open: true, message: 'Failed to create investor. Please try again.', severity: 'error' });
      }
    } finally {
      setCreating(false);
    }
  };

  const handleCreateCancel = () => {
    setCreateDialogOpen(false);
    setCreateErrors({});
  };

  const getKycStatusColor = (status) => {
    const colors = {
      VERIFIED: 'success',
      PENDING: 'warning',
      REJECTED: 'error',
    };
    return colors[status] || 'default';
  };

  const getInvestorTypeColor = (type) => {
    return type === 'GP' ? 'primary' : 'info';
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const filteredInvestors = investors.filter((investor) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      investor.full_name?.toLowerCase().includes(searchLower) ||
      investor.email?.toLowerCase().includes(searchLower) ||
      investor.investor_type_display?.toLowerCase().includes(searchLower)
    );
  });

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

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'rgba(201, 169, 97, 0.3)' },
      '&:hover fieldset': { borderColor: '#C9A961' },
      '&.Mui-focused fieldset': { borderColor: '#C9A961' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#C9A961' },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#C9A961' }}>
          Investors
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchInvestors}
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
            Add New Investor
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name, email, or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#C9A961' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 400,
            ...inputSx,
          }}
        />
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
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }}>Investor</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }} align="right">Share Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }} align="right">Total Paid</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }} align="right">Outstanding</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }}>Progress</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }}>KYC Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#C9A961' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvestors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                    No investors found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvestors.map((investor) => (
                  <TableRow
                    key={investor.id}
                    sx={{
                      '&:hover': { backgroundColor: 'rgba(201, 169, 97, 0.05)' },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: '#C9A961',
                            width: 36,
                            height: 36,
                            fontSize: '0.875rem',
                          }}
                        >
                          {getInitials(investor.first_name, investor.last_name)}
                        </Avatar>
                        <Typography variant="body2">{investor.full_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{investor.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={investor.investor_type_display}
                        color={getInvestorTypeColor(investor.investor_type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{formatCurrency(investor.share_amount)}</Typography>
                      <Typography variant="caption" sx={{ color: '#C9A961', fontWeight: 600 }}>{formatKES(investor.share_amount)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{formatCurrency(investor.total_paid)}</Typography>
                      <Typography variant="caption" sx={{ color: '#C9A961', fontWeight: 600 }}>{formatKES(investor.total_paid)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{formatCurrency(investor.outstanding_balance)}</Typography>
                      <Typography variant="caption" sx={{ color: '#C9A961', fontWeight: 600 }}>{formatKES(investor.outstanding_balance)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(investor.payment_completion_percentage, 100)}
                          sx={{
                            flex: 1,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(201, 169, 97, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#C9A961',
                            },
                          }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 40 }}>
                          {investor.payment_completion_percentage.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={investor.kyc_status_display}
                        color={getKycStatusColor(investor.kyc_status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          sx={{ color: '#C9A961' }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          sx={{ color: '#C9A961' }}
                          onClick={() => handleEditClick(investor)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          sx={{ color: '#f44336' }}
                          onClick={() => handleDeleteClick(investor)}
                        >
                          <DeleteIcon fontSize="small" />
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
        Total Investors: {filteredInvestors.length} {searchQuery && `(filtered from ${investors.length})`}
      </Typography>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1B2937 0%, #1B4965 100%)',
            border: '1px solid rgba(201, 169, 97, 0.3)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#C9A961' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Are you sure you want to delete <strong style={{ color: '#fff' }}>{investorToDelete?.full_name}</strong>?
            This will deactivate the investor record.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} sx={{ color: '#C9A961' }} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Investor Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1B2937 0%, #1B4965 100%)',
            border: '1px solid rgba(201, 169, 97, 0.3)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#C9A961' }}>Edit Investor</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}>
              <TextField
                label="First Name"
                fullWidth
                value={editFormData.first_name || ''}
                onChange={handleEditFormChange('first_name')}
                error={!!editErrors.first_name}
                helperText={editErrors.first_name}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Last Name"
                fullWidth
                value={editFormData.last_name || ''}
                onChange={handleEditFormChange('last_name')}
                error={!!editErrors.last_name}
                helperText={editErrors.last_name}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                fullWidth
                type="email"
                value={editFormData.email || ''}
                onChange={handleEditFormChange('email')}
                error={!!editErrors.email}
                helperText={editErrors.email}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Phone"
                fullWidth
                value={editFormData.phone || ''}
                onChange={handleEditFormChange('phone')}
                error={!!editErrors.phone}
                helperText={editErrors.phone}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Investor Type"
                fullWidth
                select
                value={editFormData.investor_type || 'LP'}
                onChange={handleEditFormChange('investor_type')}
                error={!!editErrors.investor_type}
                helperText={editErrors.investor_type}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              >
                <MenuItem value="LP">Limited Partner</MenuItem>
                <MenuItem value="GP">General Partner</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Share Amount"
                fullWidth
                type="number"
                value={editFormData.share_amount || ''}
                onChange={handleEditFormChange('share_amount')}
                error={!!editErrors.share_amount}
                helperText={editErrors.share_amount}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="KYC Status"
                fullWidth
                select
                value={editFormData.kyc_status || 'PENDING'}
                onChange={handleEditFormChange('kyc_status')}
                error={!!editErrors.kyc_status}
                helperText={editErrors.kyc_status}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="VERIFIED">Verified</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          {editErrors.non_field_errors && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {editErrors.non_field_errors}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel} sx={{ color: '#C9A961' }} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            disabled={saving}
            sx={{ backgroundColor: '#C9A961', '&:hover': { backgroundColor: '#B89851' } }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Investor Dialog */}
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
        <DialogTitle sx={{ color: '#C9A961' }}>Add New Investor</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}>
              <TextField
                label="First Name"
                fullWidth
                required
                value={createFormData.first_name || ''}
                onChange={handleCreateFormChange('first_name')}
                error={!!createErrors.first_name}
                helperText={createErrors.first_name}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Last Name"
                fullWidth
                required
                value={createFormData.last_name || ''}
                onChange={handleCreateFormChange('last_name')}
                error={!!createErrors.last_name}
                helperText={createErrors.last_name}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                fullWidth
                required
                type="email"
                value={createFormData.email || ''}
                onChange={handleCreateFormChange('email')}
                error={!!createErrors.email}
                helperText={createErrors.email}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Phone"
                fullWidth
                value={createFormData.phone || ''}
                onChange={handleCreateFormChange('phone')}
                error={!!createErrors.phone}
                helperText={createErrors.phone}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Investor Type"
                fullWidth
                required
                select
                value={createFormData.investor_type || 'LP'}
                onChange={handleCreateFormChange('investor_type')}
                error={!!createErrors.investor_type}
                helperText={createErrors.investor_type}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              >
                <MenuItem value="LP">Limited Partner</MenuItem>
                <MenuItem value="GP">General Partner</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Share Amount"
                fullWidth
                required
                type="number"
                value={createFormData.share_amount || ''}
                onChange={handleCreateFormChange('share_amount')}
                error={!!createErrors.share_amount}
                helperText={createErrors.share_amount}
                sx={inputSx}
                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Joined Date"
                fullWidth
                required
                type="date"
                value={createFormData.joined_date || ''}
                onChange={handleCreateFormChange('joined_date')}
                error={!!createErrors.joined_date}
                helperText={createErrors.joined_date}
                sx={inputSx}
                InputLabelProps={{ shrink: true, sx: { color: 'rgba(255,255,255,0.7)' } }}
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
            {creating ? 'Adding...' : 'Add Investor'}
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

export default InvestorList;
