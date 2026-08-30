import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box, Grid, Card, CardContent, Typography, Button, Skeleton,
  LinearProgress, Chip, Stack, Paper, useTheme,
} from '@mui/material';
import { PlusCircle, CheckSquare, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { AuthContext } from '../../contexts/AuthContext';
import { taskService } from '../../services/taskService';
import { format } from 'date-fns';
import { parseDate } from '../../utils/dates';
import { PRIORITY_COLORS, STATUS_COLORS } from '../../theme/taskColors';

function StatCard({ icon, label, value, color, loading }) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        {loading ? (
          <>
            <Skeleton variant="circular" width={40} height={40} sx={{ mb: 1.5 }} />
            <Skeleton width="60%" height={20} />
            <Skeleton width="40%" height={36} sx={{ mt: 0.5 }} />
          </>
        ) : (
          <>
            <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: 2, backgroundColor: `${color}18`, color, mb: 1.5 }}>
              {icon}
            </Box>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color }}>{value}</Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsData, tasks] = await Promise.all([
          taskService.getStats(),
          taskService.getUserTasks(),
        ]);
        setStats(statsData);
        setRecentTasks(Array.isArray(tasks) ? tasks.slice(0, 5) : []);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const priorityData = stats ? [
    { name: 'High', value: stats.highPriority || 0, color: PRIORITY_COLORS.HIGH },
    { name: 'Medium', value: stats.mediumPriority || 0, color: PRIORITY_COLORS.MEDIUM },
    { name: 'Low', value: stats.lowPriority || 0, color: PRIORITY_COLORS.LOW },
  ] : [];

  const statusData = stats ? [
    { name: 'To-Do', value: stats.todo || stats['TO_DO'] || 0 },
    { name: 'In Progress', value: stats.inProgress || stats['IN_PROGRESS'] || 0 },
    { name: 'Complete', value: stats.complete || stats['COMPLETE'] || 0 },
  ] : [];

  const completionPct = stats
    ? Math.round(((stats.complete || stats['COMPLETE'] || 0) / Math.max(stats.total || 1, 1)) * 100)
    : 0;

  const firstName = currentUser?.email?.split('@')[0] || 'there';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Good {getGreeting()}, {firstName} 👋</Typography>
          <Typography color="text.secondary" variant="body1" mt={0.5}>
            {format(new Date(), 'EEEE, MMMM d')} — here's your task summary
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PlusCircle size={18} />} onClick={() => navigate('/create-task')} sx={{ borderRadius: 2 }}>
          New Task
        </Button>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<CheckSquare size={22} />} label="Total Tasks" value={stats?.total ?? '—'} color="#4F46E5" loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<TrendingUp size={22} />} label="Completed" value={stats?.complete ?? stats?.['COMPLETE'] ?? '—'} color="#10B981" loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<Clock size={22} />} label="In Progress" value={stats?.inProgress ?? stats?.['IN_PROGRESS'] ?? '—'} color="#F59E0B" loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<AlertTriangle size={22} />} label="High Priority" value={stats?.highPriority ?? '—'} color="#EF4444" loading={loading} />
        </Grid>
      </Grid>

      {/* Completion progress */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>Overall Completion</Typography>
            <Typography variant="subtitle2" fontWeight={600} color="primary">{completionPct}%</Typography>
          </Box>
          <LinearProgress
            variant={loading ? 'indeterminate' : 'determinate'}
            value={completionPct}
            sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { borderRadius: 4 } }}
          />
        </CardContent>
      </Card>

      {/* Charts row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>Priority Breakdown</Typography>
              {loading ? (
                <Skeleton variant="circular" width={160} height={160} sx={{ mx: 'auto' }} />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={priorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {priorityData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [v, 'Tasks']} />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>Tasks by Status</Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 1 }} />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={statusData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={muiTheme.palette.divider} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="value" name="Tasks" radius={[6, 6, 0, 0]}>
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={Object.values(STATUS_COLORS)[i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent tasks */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Recent Tasks</Typography>
            <Button size="small" onClick={() => navigate('/view-tasks')}>View all</Button>
          </Box>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={48} sx={{ mb: 1, borderRadius: 1 }} />)
          ) : recentTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" variant="body2">No tasks yet.</Typography>
              <Button variant="contained" sx={{ mt: 2, borderRadius: 2 }} onClick={() => navigate('/create-task')}>Create your first task</Button>
            </Box>
          ) : (
            <Stack spacing={1}>
              {recentTasks.map((task) => (
                <Paper key={task.id} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }} onClick={() => navigate('/view-tasks')}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={500} noWrap>{task.title}</Typography>
                    {task.dueDate && (
                      <Typography variant="caption" color="text.secondary">
                        Due {format(parseDate(task.dueDate), 'MMM d')}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={task.priority}
                      size="small"
                      sx={{ fontSize: '0.7rem', backgroundColor: `${PRIORITY_COLORS[task.priority]}20`, color: PRIORITY_COLORS[task.priority] }}
                    />
                    <Chip
                      label={task.status}
                      size="small"
                      sx={{ fontSize: '0.7rem', backgroundColor: `${STATUS_COLORS[task.status]}20`, color: STATUS_COLORS[task.status] }}
                    />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
