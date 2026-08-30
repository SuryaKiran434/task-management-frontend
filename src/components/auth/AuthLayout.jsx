import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { CheckCircle2 } from 'lucide-react';

/**
 * The split-screen shell every unauthenticated page uses: a branded panel on
 * the left, the form on the right.
 *
 * Login, AdminLogin, UserRegistrationForm and ResetPassword each carried their
 * own copy of it — the same gradient Box, the same two decorative circles, the
 * same responsive breakpoints, the same right-hand column widths. SonarCloud
 * counted 148 duplicated lines across the four. That is not only a metric: the
 * panels had already drifted apart in small ways (one dropped the `mb` under
 * its tagline, one used a different circle opacity), which is what copy-paste
 * does to a layout over time.
 *
 * Everything that genuinely differs between the four is a prop. Everything
 * that never differed is here once.
 */
export default function AuthLayout({
  gradient,
  circles = ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.05)'],
  badge,
  title,
  tagline,
  perks = [],
  // Registration asks for more fields than the others and had its own width.
  // Kept as a difference rather than flattened to 380 for tidiness.
  maxWidth = 380,
  children,
}) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

      {/* Branded panel. Hidden below md: on a phone the form takes the screen. */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        width: '42%',
        flexDirection: 'column',
        justifyContent: 'center',
        px: 8,
        background: gradient,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', backgroundColor: circles[0] }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', backgroundColor: circles[1] }} />

        {badge}

        <Typography variant="h4" fontWeight={800} mb={1} letterSpacing="-0.02em">{title}</Typography>
        <Typography
          variant="h6"
          fontWeight={400}
          sx={{ opacity: 0.85, mb: perks.length ? 5 : 0, lineHeight: 1.5 }}
        >
          {tagline}
        </Typography>

        {perks.length > 0 && (
          <Stack spacing={2.5}>
            {perks.map(({ text, icon }) => (
              <Box key={text} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{ mt: 0.15, opacity: 0.85, flexShrink: 0, display: 'flex' }}>
                  {icon || <CheckCircle2 size={18} />}
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.88, lineHeight: 1.55 }}>{text}</Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* Form panel */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 3, sm: 6, md: 8 },
        backgroundColor: 'background.paper',
      }}>
        <Box sx={{ width: '100%', maxWidth }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

// The two gradients in use. Named so a fifth auth page cannot invent a third.
export const BRAND_GRADIENT = 'linear-gradient(145deg, #4F46E5 0%, #7C3AED 60%, #6D28D9 100%)';
export const ADMIN_GRADIENT = 'linear-gradient(145deg, #1E293B 0%, #0F172A 60%, #020617 100%)';
