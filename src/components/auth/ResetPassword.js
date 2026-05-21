import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Alert, Link, Stack } from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';
import userService from '../../services/userService';
import { AuthField, AuthInput } from './AuthInput';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await userService.forgotPassword(email);
      setInfo(res?.otp ? `Dev mode — OTP: ${res.otp}` : (res?.message || 'OTP sent! Check your email.'));
      setStep(1);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await userService.resetPassword(email, otp, newPassword);
      setInfo('Password reset! Redirecting…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const btnSx = { borderRadius: '10px', py: 1.5, fontWeight: 600, fontSize: '0.95rem' };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

      {/* Left panel */}
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
        <Typography variant="h6" fontWeight={400} sx={{ opacity: 0.85, lineHeight: 1.5 }}>Secure password reset in two steps</Typography>
      </Box>

      {/* Right panel */}
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
          <Typography variant="h5" fontWeight={700} mb={0.75}>
            {step === 0 ? 'Reset your password' : 'Check your email'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            {step === 0 ? "Enter your email and we'll send a one-time code." : `We sent a 6-digit code to ${email}`}
          </Typography>

          {info && <Alert severity={info.startsWith('Password reset') ? 'success' : 'info'} sx={{ mb: 3, borderRadius: 2 }}>{info}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          {step === 0 ? (
            <form onSubmit={handleRequestOtp}>
              <Stack spacing={2.5}>
                <AuthField label="Email">
                  <AuthInput type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                </AuthField>
                <Button type="submit" variant="contained" fullWidth disabled={loading} size="large" sx={btnSx}>
                  {loading ? 'Sending…' : 'Send OTP'}
                </Button>
              </Stack>
            </form>
          ) : (
            <form onSubmit={handleReset}>
              <Stack spacing={2.5}>
                <AuthField label="OTP code">
                  <AuthInput placeholder="6-digit code" value={otp} onChange={e => setOtp(e.target.value)} required autoFocus inputProps={{ maxLength: 6 }} />
                </AuthField>
                <AuthField label="New password">
                  <AuthInput
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars, upper, lower & special"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    endAdornment={
                      <IconButton onClick={() => setShowPassword(v => !v)} size="small" tabIndex={-1} sx={{ color: 'text.disabled', '&:hover': { color: 'text.secondary' }, p: 0.5 }}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </IconButton>
                    }
                  />
                </AuthField>
                <Button type="submit" variant="contained" fullWidth disabled={loading} size="large" sx={btnSx}>
                  {loading ? 'Resetting…' : 'Reset password'}
                </Button>
                <Button variant="text" size="small" onClick={() => { setStep(0); setError(''); setInfo(''); }}>
                  ← Use a different email
                </Button>
              </Stack>
            </form>
          )}

          <Typography variant="body2" textAlign="center" mt={4} color="text.secondary">
            Remembered it?{' '}
            <Link component={RouterLink} to="/login" fontWeight={600} color="primary.main" underline="hover">Sign in</Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
