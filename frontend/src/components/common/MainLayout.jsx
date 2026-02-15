import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Insights as InsightsIcon,
  Groups as GroupsIcon,
  AccountBalanceWallet as WalletIcon,
  FolderOpen as FolderIcon,
  BarChart as ChartIcon,
  AccountCircle,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <InsightsIcon />, path: '/dashboard' },
  { text: 'Investors', icon: <GroupsIcon />, path: '/investors' },
  { text: 'Payments', icon: <WalletIcon />, path: '/payments' },
  { text: 'Documents', icon: <FolderIcon />, path: '/documents' },
  { text: 'Reports', icon: <ChartIcon />, path: '/reports' },
];

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Get current page name based on route
  const getPageName = () => {
    const path = location.pathname;
    const pageMap = {
      '/dashboard': 'Dashboard',
      '/investors': 'Investors',
      '/payments': 'Payments',
      '/documents': 'Documents',
      '/reports': 'Reports',
    };
    return pageMap[path] || 'Dashboard';
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          background: 'linear-gradient(90deg, #C9A961 0%, #D4B87A 100%)',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ color: '#0A1929', fontWeight: 700 }}
        >
          7-Seas Suites
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(201, 169, 97, 0.15)',
                  borderRight: '4px solid #C9A961',
                },
                '&:hover': {
                  backgroundColor: 'rgba(201, 169, 97, 0.08)',
                  '& .MuiListItemIcon-root': {
                    transform: 'scale(1.1)',
                    transition: 'transform 0.2s ease-in-out',
                  },
                },
                py: 1.5,
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? '#C9A961' : 'rgba(255, 255, 255, 0.7)',
                  minWidth: 45,
                  transition: 'all 0.2s ease-in-out',
                  '& svg': {
                    fontSize: '1.5rem',
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(135deg, #0A1929 0%, #1B4965 50%, #1B2937 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          borderBottom: '2px solid rgba(201, 169, 97, 0.3)',
        }}
      >
        <Toolbar sx={{ minHeight: '80px !important', px: 3 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              letterSpacing: '0.5px',
              background: 'linear-gradient(90deg, #FFFFFF 0%, #C9A961 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.3,
            }}
          >
            Complete End-to-End Investment Portfolio Management | Real-Time Investor Relations & Payment Tracking | Advanced Financial Reporting, Analytics & Automated Receipt Generation | Secure Documentation & Transparent Stakeholder Communication
          </Typography>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Avatar sx={{
              bgcolor: '#C9A961',
              width: 40,
              height: 40,
              border: '2px solid rgba(255, 255, 255, 0.2)',
              fontSize: '1.1rem',
              fontWeight: 600,
            }}>
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
          >
            <MenuItem disabled>
              <AccountCircle sx={{ mr: 1 }} />
              {user?.username}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#1B2937',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#1B2937',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: '#0A1929',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
