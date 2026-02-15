import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Typography, Paper } from '@mui/material';
import theme from './theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A1929 0%, #1B4965 100%)',
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={6}
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #1B2937 0%, #1B4965 100%)',
            }}
          >
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                background: 'linear-gradient(90deg, #C9A961 0%, #D4B87A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                mb: 2,
              }}
            >
              7-Seas Suites
            </Typography>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Investment Management System
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
              Project initialized successfully! 🚀
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Backend: Django + PostgreSQL + Docker
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Frontend: React + Material UI
            </Typography>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
