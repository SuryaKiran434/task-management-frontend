import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [open, setOpen] = useState(false);

  // `current` is read through a ref inside `enqueue` so that `enqueue` — and
  // therefore the whole toast API object — keeps a stable identity for the
  // lifetime of the provider. Previously `enqueue` depended on `current`, so
  // every toast produced a brand-new context value; consumers that list the
  // toast API in a `useCallback`/`useEffect` dependency array (TaskContext's
  // fetchTasks -> AllTasks' loadTasks effect) were re-created and re-fetched
  // on every toast.
  const currentRef = useRef(null);
  currentRef.current = current;

  const showNext = useCallback((next) => {
    currentRef.current = next;
    setCurrent(next);
    setOpen(true);
  }, []);

  const enqueue = useCallback((message, severity = 'info', duration = 3000) => {
    const item = { message, severity, duration, key: Date.now() + Math.random() };
    if (!currentRef.current) showNext(item);
    else setQueue((q) => [...q, item]);
  }, [showNext]);

  const handleClose = useCallback((_e, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  }, []);

  const handleExited = useCallback(() => {
    currentRef.current = null;
    setCurrent(null);
    setQueue((q) => {
      if (q.length === 0) return q;
      const [next, ...rest] = q;
      showNext(next);
      return rest;
    });
  }, [showNext]);

  const api = useMemo(() => ({
    success: (msg, duration) => enqueue(msg, 'success', duration),
    error:   (msg, duration) => enqueue(msg, 'error', duration ?? 5000),
    warning: (msg, duration) => enqueue(msg, 'warning', duration),
    info:    (msg, duration) => enqueue(msg, 'info', duration),
    notify:  enqueue,
  }), [enqueue]);

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
