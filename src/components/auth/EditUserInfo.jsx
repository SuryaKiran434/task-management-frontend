import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Stack, Alert, Snackbar, Divider,
} from '@mui/material';
import { ArrowLeft, Save } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import userService from '../../services/userService';

const EditUserInfo = () => {
  const { userId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState(null);

  const id = userId || currentUser?.id;

  useEffect(() => {
    if (id) {
      userService.getUserInfo(id)
        .then(data => setForm({ firstName: data.firstName || '', lastName: data.lastName || '', email: data.email || '' }))
        .catch(() => setError('Failed to fetch user information'));
    } else {
      setError('User ID not available');
    }
  }, [id]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.updateUserInfo(userId, form);
      setSnack({ message: 'Profile updated!', severity: 'success' });
      setTimeout(() => navigate(`/view-information/${userId}`), 900);
    } catch {
      setError('Failed to update profile');
    }
  };

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto' }}>
      <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} sx={{ mb: 3, color: 'text.secondary' }}>
        Back
      </Button>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} mb={0.5}>Edit Profile</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>Update your personal information</Typography>
          <Divider sx={{ mb: 3 }} />

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={2}>
                <TextField name="firstName" label="First Name" value={form.firstName} onChange={handleChange} required fullWidth />
                <TextField name="lastName" label="Last Name" value={form.lastName} onChange={handleChange} required fullWidth />
              </Stack>
              <TextField name="email" label="Email" type="email" value={form.email} onChange={handleChange} required fullWidth />
              <Stack direction="row" spacing={2} pt={1}>
                <Button type="button" variant="outlined" onClick={() => navigate(-1)} fullWidth>Cancel</Button>
                <Button type="submit" variant="contained" startIcon={<Save size={16} />} fullWidth sx={{ borderRadius: 2 }}>Save</Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>

      <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snack && <Alert severity={snack.severity} onClose={() => setSnack(null)}>{snack.message}</Alert>}
      </Snackbar>
    </Box>
  );
};

export default EditUserInfo;
