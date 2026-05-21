import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Avatar, Button, Stack,
  Chip, Divider, Skeleton, Alert, Snackbar, Dialog, DialogTitle,
  DialogContent, DialogActions, LinearProgress, IconButton,
} from '@mui/material';
import { ArrowLeft, ShieldCheck, ShieldOff, Trash2, Eye, CheckSquare } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { parseDate } from '../utils/dates';
import userService from '../services/userService';
import { AuthContext } from '../contexts/AuthContext';
import { PRIORITY_COLORS as PRIORITY_COLOR, STATUS_COLORS as STATUS_COLOR } from '../theme/taskColors';

function DueDateBadge({ date }) {
  if (!date) return <Typography variant="caption" color="text.disabled">—</Typography>;
  const d = parseDate(date);
  const overdue = isPast(d) && !isToday(d);
  return (
    <Typography variant="caption" sx={{ color: overdue ? 'error.main' : isToday(d) ? 'warning.main' : 'text.secondary', fontWeight: overdue || isToday(d) ? 600 : 400 }}>
      {overdue ? '⚠ ' : isToday(d) ? '⏰ ' : ''}{format(d, 'MMM d, yyyy')}
    </Typography>
  );
}

function getRoleNames(user) {
  if (!user?.roles) return [];
  return user.roles.map(r => (typeof r === 'string' ? r : (r.authority || r.name || String(r))));
}

