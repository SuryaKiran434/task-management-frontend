import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip,
  Stack, Paper, Avatar, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, Snackbar, LinearProgress,
} from '@mui/material';
import { Users, Trash2, Settings, CheckSquare, Clock, AlertTriangle, TrendingUp, UserPlus } from 'lucide-react';
import { UserContext } from '../../contexts/userContext';
import { useTaskActions } from '../../contexts/TaskContext';
import { taskService } from '../../services/taskService';
import CreateUserDialog from './CreateUserDialog';

function StatCard({ label, value, color, icon }) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: 2, backgroundColor: `${color}18`, color, mb: 1.5 }}>
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h4" fontWeight={700} sx={{ color }}>{value ?? '—'}</Typography>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { users, fetchAllUsers, deleteUser } = useContext(UserContext);
  const { fetchTasks } = useTaskActions();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [snack, setSnack] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([fetchAllUsers(), fetchTasks(true)]);
        const s = await taskService.getStats();
        setStats(s);
      } catch {
        setSnack({ message: 'Failed to load admin data', severity: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setSnack({ message: 'User deleted', severity: 'success' });
    } catch {
      setSnack({ message: 'Failed to delete user', severity: 'error' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const statCards = stats ? [
    { label: 'Total Tasks', value: stats.total, color: '#4F46E5', icon: <CheckSquare size={20} /> },
    { label: 'In Progress', value: stats.inProgress ?? stats['IN_PROGRESS'], color: '#F59E0B', icon: <Clock size={20} /> },
    { label: 'Completed', value: stats.complete ?? stats['COMPLETE'], color: '#10B981', icon: <TrendingUp size={20} /> },
    { label: 'Overdue', value: stats.overdue, color: '#EF4444', icon: <AlertTriangle size={20} /> },
  ] : [];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Admin Dashboard</Typography>
        <Button variant="contained" startIcon={<UserPlus size={18} />} onClick={() => setCreateOpen(true)} sx={{ borderRadius: 2 }}>
          New User
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map(s => (
            <Grid item xs={12} sm={6} md={3} key={s.label}>
              <StatCard {...s} />
            </Grid>
          ))}
        </Grid>
      )}

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Users size={20} />
            <Typography variant="h6" fontWeight={600}>Manage Users</Typography>
            <Chip label={users.length} size="small" sx={{ ml: 'auto' }} />
            <Button size="small" variant="outlined" startIcon={<UserPlus size={14} />} onClick={() => setCreateOpen(true)} sx={{ borderRadius: 2 }}>
              Add user
            </Button>
          </Box>
          <Stack spacing={1}>
            {users.map(user => (
              <Paper key={user.id} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 36, height: 36, fontSize: '0.85rem', bgcolor: 'primary.main' }}>
                  {user.firstName?.[0] || user.email?.[0] || 'U'}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={500} noWrap>{user.firstName} {user.lastName}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{user.email}</Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  {user.roles?.map((r) => {
                    const name = typeof r === 'string' ? r : (r.authority || r.name || String(r));
                    return <Chip key={name} label={name.replace('ROLE_', '')} size="small" variant="outlined" color={name === 'ROLE_ADMIN' ? 'secondary' : 'default'} sx={{ fontSize: '0.65rem' }} />;
                  })}
                </Stack>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Manage user (details, tasks, roles)">
                    <IconButton size="small" color="primary" onClick={() => navigate(`/manage-user/${user.id}`)}>
                      <Settings size={14} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete user">
                    <IconButton size="small" color="error" onClick={() => setDeleteConfirm(user)}>
                      <Trash2 size={14} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Paper>
            ))}
            {users.length === 0 && !loading && (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>No users found.</Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete User?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deleteConfirm?.email}</strong>? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={() => handleDeleteUser(deleteConfirm.id)} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <CreateUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => fetchAllUsers()}
      />

      <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {snack && <Alert severity={snack.severity} onClose={() => setSnack(null)}>{snack.message}</Alert>}
      </Snackbar>
    </Box>
  );
}
