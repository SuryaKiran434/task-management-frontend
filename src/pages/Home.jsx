import React, { useContext } from 'react';
import { useNavigate } from 'react-router';
import {
  Box, Button, Container, Typography, Stack, Grid, Paper,
} from '@mui/material';
import { CheckSquare, Zap, Shield, BarChart2, Moon, Sun } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';

const features = [
  { icon: <CheckSquare size={26} />, title: 'Smart Task Management', desc: 'Create, organize, and track tasks with priorities, due dates, labels, and subtask checklists.' },
  { icon: <BarChart2 size={26} />, title: 'Visual Insights', desc: 'Dashboard charts give you an instant snapshot of your workload, completion trends, and priority distribution.' },
  { icon: <Zap size={26} />, title: 'Blazing Fast', desc: 'Built on Spring Boot with HikariCP connection pooling and rate limiting — responsive under any load.' },
  { icon: <Shield size={26} />, title: 'Secure by Default', desc: 'JWT authentication with refresh tokens, bcrypt password hashing, and role-based access control.' },
];

export default function Home() {
  const navigate = useNavigate();
  const { theme: mode, toggleTheme } = useContext(ThemeContext);

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', backgroundColor: 'background.paper', display: 'flex', flexDirection: 'column' }}>

      {/* ── Navbar ── */}
      <Box component="nav" sx={{
        position: 'sticky', top: 0, zIndex: 100,
        width: '100%',
        px: 4, height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Typography variant="h6" fontWeight={700} sx={{
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
        }}>
          TaskFlow
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          {/* Square theme toggle */}
          <Box
            component="button"
            onClick={toggleTheme}
            sx={{
              width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid', borderColor: 'divider',
              borderRadius: 1.5,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              color: 'text.secondary',
              transition: 'background-color 0.15s',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
            {mode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </Box>

          <Button
            variant="text"
            size="small"
            onClick={() => navigate('/login')}
            sx={{ color: 'text.primary', fontWeight: 500, minWidth: 'auto', px: 1.5 }}
          >
            Sign in
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/register')}
            sx={{ borderRadius: 1.5, px: 2, fontWeight: 600 }}
          >
            Get started
          </Button>
        </Stack>
      </Box>

      {/* ── Hero ── */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: 2, pt: 10, pb: 8 }}>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.75,
          px: 1.75, py: 0.5, mb: 4,
          borderRadius: 10,
          border: '1px solid', borderColor: 'primary.light',
          backgroundColor: 'rgba(79,70,229,0.06)',
        }}>
          <Zap size={13} color="#4F46E5" />
          <Typography variant="caption" color="primary.main" fontWeight={600} letterSpacing={0.3}>
            Built for productivity
          </Typography>
        </Box>

        <Typography
          variant="h2"
          fontWeight={800}
          sx={{ lineHeight: 1.12, letterSpacing: '-0.03em', mb: 2.5, maxWidth: 720 }}
        >
          Manage your tasks{' '}
          <Box component="span" sx={{
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            beautifully
          </Box>
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 480, mb: 5, lineHeight: 1.7, fontSize: '1.05rem' }}
        >
          Stay on top of your work with smart task tracking, visual dashboards,
          and real-time notifications — all in one place.
        </Typography>

        {/* CTA row — fixed width, side by side */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{ px: 4, py: 1.25, fontWeight: 600, borderRadius: 2, width: 180 }}
          >
            Start for free
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/login')}
            sx={{ px: 4, py: 1.25, fontWeight: 600, borderRadius: 2, width: 180 }}
          >
            Sign in
          </Button>
        </Stack>
      </Box>

      {/* ── Feature cards ── */}
      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Typography variant="h5" fontWeight={700} textAlign="center" mb={4} color="text.primary">
          Everything you need to stay organized
        </Typography>
        <Grid container spacing={3}>
          {features.map((f) => (
            <Grid item xs={12} sm={6} md={3} key={f.title}>
              <Paper elevation={0} sx={{
                p: 3, height: '100%',
                border: '1px solid', borderColor: 'divider',
                borderRadius: 3,
                transition: 'box-shadow 0.2s, transform 0.2s',
                '&:hover': { boxShadow: 3, transform: 'translateY(-3px)' },
              }}>
                <Box sx={{
                  width: 48, height: 48,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 2,
                  backgroundColor: 'rgba(79,70,229,0.08)',
                  color: 'primary.main',
                  mb: 2,
                }}>
                  {f.icon}
                </Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>{f.title}</Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.65}>{f.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ── Footer ── */}
      <Box sx={{ textAlign: 'center', py: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          © 2025 TaskFlow · All rights reserved
        </Typography>
      </Box>
    </Box>
  );
}
