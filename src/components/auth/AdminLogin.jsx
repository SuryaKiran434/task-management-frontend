import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, Alert, Link, Stack,
} from '@mui/material';
import { Eye, EyeOff, Shield, Lock, Users, Settings } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { AuthField, AuthInput } from './AuthInput';

const ADMIN_PERKS = [
  'Manage all users and their roles',
  'View and assign tasks across the team',
  'Access system-wide analytics',
];

export default function AdminLogin() {
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
      const response = await login(email, password);
      if (response?.roles?.includes('ROLE_ADMIN')) {
        navigate('/admin-dashboard');
      } else {
        setError('This account does not have administrator privileges.');
      }
    } catch {
      setError('Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

      {/* Left branded panel */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        width: '42%',
        flexDirection: 'column',
        justifyContent: 'center',
        px: 8,
        background: 'linear-gradient(145deg, #1E293B 0%, #0F172A 60%, #020617 100%)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', backgroundColor: 'rgba(79,70,229,0.12)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', backgroundColor: 'rgba(124,58,237,0.1)' }} />

        {/* Badge */}
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 1,
          px: 1.5, py: 0.6, mb: 4, width: 'fit-content',
          borderRadius: 10, border: '1px solid rgba(79,70,229,0.4)',
          backgroundColor: 'rgba(79,70,229,0.12)',
        }}>
          <Shield size={13} color="#818CF8" />
          <Typography variant="caption" sx={{ color: '#818CF8', fontWeight: 600, letterSpacing: 0.3 }}>
            Admin Portal
          </Typography>
        </Box>

        <Typography variant="h4" fontWeight={800} mb={1} letterSpacing="-0.02em">
          TaskFlow
        </Typography>
        <Typography variant="h6" fontWeight={400} sx={{ opacity: 0.7, mb: 5, lineHeight: 1.5 }}>
          Administration dashboard
        </Typography>

        <Stack spacing={2.5}>
          {ADMIN_PERKS.map((p, i) => {
            const icons = [<Users size={16} />, <Settings size={16} />, <Lock size={16} />];
            return (
              <Box key={p} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{ mt: 0.15, opacity: 0.7, flexShrink: 0 }}>{icons[i]}</Box>
                <Typography variant="body2" sx={{ opacity: 0.75, lineHeight: 1.55 }}>{p}</Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* Right form panel */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(79,70,229,0.1)', color: 'primary.main',
            }}>
              <Shield size={18} />
            </Box>
            <Typography variant="h5" fontWeight={700}>Admin sign in</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Restricted to administrators only
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <AuthField label="Email">
                <AuthInput
                  type="email"
                  placeholder="admin@example.com"
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
                    <IconButton
                      onClick={() => setShowPassword(v => !v)}
                      size="small"
                      tabIndex={-1}
                      sx={{ color: 'text.disabled', '&:hover': { color: 'text.secondary' }, p: 0.5 }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  }
                />
              </AuthField>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                size="large"
                sx={{ borderRadius: '10px', py: 1.5, fontWeight: 600, fontSize: '0.95rem', mt: 0.5 }}
              >
                {loading ? 'Signing in…' : 'Sign in as admin'}
              </Button>
            </Stack>
          </form>

          <Typography variant="body2" textAlign="center" mt={4} color="text.secondary">
            Not an admin?{' '}
            <Link component={RouterLink} to="/login" fontWeight={600} color="primary.main" underline="hover">
              Regular sign in
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
