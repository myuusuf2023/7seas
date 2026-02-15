import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '../common/StatCard';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency, formatDate, formatPercent, getStatusColor } from '../../utils/formatters';

const COLORS = {
  verified: '#4caf50',
  pending: '#ff9800',
  failed: '#f44336',
  overdue: '#d32f2f',
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [timeline, setTimeline] = useState({ labels: [], data: [] });
  const [paymentStatus, setPaymentStatus] = useState({});
  const [overdueInvestors, setOverdueInvestors] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, timelineRes, statusRes, overdueRes, activityRes] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getCollectionsTimeline('monthly'),
        dashboardService.getPaymentStatus(),
        dashboardService.getOverdueInvestors(),
        dashboardService.getRecentActivity(),
      ]);

      setOverview(overviewRes.data);
      setTimeline(timelineRes.data);
      setPaymentStatus(statusRes.data);
      setOverdueInvestors(overdueRes.data);
      setRecentActivity(activityRes.data);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
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

  // Prepare chart data
  const timelineChartData = timeline.labels.map((label, index) => ({
    name: label,
    amount: parseFloat(timeline.data[index]) || 0,
  }));

  const statusChartData = [
    { name: 'Verified', value: paymentStatus.verified || 0 },
    { name: 'Pending', value: paymentStatus.pending || 0 },
    { name: 'Failed', value: paymentStatus.failed || 0 },
    { name: 'Overdue', value: paymentStatus.overdue || 0 },
  ].filter((item) => item.value > 0);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#C9A961' }}>
        Dashboard Overview
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Project Target"
            value={formatCurrency(overview?.project_target)}
            icon={<AccountBalanceIcon sx={{ color: 'white' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Committed"
            value={formatCurrency(overview?.total_committed)}
            icon={<PeopleIcon sx={{ color: 'white' }} />}
            trend={`${formatPercent(overview?.target_achieved_rate, 1)} of target`}
            trendUp={parseFloat(overview?.target_achieved_rate) > 0}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Raised"
            value={formatCurrency(overview?.total_raised)}
            icon={<MoneyIcon sx={{ color: 'white' }} />}
            trend={`${formatPercent(overview?.collection_rate, 1)} collected`}
            trendUp={parseFloat(overview?.collection_rate) > 0}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Outstanding"
            value={formatCurrency(overview?.total_outstanding)}
            icon={<TrendingUpIcon sx={{ color: 'white' }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #1B2937 0%, #1B4965 100%)',
              border: '1px solid rgba(201, 169, 97, 0.2)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#C9A961' }}>
              Collections Timeline
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#B0BEC5" />
                <YAxis stroke="#B0BEC5" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1B2937', border: '1px solid #C9A961' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#C9A961" strokeWidth={2} name="Amount Collected" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #1B2937 0%, #1B4965 100%)',
              border: '1px solid rgba(201, 169, 97, 0.2)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#C9A961' }}>
              Payment Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()] || '#999'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Data Tables Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #1B2937 0%, #1B4965 100%)',
              border: '1px solid rgba(201, 169, 97, 0.2)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#C9A961' }}>
              Recent Activity
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Investor</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentActivity.slice(0, 5).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.payment_date)}</TableCell>
                      <TableCell>{payment.investor_name}</TableCell>
                      <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={payment.payment_status_display}
                          color={getStatusColor(payment.payment_status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #1B2937 0%, #1B4965 100%)',
              border: '1px solid rgba(201, 169, 97, 0.2)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: '#C9A961' }}>
              Overdue Payments
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Investor</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Days Overdue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overdueInvestors.slice(0, 5).map((investor) => (
                    <TableRow key={investor.investor_id}>
                      <TableCell>{investor.investor_name}</TableCell>
                      <TableCell align="right">{formatCurrency(investor.total_overdue_amount)}</TableCell>
                      <TableCell align="right">
                        <Chip label={`${investor.days_overdue} days`} color="error" size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {overdueInvestors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ color: 'text.secondary' }}>
                        No overdue payments
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
