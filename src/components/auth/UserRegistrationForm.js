import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Alert, Link, Stack } from '@mui/material';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import userService from '../../services/userService';
import { AuthField, AuthInput } from './AuthInput';

const PERKS = [
  'Free forever for personal use',
  'Unlimited tasks, labels & subtasks',
  'Dashboard analytics from day one',
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
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

      {/* ── Left branded panel ── */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        width: '42%',
        flexDirection: 'column',
        justifyContent: 'center',
        px: 8,
        background: 'linear-gradient(145deg, #4F46E5 0%, #7C3AED 60%, #6D28D9 100%)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <Typography variant="h4" fontWeight={800} mb={1} letterSpacing="-0.02em">TaskFlow</Typography>
        <Typography variant="h6" fontWeight={400} sx={{ opacity: 0.85, mb: 5, lineHeight: 1.5 }}>Get organized in minutes</Typography>
        <Stack spacing={2.5}>
          {PERKS.map(p => (
            <Box key={p} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <CheckCircle2 size={18} style={{ marginTop: 2, flexShrink: 0, opacity: 0.9 }} />
              <Typography variant="body2" sx={{ opacity: 0.88, lineHeight: 1.55 }}>{p}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* ── Right form panel ── */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 3, sm: 6, md: 8 },
        backgroundColor: 'background.paper',
      }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
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
        </Box>
      </Box>
    </Box>
  );
}
