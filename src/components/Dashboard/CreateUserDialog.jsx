import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Stack, FormControlLabel, Switch, InputAdornment, IconButton,
  Typography, Alert,
} from '@mui/material';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import userService from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', assignAdmin: false };

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function CreateUserDialog({ open, onClose, onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setServerError('');
    setShowPassword(false);
  };

  const handleChange = (field) => (e) => {
    const value = field === 'assignAdmin' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = 'First name is required';
    if (!form.lastName.trim())  next.lastName  = 'Last name is required';
    if (!form.email.trim())     next.email     = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email';
    if (!form.password)         next.password  = 'Password is required';
    else if (!PASSWORD_RULE.test(form.password)) {
      next.password = 'Min 8 chars with uppercase, lowercase, number, and special character';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const created = await userService.adminCreateUser({
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim(),
        password:  form.password,
        assignAdmin: form.assignAdmin,
      });
      toast.success(`Created user ${created.email}${form.assignAdmin ? ' (admin)' : ''}`);
      onCreated?.(created);
      reset();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data?.fieldErrors) {
        setErrors(data.fieldErrors);
      }
      setServerError(data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={1.25}>
            <UserPlus size={20} />
            <Typography variant="h6" fontWeight={700} component="span">New User</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {serverError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{serverError}</Alert>}
          <Stack spacing={2.25} mt={0.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="First name"
                value={form.firstName}
                onChange={handleChange('firstName')}
                error={Boolean(errors.firstName)}
                helperText={errors.firstName}
                fullWidth
                autoFocus
                required
              />
              <TextField
                label="Last name"
                value={form.lastName}
                onChange={handleChange('lastName')}
                error={Boolean(errors.lastName)}
                helperText={errors.lastName}
                fullWidth
                required
              />
            </Stack>
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              error={Boolean(errors.email)}
              helperText={errors.email}
              fullWidth
              required
              autoComplete="off"
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange('password')}
              error={Boolean(errors.password)}
              helperText={errors.password || 'Min 8 chars, with upper, lower, number, and special character'}
              fullWidth
              required
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small" tabIndex={-1}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControlLabel
              control={<Switch checked={form.assignAdmin} onChange={handleChange('assignAdmin')} />}
              label="Grant admin privileges"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create user'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
