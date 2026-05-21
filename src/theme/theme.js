import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#4F46E5',
        light: '#818CF8',
        dark: '#3730A3',
        contrastText: '#fff',
      },
      secondary: {
        main: '#7C3AED',
        light: '#A78BFA',
        dark: '#5B21B6',
        contrastText: '#fff',
      },
      success: { main: '#10B981', light: '#34D399', dark: '#059669' },
      warning: { main: '#F59E0B', light: '#FCD34D', dark: '#D97706' },
      error:   { main: '#EF4444', light: '#FCA5A5', dark: '#DC2626' },
      info:    { main: '#3B82F6', light: '#93C5FD', dark: '#1D4ED8' },
      ...(isDark ? {
        background: { default: '#0F172A', paper: '#1E293B' },
        text: { primary: '#F1F5F9', secondary: '#94A3B8', disabled: '#475569' },
        divider: 'rgba(148,163,184,0.12)',
        action: {
          hover:              'rgba(248,250,252,0.06)',
          selected:           'rgba(79,70,229,0.14)',
          disabled:           'rgba(248,250,252,0.26)',
          disabledBackground: 'rgba(248,250,252,0.10)',
          focus:              'rgba(248,250,252,0.10)',
        },
      } : {
        background: { default: '#F8FAFC', paper: '#FFFFFF' },
        text: { primary: '#0F172A', secondary: '#64748B', disabled: '#94A3B8' },
        divider: 'rgba(15,23,42,0.08)',
        action: {
          hover:    'rgba(15,23,42,0.04)',
          selected: 'rgba(79,70,229,0.08)',
          focus:    'rgba(15,23,42,0.06)',
        },
      }),
    },

    typography: {
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
      h2: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 },
      h3: { fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.3 },
      h4: { fontWeight: 600, lineHeight: 1.3 },
      h5: { fontWeight: 600, lineHeight: 1.4 },
      h6: { fontWeight: 600, lineHeight: 1.4 },
      body1: { lineHeight: 1.6 },
      body2: { lineHeight: 1.55 },
      caption: { lineHeight: 1.4 },
      button: { textTransform: 'none', fontWeight: 500 },
    },

    shape: { borderRadius: 10 },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*, *::before, *::after': { boxSizing: 'border-box' },
          'html, body, #root': {
            height: '100%',
            margin: 0,
            padding: 0,
          },
          '.error-message': {
            color: isDark ? '#FCA5A5' : '#EF4444',
            marginTop: 8,
            fontSize: '0.875rem',
          },
          'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus': {
            WebkitBoxShadow: `0 0 0 1000px ${isDark ? '#1E293B' : '#fff'} inset !important`,
            WebkitTextFillColor: `${isDark ? '#F1F5F9' : '#0F172A'} !important`,
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 20px',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
            '&:focus-visible': {
              outline: `2px solid ${isDark ? '#818CF8' : '#4F46E5'}`,
              outlineOffset: 2,
            },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #3730A3 0%, #5B21B6 100%)',
              boxShadow: '0 4px 14px rgba(79,70,229,0.4)',
            },
          },
          outlined: {
            borderColor: isDark ? 'rgba(148,163,184,0.25)' : 'rgba(15,23,42,0.15)',
            '&:hover': {
              borderColor: '#4F46E5',
              backgroundColor: 'rgba(79,70,229,0.06)',
            },
          },
          text: {
            '&:hover': { backgroundColor: isDark ? 'rgba(248,250,252,0.06)' : 'rgba(15,23,42,0.04)' },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&:focus-visible': {
              outline: `2px solid ${isDark ? '#818CF8' : '#4F46E5'}`,
              outlineOffset: 2,
            },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundImage: 'none',
            boxShadow: isDark
              ? '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(148,163,184,0.06)'
              : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          outlined: {
            borderColor: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.08)',
          },
          elevation1: {
            boxShadow: isDark
              ? '0 1px 3px rgba(0,0,0,0.4)'
              : '0 1px 3px rgba(0,0,0,0.08)',
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: 'none',
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            color: isDark ? '#F1F5F9' : '#0F172A',
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            borderRight: 'none',
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.08)',
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 6, fontWeight: 500, fontSize: '0.75rem' },
          outlined: {
            borderColor: isDark ? 'rgba(148,163,184,0.25)' : 'rgba(15,23,42,0.15)',
          },
        },
      },

      MuiTextField: {
        defaultProps: { size: 'small' },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(30,41,59,0.6)' : '#fff',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? 'rgba(148,163,184,0.4)' : 'rgba(15,23,42,0.3)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
              borderColor: '#4F46E5',
            },
          },
          notchedOutline: {
            borderColor: isDark ? 'rgba(148,163,184,0.2)' : 'rgba(15,23,42,0.15)',
          },
          input: {
            '&::placeholder': {
              color: isDark ? '#475569' : '#94A3B8',
              opacity: 1,
            },
          },
        },
      },

      MuiInputBase: {
        styleOverrides: {
          input: {
            '&::placeholder': {
              color: isDark ? '#475569' : '#94A3B8',
              opacity: 1,
            },
          },
        },
      },

      MuiSelect: {
        defaultProps: { size: 'small' },
      },

      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isDark ? 'rgba(148,163,184,0.1)' : 'rgba(15,23,42,0.06)'}`,
            padding: '14px 16px',
            lineHeight: 1.5,
          },
          head: {
            fontWeight: 600,
            fontSize: '0.78rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: isDark ? '#94A3B8' : '#64748B',
            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:last-child td': { borderBottom: 'none' },
            '&:hover': {
              backgroundColor: isDark ? 'rgba(248,250,252,0.03)' : 'rgba(15,23,42,0.02)',
            },
          },
        },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundColor: isDark ? 'rgba(79,70,229,0.15)' : 'rgba(79,70,229,0.1)',
          },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 10 },
          standardError:   { backgroundColor: isDark ? 'rgba(239,68,68,0.12)'  : 'rgba(239,68,68,0.08)'  },
          standardWarning: { backgroundColor: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)' },
          standardSuccess: { backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)' },
          standardInfo:    { backgroundColor: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)' },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 6,
            fontSize: '0.72rem',
            fontWeight: 500,
            backgroundColor: isDark ? '#334155' : '#1E293B',
            padding: '5px 10px',
          },
          arrow: {
            color: isDark ? '#334155' : '#1E293B',
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 16, backgroundImage: 'none' },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },

      MuiToggleButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            borderColor: isDark ? 'rgba(148,163,184,0.2)' : 'rgba(15,23,42,0.12)',
            color: isDark ? '#94A3B8' : '#64748B',
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(79,70,229,0.2)' : 'rgba(79,70,229,0.1)',
              color: '#4F46E5',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(79,70,229,0.25)' : 'rgba(79,70,229,0.15)',
              },
            },
          },
        },
      },

      MuiSnackbar: {
        defaultProps: { anchorOrigin: { vertical: 'bottom', horizontal: 'right' } },
      },
    },
  });
};

export default getTheme;
