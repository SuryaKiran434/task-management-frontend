import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Typography, Avatar,
  Tooltip, useMediaQuery, useTheme as useMuiTheme,
} from '@mui/material';
import {
  LayoutDashboard, CheckSquare, PlusCircle, User, Settings,
  Menu, ChevronLeft, LogOut, Moon, Sun,
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import NotificationBell from '../notifications/NotificationBell';
import ErrorBoundary from './ErrorBoundary';

const DRAWER_WIDTH = 240;
const DRAWER_MINI = 64;

const navItems = [
  { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
  { label: 'My Tasks', icon: <CheckSquare size={20} />, path: '/view-tasks' },
  { label: 'New Task', icon: <PlusCircle size={20} />, path: '/create-task' },
  { label: 'Profile', icon: <User size={20} />, path: '/view-information' },
];

const adminNavItems = [
  { label: 'Admin Panel', icon: <Settings size={20} />, path: '/admin-dashboard' },
];

export default function AppLayout({ children }) {
  const [open, setOpen] = useState(true);
  const { currentUser, logout } = useContext(AuthContext);
  const { theme: mode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const drawerWidth = open && !isMobile ? DRAWER_WIDTH : DRAWER_MINI;
  const mainOffset = isMobile ? 0 : drawerWidth;
  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const items = isAdmin ? [...navItems, ...adminNavItems] : navItems;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Logo + collapse toggle */}
      <Box sx={{
        display: 'flex', alignItems: 'center',
        justifyContent: open ? 'space-between' : 'center',
        px: 1.5, minHeight: 64,
        borderBottom: '1px solid', borderColor: 'divider',
      }}>
        {open && (
          <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em" sx={{
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            TaskFlow
          </Typography>
        )}
        <IconButton onClick={() => setOpen(!open)} size="small" sx={{ color: 'text.secondary' }}>
          {open ? <ChevronLeft size={18} /> : <Menu size={18} />}
        </IconButton>
      </Box>

      {/* Nav items */}
      <List sx={{ flex: 1, pt: 1.5, px: 1 }}>
        {items.map((item) => {
          const active = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={!open ? item.label : ''} placement="right" arrow>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={active}
                  sx={{
                    borderRadius: 2,
                    minHeight: 42,
                    justifyContent: open ? 'flex-start' : 'center',
                    px: open ? 1.5 : 1,
                    color: active ? 'primary.main' : 'text.secondary',
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(124,58,237,0.08) 100%)',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' },
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(79,70,229,0.18) 0%, rgba(124,58,237,0.12) 100%)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: open ? 34 : 'auto',
                    color: active ? 'primary.main' : 'text.secondary',
                    transition: 'color 0.15s',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: active ? 600 : 400,
                        fontSize: '0.875rem',
                        lineHeight: 1,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Logout */}
      <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Tooltip title={!open ? 'Logout' : ''} placement="right" arrow>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              justifyContent: open ? 'flex-start' : 'center',
              px: open ? 1.5 : 1,
              minHeight: 42,
              color: 'error.main',
              '&:hover': { backgroundColor: 'rgba(239,68,68,0.08)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: open ? 34 : 'auto', color: 'error.main' }}>
              <LogOut size={18} />
            </ListItemIcon>
            {open && <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          width: `calc(100% - ${mainOffset}px)`,
          ml: `${mainOffset}px`,
          transition: 'width 0.2s, margin 0.2s',
        }}
      >
        <Toolbar sx={{ gap: 0.5, minHeight: 64 }}>
          {isMobile && (
            <IconButton onClick={() => setOpen(true)} size="small" sx={{ color: 'text.secondary', mr: 1 }}>
              <Menu size={20} />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }} />
          <NotificationBell />

          <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} arrow>
            <IconButton
              onClick={toggleTheme}
              size="small"
              sx={{ color: 'text.secondary', '&:hover': { backgroundColor: 'action.hover', color: 'text.primary' } }}
            >
              {mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </IconButton>
          </Tooltip>

          <Tooltip title={currentUser?.email || 'My profile'} arrow>
            <IconButton component={RouterLink} to="/view-information" size="small" sx={{ ml: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.main', fontWeight: 700 }}>
                {currentUser?.email?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? open : true}
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          transition: 'width 0.2s',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            transition: 'width 0.2s',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: 8,
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: 'background.default',
          transition: 'margin 0.2s',
          minWidth: 0,
        }}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </Box>
    </Box>
  );
}
