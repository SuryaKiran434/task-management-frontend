import React, { createContext, useCallback, useContext, useState } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [open, setOpen] = useState(false);

  const showNext = useCallback((next) => {
    setCurrent(next);
    setOpen(true);
  }, []);

  const enqueue = useCallback((message, severity = 'info', duration = 3000) => {
    const item = { message, severity, duration, key: Date.now() + Math.random() };
    if (!current) showNext(item);
    else setQueue((q) => [...q, item]);
  }, [current, showNext]);

  const handleClose = (_e, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const handleExited = () => {
    setCurrent(null);
    setQueue((q) => {
      if (q.length === 0) return q;
      const [next, ...rest] = q;
      showNext(next);
      return rest;
    });
  };

  const api = {
    success: (msg, duration) => enqueue(msg, 'success', duration),
    error:   (msg, duration) => enqueue(msg, 'error', duration ?? 5000),
    warning: (msg, duration) => enqueue(msg, 'warning', duration),
    info:    (msg, duration) => enqueue(msg, 'info', duration),
    notify:  enqueue,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Snackbar
        key={current?.key}
        open={open}
        autoHideDuration={current?.duration ?? 3000}
        onClose={handleClose}
        TransitionComponent={Slide}
        TransitionProps={{ onExited: handleExited }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {current ? (
          <Alert
            onClose={handleClose}
            severity={current.severity}
            variant="filled"
            sx={{ borderRadius: 2, alignItems: 'center', minWidth: 280 }}
          >
            {current.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
