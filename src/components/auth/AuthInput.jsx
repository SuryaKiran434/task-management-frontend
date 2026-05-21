import React, { useRef } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

export function AuthField({ label, children }) {
  return (
    <Box>
      <Typography
        component="label"
        variant="caption"
        fontWeight={600}
        color="text.secondary"
        display="block"
        mb={0.75}
        sx={{ fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase', userSelect: 'none' }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );
}

export function AuthInput({ endAdornment, ...props }) {
  const theme = useTheme();
  const wrapperRef = useRef(null);

  const handleFocus = () => {
    if (wrapperRef.current) {
      wrapperRef.current.style.borderColor = theme.palette.primary.main;
      wrapperRef.current.style.boxShadow = `0 0 0 3px ${theme.palette.primary.main}22`;
    }
  };
  const handleBlur = () => {
    if (wrapperRef.current) {
      wrapperRef.current.style.borderColor = theme.palette.divider;
      wrapperRef.current.style.boxShadow = 'none';
    }
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        border: `1.5px solid ${theme.palette.divider}`,
        borderRadius: 10,
        padding: '0 14px',
        height: 48,
        gap: 8,
        backgroundColor: theme.palette.background.paper,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxSizing: 'border-box',
      }}
    >
      <input
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 15,
          color: theme.palette.text.primary,
          fontFamily: theme.typography.fontFamily,
          width: '100%',
          padding: 0,
          margin: 0,
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
          boxShadow: 'none',
        }}
        {...props}
      />
      {endAdornment && (
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {endAdornment}
        </div>
      )}
    </div>
  );
}
