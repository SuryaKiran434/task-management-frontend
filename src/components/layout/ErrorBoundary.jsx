import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Render error:', error, info);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', p: 3 }}>
        <Paper variant="outlined" sx={{ p: 4, maxWidth: 480, textAlign: 'center', borderRadius: 3 }}>
          <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: 2, backgroundColor: 'error.main', color: '#fff', mb: 2 }}>
            <AlertOctagon size={28} />
          </Box>
          <Typography variant="h6" fontWeight={700} mb={1}>Something went wrong</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={this.handleReset}>Try again</Button>
            <Button variant="contained" startIcon={<RefreshCw size={16} />} onClick={this.handleReload}>Reload page</Button>
          </Box>
        </Paper>
      </Box>
    );
  }
}
