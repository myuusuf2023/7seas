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
  LinearProgress,
  Avatar,
  TextField,
  InputAdornment,
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
import { formatCurrency, formatDate, formatPercent } from '../../utils/formatters';

const InvestorList = () => {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(201, 169, 97, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: '#C9A961',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#C9A961',
              },
            },
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
                    <TableCell align="right">{formatCurrency(investor.share_amount)}</TableCell>
                    <TableCell align="right">{formatCurrency(investor.total_paid)}</TableCell>
                    <TableCell align="right">{formatCurrency(investor.outstanding_balance)}</TableCell>
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
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          sx={{ color: '#f44336' }}
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
    </Box>
  );
};

export default InvestorList;
