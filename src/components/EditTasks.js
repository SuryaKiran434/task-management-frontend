import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, MenuItem,
  Button, Stack, Alert, Snackbar, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from '@mui/material';
import { ArrowLeft, Save } from 'lucide-react';
import { TaskContext } from '../contexts/TaskContext';
import { PRIORITY_OPTIONS as PRIORITIES } from '../theme/taskColors';

const STATUSES = ['To-Do', 'In Progress', 'Complete'];

export default function EditTask() {
  const { taskId } = useParams();
  const { tasks, updateTask } = useContext(TaskContext);
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [snack, setSnack] = useState(null);
  const [confirmBack, setConfirmBack] = useState(false);

  useEffect(() => {
    const task = tasks.find(t => String(t.id) === String(taskId));
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'LOW',
        status: task.status || 'To-Do',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    }
  }, [tasks, taskId]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTask(taskId, form);
      setSnack({ message: 'Task updated successfully!', severity: 'success' });
      setDirty(false);
      setTimeout(() => navigate('/view-tasks'), 900);
    } catch {
      setSnack({ message: 'Failed to update task.', severity: 'error' });
    }
  };

  const handleBackAttempt = () => {
    if (dirty) setConfirmBack(true);
    else navigate(-1);
  };

  if (!form) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Typography color="text.secondary">Loading task…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Button startIcon={<ArrowLeft size={16} />} onClick={handleBackAttempt} sx={{ mb: 3, color: 'text.secondary' }}>
        Back
      </Button>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} mb={0.5}>Edit Task</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>Update the task details below</Typography>
          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField name="title" label="Title" value={form.title} onChange={handleChange} required fullWidth />
              <TextField name="description" label="Description" value={form.description} onChange={handleChange} multiline rows={3} fullWidth />
              <Stack direction="row" spacing={2}>
                <TextField name="priority" label="Priority" select value={form.priority} onChange={handleChange} fullWidth>
                  {PRIORITIES.map(p => (
                    <MenuItem key={p.value} value={p.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: p.color }} />
                        {p.label}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
                <TextField name="status" label="Status" select value={form.status} onChange={handleChange} fullWidth>
                  {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Stack>
              <TextField name="dueDate" label="Due Date" type="date" value={form.dueDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
              <Stack direction="row" spacing={2} pt={1}>
                <Button type="button" variant="outlined" onClick={handleBackAttempt} fullWidth>Cancel</Button>
                <Button type="submit" variant="contained" startIcon={<Save size={16} />} fullWidth sx={{ borderRadius: 2 }}>Save Changes</Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>

      <Dialog open={confirmBack} onClose={() => setConfirmBack(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent><Typography>You have unsaved changes. Are you sure you want to leave?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmBack(false)}>Stay</Button>
          <Button onClick={() => navigate(-1)} color="warning" variant="contained">Leave</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snack && <Alert severity={snack.severity} onClose={() => setSnack(null)}>{snack.message}</Alert>}
      </Snackbar>
    </Box>
  );
}
