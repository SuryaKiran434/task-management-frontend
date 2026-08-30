import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router';
import { Typography, Button, IconButton, Alert, Link, Stack, Box } from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { AuthField, AuthInput } from './AuthInput';
import AuthLayout, { BRAND_GRADIENT } from './AuthLayout';

const PERKS = [
  { text: 'Track tasks with priorities, due dates & labels' },
  { text: 'Visual dashboard with charts & progress' },
  { text: 'Real-time notifications & activity feed' },
];

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      gradient={BRAND_GRADIENT}
      title="TaskFlow"
      tagline="The workspace that keeps you in flow"
      perks={PERKS}
    >
      <Typography variant="h5" fontWeight={700} mb={0.75}>Welcome back</Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>Sign in to continue to TaskFlow</Typography>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <AuthField label="Email">
            <AuthInput
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
          </AuthField>

          <AuthField label="Password">
            <AuthInput
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              endAdornment={
                <IconButton onClick={() => setShowPassword(v => !v)} size="small" tabIndex={-1} sx={{ color: 'text.disabled', '&:hover': { color: 'text.secondary' }, p: 0.5 }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </IconButton>
              }
            />
          </AuthField>

          <Box sx={{ textAlign: 'right', mt: -1 }}>
            <Link component={RouterLink} to="/reset-password" variant="caption" color="primary.main" underline="hover">
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            size="large"
            sx={{ borderRadius: '10px', py: 1.5, fontWeight: 600, fontSize: '0.95rem', mt: 0.5 }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </Stack>
      </form>

      <Typography variant="body2" textAlign="center" mt={4} color="text.secondary">
        Don't have an account?{' '}
        <Link component={RouterLink} to="/register" fontWeight={600} color="primary.main" underline="hover">
          Sign up free
        </Link>
      </Typography>
    </AuthLayout>
  );
}
