import React from 'react';
import { useNavigate } from 'react-router';
import { Box, Typography, Button } from '@mui/material';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: 'background.default' }}>
      <Typography variant="h1" fontWeight={800} sx={{ fontSize: '6rem', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        404
      </Typography>
      <Typography variant="h5" fontWeight={600}>Page not found</Typography>
      <Typography color="text.secondary" variant="body2" textAlign="center" maxWidth={360}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button variant="contained" startIcon={<Home size={16} />} onClick={() => navigate('/')} sx={{ mt: 2, borderRadius: 2 }}>
        Go home
      </Button>
    </Box>
  );
}
