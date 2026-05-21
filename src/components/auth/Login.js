import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Alert, Link, Stack } from '@mui/material';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { AuthField, AuthInput } from './AuthInput';

const PERKS = [
  'Track tasks with priorities, due dates & labels',
  'Visual dashboard with charts & progress',
  'Real-time notifications & activity feed',
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
        <Typography variant="h6" fontWeight={400} sx={{ opacity: 0.85, mb: 5, lineHeight: 1.5 }}>
          The workspace that keeps you in flow
        </Typography>
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
        <Box sx={{ width: '100%', maxWidth: 380 }}>
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
        </Box>
      </Box>
    </Box>
  );
}
