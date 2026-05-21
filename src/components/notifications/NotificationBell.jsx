import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton, Badge, Popover, Box, Typography, List, ListItem,
  ListItemText, Button, Divider, CircularProgress, Chip,
} from '@mui/material';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import notificationService from '../../services/notificationService';

const TYPE_COLORS = {
  TASK_DUE_SOON: 'warning',
  TASK_OVERDUE: 'error',
  COMMENT_ON_TASK: 'info',
  TASK_ASSIGNED: 'primary',
  PROJECT_INVITE: 'secondary',
};

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const fetchCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silently ignore
    }
  };

  useEffect(() => {
    fetchCount();
    intervalRef.current = setInterval(fetchCount, 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleOpen = async (event) => {
    setAnchorEl(event.currentTarget);
    setLoading(true);
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => setAnchorEl(null);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  return (
    <>
      <IconButton onClick={handleOpen} size="small">
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <Bell size={18} />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 360, maxHeight: 480, borderRadius: 2, overflow: 'hidden' } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" startIcon={<CheckCheck size={14} />} onClick={handleMarkAllRead} sx={{ fontSize: '0.75rem' }}>
              Mark all read
            </Button>
          )}
        </Box>

        <Box sx={{ overflowY: 'auto', maxHeight: 400 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Bell size={32} color="#94A3B8" />
              <Typography color="text.secondary" variant="body2" mt={1}>All caught up!</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {notifications.map((n, i) => (
                <React.Fragment key={n.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      px: 2, py: 1.5,
                      backgroundColor: n.read ? 'transparent' : 'action.hover',
                      '&:hover': { backgroundColor: 'action.selected' },
                    }}
                    secondaryAction={
                      !n.read && (
                        <IconButton edge="end" size="small" onClick={() => handleMarkRead(n.id)}>
                          <Check size={14} />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Chip
                            label={n.type?.replace(/_/g, ' ')}
                            size="small"
                            color={TYPE_COLORS[n.type] || 'default'}
                            sx={{ height: 18, fontSize: '0.65rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.8rem' }}>
                            {n.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {i < notifications.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}
