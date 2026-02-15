import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import MainLayout from './components/common/MainLayout';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import InvestorList from './components/investors/InvestorList';
import PaymentList from './components/payments/PaymentList';
import Reports from './components/reports/Reports';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/investors" element={<InvestorList />} />
                <Route path="/payments" element={<PaymentList />} />
                <Route
                  path="/documents"
                  element={
                    <div style={{ color: 'white' }}>Documents - Coming Soon</div>
                  }
                />
                <Route
                  path="/reports"
                  element={<Reports />}
                />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
