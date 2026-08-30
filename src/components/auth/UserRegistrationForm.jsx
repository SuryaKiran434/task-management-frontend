import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router';
import { Box, Typography, Button, IconButton, Alert, Link, Stack } from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';
import userService from '../../services/userService';
import { AuthField, AuthInput } from './AuthInput';
import AuthLayout, { BRAND_GRADIENT } from './AuthLayout';

const PERKS = [
  { text: 'Free forever for personal use' },
  { text: 'Unlimited tasks, labels & subtasks' },
  { text: 'Dashboard analytics from day one' },
];

export default function UserRegistrationForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (name) => (e) => setForm(prev => ({ ...prev, [name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await userService.registerUser(form);
      navigate('/login', { state: { message: 'Account created! Please sign in.' } });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed.';
      setError(typeof msg === 'string' ? msg : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      gradient={BRAND_GRADIENT}
      title="TaskFlow"
      tagline="Get organized in minutes"
      perks={PERKS}
      maxWidth={400}
    >
      <Typography variant="h5" fontWeight={700} mb={0.75}>Create your account</Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>It's free. No credit card required.</Typography>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.5}>
            <AuthField label="First name">
              <AuthInput
                placeholder="Jane"
                value={form.firstName}
                onChange={set('firstName')}
                required
                autoFocus
                autoComplete="given-name"
              />
            </AuthField>
            <AuthField label="Last name">
              <AuthInput
                placeholder="Doe"
                value={form.lastName}
                onChange={set('lastName')}
                required
                autoComplete="family-name"
              />
            </AuthField>
          </Stack>

          <AuthField label="Email">
            <AuthInput
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              required
              autoComplete="email"
            />
          </AuthField>

          <AuthField label="Password">
            <AuthInput
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 chars, upper, lower & special"
              value={form.password}
              onChange={set('password')}
              required
              autoComplete="new-password"
              endAdornment={
                <IconButton onClick={() => setShowPassword(v => !v)} size="small" tabIndex={-1} sx={{ color: 'text.disabled', '&:hover': { color: 'text.secondary' }, p: 0.5 }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </IconButton>
              }
            />
          </AuthField>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitting}
            size="large"
            sx={{ borderRadius: '10px', py: 1.5, fontWeight: 600, fontSize: '0.95rem', mt: 0.5 }}
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </Stack>
      </form>

      <Typography variant="body2" textAlign="center" mt={4} color="text.secondary">
        Already have an account?{' '}
        <Link component={RouterLink} to="/login" fontWeight={600} color="primary.main" underline="hover">
          Sign in
        </Link>
      </Typography>
    </AuthLayout>
  );
}
