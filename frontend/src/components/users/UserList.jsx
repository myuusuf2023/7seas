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
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';

const ROLE_CHOICES = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'VIEWER', label: 'Viewer' },
];

const emptyForm = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  role: 'VIEWER',
  phone: '',
  is_active: true,
  password: '',
};

const UserList = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Create dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createErrors, setCreateErrors] = useState({});

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAll();
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // --- Create ---
  const handleOpenCreate = () => {
    setCreateFormData(emptyForm);
    setCreateErrors({});
    setCreateDialogOpen(true);
  };

  const handleCreateChange = (e) => {
    const { name, value, checked, type } = e.target;
    setCreateFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (createErrors[name]) setCreateErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleCreateSubmit = async () => {
    setCreating(true);
    setCreateErrors({});
    try {
      await userService.create(createFormData);
      setCreateDialogOpen(false);
      showSnackbar('User created successfully');
      fetchUsers();
    } catch (err) {
      if (err.response?.data) {
        setCreateErrors(err.response.data);
      } else {
        showSnackbar('Failed to create user', 'error');
      }
    } finally {
      setCreating(false);
    }
  };

  // --- Edit ---
  const handleOpenEdit = (user) => {
    setUserToEdit(user);
    setEditFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      phone: user.phone || '',
      is_active: user.is_active,
      password: '',
    });
    setEditErrors({});
    setEditDialogOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value, checked, type } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (editErrors[name]) setEditErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleEditSubmit = async () => {
    setSaving(true);
    setEditErrors({});
    try {
      const payload = { ...editFormData };
      if (!payload.password) delete payload.password;
      await userService.update(userToEdit.id, payload);
      setEditDialogOpen(false);
      showSnackbar('User updated successfully');
      fetchUsers();
    } catch (err) {
      if (err.response?.data) {
        setEditErrors(err.response.data);
      } else {
        showSnackbar('Failed to update user', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // --- Delete ---
  const handleOpenDelete = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await userService.delete(userToDelete.id);
      setDeleteDialogOpen(false);
      showSnackbar('User deleted successfully');
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete user';
      showSnackbar(msg, 'error');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.first_name.toLowerCase().includes(q) ||
      u.last_name.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const getInitials = (u) => {
    if (u.first_name && u.last_name) return `${u.first_name[0]}${u.last_name[0]}`.toUpperCase();
    return u.username[0].toUpperCase();
  };

  const roleBadge = (role) => (
    <Chip
      label={role === 'ADMIN' ? 'Admin' : 'Viewer'}
      size="small"
      sx={{
        backgroundColor: role === 'ADMIN' ? 'rgba(201, 169, 97, 0.2)' : 'rgba(100, 181, 246, 0.15)',
        color: role === 'ADMIN' ? '#C9A961' : '#64B5F6',
        fontWeight: 600,
        fontSize: '0.7rem',
      }}
    />
  );

  const statusBadge = (isActive) => (
    <Chip
      label={isActive ? 'Active' : 'Inactive'}
      size="small"
      sx={{
        backgroundColor: isActive ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 67, 54, 0.15)',
        color: isActive ? '#4CAF50' : '#F44336',
        fontWeight: 600,
        fontSize: '0.7rem',
      }}
    />
  );

  const userFormFields = (formData, handleChange, errors) => (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth label="Username" name="username"
          value={formData.username} onChange={handleChange}
          error={!!errors.username}
          helperText={errors.username?.[0] || ''}
          required
          sx={fieldSx}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth label="Email" name="email" type="email"
          value={formData.email} onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email?.[0] || ''}
          sx={fieldSx}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth label="First Name" name="first_name"
          value={formData.first_name} onChange={handleChange}
          error={!!errors.first_name}
          helperText={errors.first_name?.[0] || ''}
          sx={fieldSx}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth label="Last Name" name="last_name"
          value={formData.last_name} onChange={handleChange}
          error={!!errors.last_name}
          helperText={errors.last_name?.[0] || ''}
          sx={fieldSx}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth label="Phone" name="phone"
          value={formData.phone} onChange={handleChange}
          error={!!errors.phone}
          helperText={errors.phone?.[0] || ''}
          sx={fieldSx}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          select fullWidth label="Role" name="role"
          value={formData.role} onChange={handleChange}
          error={!!errors.role}
          helperText={errors.role?.[0] || ''}
          sx={fieldSx}
        >
          {ROLE_CHOICES.map((r) => (
            <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth label="Password" name="password" type="password"
          value={formData.password} onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password?.[0] || (formData.id ? 'Leave blank to keep current password' : 'Min 8 characters')}
          required={!formData.id}
          sx={fieldSx}
        />
      </Grid>
      <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Switch
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#C9A961' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#C9A961' } }}
            />
          }
          label={<Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Active</Typography>}
        />
      </Grid>
    </Grid>
  );

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      color: 'white',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
      '&:hover fieldset': { borderColor: 'rgba(201,169,97,0.5)' },
      '&.Mui-focused fieldset': { borderColor: '#C9A961' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.6)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#C9A961' },
    '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.5)' },
    '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.6)' },
  };

  const dialogSx = {
    '& .MuiDialog-paper': {
      backgroundColor: '#1B2937',
      backgroundImage: 'none',
      border: '1px solid rgba(201,169,97,0.2)',
      color: 'white',
      minWidth: { xs: '90vw', sm: 560 },
    },
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
          User Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchUsers} sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#C9A961' } }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              background: 'linear-gradient(135deg, #C9A961, #D4B87A)',
              color: '#0A1929',
              fontWeight: 700,
              '&:hover': { background: 'linear-gradient(135deg, #D4B87A, #C9A961)' },
            }}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="Search by name, username, email or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: '100%', sm: 380 }, ...fieldSx }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#C9A961' }} />
        </Box>
      ) : (
        <Paper sx={{ backgroundColor: '#1B2937', border: '1px solid rgba(201,169,97,0.1)', borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { backgroundColor: '#0A1929', color: '#C9A961', fontWeight: 700, borderBottom: '2px solid rgba(201,169,97,0.2)' } }}>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: 'rgba(255,255,255,0.5)', py: 6 }}>
                      {searchQuery ? 'No users match your search.' : 'No users found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow
                      key={u.id}
                      sx={{ '&:hover': { backgroundColor: 'rgba(201,169,97,0.05)' }, '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.85)' } }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: '#C9A961', color: '#0A1929', width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700 }}>
                            {getInitials(u)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'white' }}>
                              {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : u.username}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                              @{u.username}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{u.email || '—'}</TableCell>
                      <TableCell>{roleBadge(u.role)}</TableCell>
                      <TableCell>{statusBadge(u.is_active)}</TableCell>
                      <TableCell>{u.phone || '—'}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenEdit(u)} sx={{ color: '#C9A961', '&:hover': { backgroundColor: 'rgba(201,169,97,0.1)' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={u.id === currentUser?.id ? "Cannot delete your own account" : "Delete"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDelete(u)}
                              disabled={u.id === currentUser?.id}
                              sx={{ color: '#F44336', '&:hover': { backgroundColor: 'rgba(244,67,54,0.1)' }, '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} sx={dialogSx}>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(201,169,97,0.2)', color: '#C9A961' }}>
          Create New User
        </DialogTitle>
        <DialogContent>
          {userFormFields(createFormData, handleCreateChange, createErrors)}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(201,169,97,0.1)' }}>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateSubmit}
            disabled={creating}
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #C9A961, #D4B87A)', color: '#0A1929', fontWeight: 700, '&:hover': { background: 'linear-gradient(135deg, #D4B87A, #C9A961)' } }}
          >
            {creating ? <CircularProgress size={20} sx={{ color: '#0A1929' }} /> : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} sx={dialogSx}>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(201,169,97,0.2)', color: '#C9A961' }}>
          Edit User
        </DialogTitle>
        <DialogContent>
          {userToEdit && userFormFields(editFormData, handleEditChange, editErrors)}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(201,169,97,0.1)' }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            disabled={saving}
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #C9A961, #D4B87A)', color: '#0A1929', fontWeight: 700, '&:hover': { background: 'linear-gradient(135deg, #D4B87A, #C9A961)' } }}
          >
            {saving ? <CircularProgress size={20} sx={{ color: '#0A1929' }} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} sx={dialogSx}>
        <DialogTitle sx={{ color: '#F44336' }}>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Are you sure you want to delete <strong style={{ color: 'white' }}>{userToDelete?.username}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            variant="contained"
            sx={{ backgroundColor: '#F44336', '&:hover': { backgroundColor: '#D32F2F' } }}
          >
            {deleting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserList;
