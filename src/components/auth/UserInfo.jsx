import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Box, Card, CardContent, Typography, Avatar, Button, Stack,
  Skeleton, Alert, Divider, Chip, Tooltip, IconButton,
} from '@mui/material';
import { Edit3, Camera } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import axiosInstance from '../../utils/axiosInstance';

const UserInfo = () => {
  const { userId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const id = userId || currentUser?.id;

  useEffect(() => {
    if (!userId && currentUser?.id) {
      navigate(`/view-information/${currentUser.id}`, { replace: true });
    } else if (id) {
      userService.getUserInfo(id)
        .then(setUserInfo)
        .catch(() => setError('Failed to fetch user information'));
    } else {
      setError('User ID not available');
    }
  }, [userId, currentUser, navigate, id]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await axiosInstance.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUserInfo(prev => ({ ...prev, avatarUrl: res.data.avatarUrl }));
    } catch {
      setError('Avatar upload failed');
    } finally {
      setUploading(false);
    }
  };

  const isOwnProfile = String(currentUser?.id) === String(id);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} mb={4}>Profile</Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {!userInfo ? (
            <Stack spacing={2}>
              <Skeleton variant="circular" width={80} height={80} />
              <Skeleton width="50%" height={28} />
              <Skeleton width="70%" />
              <Skeleton width="60%" />
            </Stack>
          ) : (
            <>
              {/* Avatar */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={userInfo.avatarUrl ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8081'}${userInfo.avatarUrl}` : undefined}
                    sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: 'primary.main' }}
                  >
                    {userInfo.firstName?.[0] || userInfo.email?.[0] || 'U'}
                  </Avatar>
                  {isOwnProfile && (
                    <>
                      <Tooltip title="Change photo">
                        <IconButton
                          size="small"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          sx={{ position: 'absolute', bottom: -4, right: -4, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', width: 24, height: 24 }}
                        >
                          <Camera size={12} />
                        </IconButton>
                      </Tooltip>
                      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
                    </>
                  )}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {userInfo.firstName} {userInfo.lastName}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">{userInfo.email}</Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    {userInfo.roles?.map((r, i) => {
                      const name = typeof r === 'string' ? r : (r.authority || r.name || String(r));
                      return (
                        <Chip key={i} label={name.replace('ROLE_', '')} size="small" color={name === 'ROLE_ADMIN' ? 'secondary' : 'default'} variant="outlined" />
                      );
                    })}
                  </Stack>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2}>
                {[
                  { label: 'First Name', value: userInfo.firstName },
                  { label: 'Last Name', value: userInfo.lastName },
                  { label: 'Email', value: userInfo.email },
                ].map(({ label, value }) => (
                  <Box key={label}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                      {label}
                    </Typography>
                    <Typography variant="body1">{value || '—'}</Typography>
                  </Box>
                ))}
              </Stack>

              {isOwnProfile && (
                <Button
                  startIcon={<Edit3 size={16} />}
                  variant="outlined"
                  sx={{ mt: 3, borderRadius: 2 }}
                  onClick={() => navigate(`/edit-user-info/${id}`)}
                >
                  Edit Profile
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserInfo;