export default function ManageUser() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [snack, setSnack] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setLoadingUser(true);
    userService.getUserInfo(userId)
      .then(setUser)
      .catch(() => setSnack({ message: 'Failed to load user info', severity: 'error' }))
      .finally(() => setLoadingUser(false));

    setLoadingTasks(true);
    userService.getUserTasksById(userId)
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoadingTasks(false));
  }, [userId]);

  const roles = getRoleNames(user);
  const isAdminUser = roles.some(r => r === 'ROLE_ADMIN');
  const isSelf = String(currentUser?.id) === String(userId);

  const handleAssignAdmin = async () => {
    setActionLoading(true);
    try {
      await userService.assignAdmin(userId);
      setUser(prev => ({ ...prev, roles: [...getRoleNames(prev), 'ROLE_ADMIN'] }));
      setSnack({ message: 'Admin role assigned', severity: 'success' });
    } catch {
      setSnack({ message: 'Failed to assign admin role', severity: 'error' });
    } finally { setActionLoading(false); }
  };

  const handleRemoveAdmin = async () => {
    setActionLoading(true);
    try {
      await userService.removeAdmin(userId);
      setUser(prev => ({ ...prev, roles: getRoleNames(prev).filter(r => r !== 'ROLE_ADMIN') }));
      setSnack({ message: 'Admin role removed', severity: 'success' });
    } catch {
      setSnack({ message: 'Failed to remove admin role', severity: 'error' });
    } finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await userService.deleteUser(userId);
      setSnack({ message: 'User deleted', severity: 'success' });
      setTimeout(() => navigate('/admin-dashboard'), 1200);
    } catch {
      setSnack({ message: 'Failed to delete user', severity: 'error' });
    } finally { setActionLoading(false); setDeleteConfirm(false); }
  };

  const taskStats = [
    { label: 'Total', value: tasks.length, color: '#4F46E5' },
    { label: 'To Do', value: tasks.filter(t => t.status === 'To-Do').length, color: '#6366F1' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: '#F59E0B' },
    { label: 'Complete', value: tasks.filter(t => t.status === 'Complete').length, color: '#10B981' },
  ];

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton size="small" onClick={() => navigate('/admin-dashboard')}>
          <ArrowLeft size={18} />
        </IconButton>
        <Typography variant="h4" fontWeight={700}>Manage User</Typography>
      </Box>

      {/* Profile card */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {loadingUser ? (
            <Stack spacing={2}><Skeleton variant="circular" width={64} height={64} /><Skeleton width="40%" /><Skeleton width="60%" /></Stack>
          ) : user ? (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, flexWrap: 'wrap' }}>
              <Avatar sx={{ width: 64, height: 64, fontSize: '1.5rem', bgcolor: 'primary.main' }}>
                {user.firstName?.[0] || user.email?.[0] || 'U'}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 180 }}>
                <Typography variant="h5" fontWeight={700}>{user.firstName} {user.lastName}</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>{user.email}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {roles.map((r, i) => (
                    <Chip key={i} label={r.replace('ROLE_', '')} size="small"
                      color={r === 'ROLE_ADMIN' ? 'secondary' : 'default'} variant="outlined" />
                  ))}
                </Stack>
              </Box>
              {!isSelf && (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {!isAdminUser ? (
                    <Button variant="outlined" size="small" color="secondary" startIcon={<ShieldCheck size={14} />}
                      onClick={handleAssignAdmin} disabled={actionLoading} sx={{ borderRadius: 2 }}>
                      Make Admin
                    </Button>
                  ) : (
                    <Button variant="outlined" size="small" startIcon={<ShieldOff size={14} />}
                      onClick={handleRemoveAdmin} disabled={actionLoading} sx={{ borderRadius: 2 }}>
                      Remove Admin
                    </Button>
                  )}
                  <Button variant="outlined" size="small" startIcon={<Eye size={14} />}
                    onClick={() => navigate(`/view-information/${userId}`)} sx={{ borderRadius: 2 }}>
                    Profile
                  </Button>
                  <Button variant="outlined" size="small" color="error" startIcon={<Trash2 size={14} />}
                    onClick={() => setDeleteConfirm(true)} disabled={actionLoading} sx={{ borderRadius: 2 }}>
                    Delete
                  </Button>
                </Stack>
              )}
            </Box>
          ) : (
            <Alert severity="error">User not found.</Alert>
          )}
        </CardContent>
      </Card>

      {/* Account details */}
      {user && (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>Account Details</Typography>
            <Divider sx={{ mb: 2.5 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' }, gap: 3 }}>
              {[
                { label: 'First Name', value: user.firstName },
                { label: 'Last Name', value: user.lastName },
                { label: 'Email', value: user.email },
                { label: 'User ID', value: `#${user.id}` },
                { label: 'Role', value: roles.map(r => r.replace('ROLE_', '')).join(', ') || '—' },
                { label: 'Member Since', value: user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '—' },
              ].map(({ label, value }) => (
                <Box key={label}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem', display: 'block', mb: 0.25 }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>{value || '—'}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Task stats */}
      {!loadingTasks && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
          {taskStats.map(s => (
            <Card key={s.label} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.68rem', display: 'block' }}>
                  {s.label}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Tasks table */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <CheckSquare size={18} />
            <Typography variant="subtitle1" fontWeight={600}>Tasks</Typography>
            <Chip label={tasks.length} size="small" sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }} />
          </Box>
          <Divider sx={{ mb: 2 }} />

          {loadingTasks ? (
            <LinearProgress sx={{ borderRadius: 1 }} />
          ) : tasks.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              This user has no tasks yet.
            </Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr>
                    {['Title', 'Status', 'Priority', 'Due Date'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid rgba(128,128,128,0.15)', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id} style={{ borderBottom: '1px solid rgba(128,128,128,0.08)' }}>
                      <td style={{ padding: '10px 12px', maxWidth: 280 }}>
                        <Typography variant="body2" fontWeight={500} noWrap title={task.title}>{task.title}</Typography>
                        {task.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {task.description}
                          </Typography>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <Chip label={task.status} size="small"
                          sx={{ fontSize: '0.7rem', backgroundColor: `${STATUS_COLOR[task.status]}18`, color: STATUS_COLOR[task.status] }} />
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <Chip label={task.priority} size="small"
                          sx={{ fontSize: '0.7rem', backgroundColor: `${PRIORITY_COLOR[task.priority]}18`, color: PRIORITY_COLOR[task.priority] }} />
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <DueDateBadge date={task.dueDate} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete User?</DialogTitle>
        <DialogContent>
          <Typography>Delete <strong>{user?.email}</strong>? This cannot be undone and will remove all their tasks.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={actionLoading}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {snack && <Alert severity={snack.severity} onClose={() => setSnack(null)}>{snack.message}</Alert>}
      </Snackbar>
    </Box>
  );
}
