import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StatCard = ({ title, value, icon, trend, trendUp, color = 'primary' }) => {
  const colorMap = {
    primary: '#1B4965',
    secondary: '#C9A961',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
  };

  const bgColor = colorMap[color] || colorMap.primary;

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #1B2937 0%, #1B4965 100%)',
        border: '1px solid rgba(201, 169, 97, 0.2)',
        '&:hover': {
          boxShadow: '0 8px 16px rgba(201, 169, 97, 0.3)',
          transform: 'translateY(-2px)',
          transition: 'all 0.3s',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 600, mb: 1 }}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {trendUp ? (
                  <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, color: '#f44336' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{ color: trendUp ? '#4caf50' : '#f44336' }}
                >
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: bgColor,
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.8,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
