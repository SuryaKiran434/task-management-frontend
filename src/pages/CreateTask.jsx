import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, MenuItem,
  Button, Stack, Alert, Snackbar, Divider,
} from '@mui/material';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { useTaskActions } from '../contexts/TaskContext';
import { PRIORITY_OPTIONS as PRIORITIES } from '../theme/taskColors';

const STATUSES = ['To-Do', 'In Progress', 'Complete'];

export default function CreateTask() {
  const { createTask } = useTaskActions();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: '', description: '', priority: 'LOW', dueDate: '', status: 'To-Do' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.dueDate) e.dueDate = 'Due date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createTask(form);
      setSnack({ message: 'Task created successfully!', severity: 'success' });
      setTimeout(() => navigate('/view-tasks'), 1000);
    } catch {
      setSnack({ message: 'Failed to create task. Please try again.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} sx={{ mb: 3, color: 'text.secondary' }}>
        Back
      </Button>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box sx={{ p: 1, borderRadius: 2, backgroundColor: 'rgba(79,70,229,0.1)', color: 'primary.main' }}>
              <PlusCircle size={20} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>New Task</Typography>
              <Typography variant="body2" color="text.secondary">Fill in the details for your new task</Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                name="title"
                label="Task Title"
                value={form.title}
                onChange={handleChange}
                error={Boolean(errors.title)}
                helperText={errors.title}
                required
                fullWidth
                placeholder="e.g. Design new landing page"
              />

              <TextField
                name="description"
                label="Description"
                value={form.description}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
                placeholder="Describe the task in detail..."
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  name="priority"
                  label="Priority"
                  select
                  value={form.priority}
                  onChange={handleChange}
                  fullWidth
                >
                  {PRIORITIES.map(p => (
                    <MenuItem key={p.value} value={p.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: p.color }} />
                        {p.label}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  name="status"
                  label="Status"
                  select
                  value={form.status}
                  onChange={handleChange}
                  fullWidth
                >
                  {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Stack>

              <TextField
                name="dueDate"
                label="Due Date"
                type="date"
                value={form.dueDate}
                onChange={handleChange}
                error={Boolean(errors.dueDate)}
                helperText={errors.dueDate}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
              />

              <Stack direction="row" spacing={2} pt={1}>
                <Button type="button" variant="outlined" onClick={() => navigate(-1)} fullWidth>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={submitting} fullWidth sx={{ borderRadius: 2 }}>
                  {submitting ? 'Creating…' : 'Create Task'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>

      <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snack && <Alert severity={snack.severity} onClose={() => setSnack(null)}>{snack.message}</Alert>}
      </Snackbar>
    </Box>
  );
}
