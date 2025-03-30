'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Chip
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import type { UserProfile } from '@/lib/supabase';

export default function AccountSettings() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const { addNotification } = useApp();
  
  // Form state
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      setError('Display name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const updates: Partial<UserProfile> = {
        display_name: displayName.trim()
      };

      const success = await updateProfile(updates);

      if (success) {
        setSuccess('Profile updated successfully');
        setEditMode(false);
        addNotification({
          message: 'Profile updated successfully',
          type: 'success'
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating profile');
      addNotification({
        message: error.message || 'An error occurred while updating profile',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setDisplayName(profile?.display_name || '');
    setEditMode(false);
    setError(null);
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !profile) {
    return (
      <Alert severity="warning">
        Please sign in to view your profile
      </Alert>
    );
  }

  // Get subscription tier display name
  const getSubscriptionDisplay = () => {
    if (!profile.subscription_tier) return 'Free Plan';
    return profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1) + ' Plan';
  };

  // Get free generations display
  const getFreeGenerationsDisplay = () => {
    const used = profile.free_generations_used || 0;
    const limit = 1; // Assuming 1 free generation
    return `${used} / ${limit}`;
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar
          sx={{ width: 80, height: 80, bgcolor: 'primary.main', mr: 2 }}
        >
          {profile.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || <AccountCircleIcon />}
        </Avatar>
        <Box>
          <Typography variant="h5" gutterBottom>
            {profile.display_name || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          <Chip 
            label={getSubscriptionDisplay()}
            size="small"
            color={profile.subscription_tier === 'free' ? 'default' : 'primary'}
            sx={{ mt: 1 }}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <AccountCircleIcon sx={{ mr: 1 }} />
        Account Information
      </Typography>

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ my: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 6" } }}>
          <TextField
            fullWidth
            label="Email Address"
            value={user.email || ''}
            disabled
            variant="outlined"
            sx={{ mb: 3 }}
          />
        </Grid>

        <Grid sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 6" } }}>
          <TextField
            fullWidth
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={!editMode}
            variant="outlined"
            sx={{ mb: 3 }}
          />
        </Grid>

        <Grid sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 6" } }}>
          <TextField
            fullWidth
            label="Membership"
            value={getSubscriptionDisplay()}
            disabled
            variant="outlined"
            sx={{ mb: 3 }}
          />
        </Grid>

        <Grid sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 6" } }}>
          <TextField
            fullWidth
            label="Free Generations Used"
            value={getFreeGenerationsDisplay()}
            disabled
            variant="outlined"
            sx={{ mb: 3 }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        {editMode ? (
          <>
            <Button 
              variant="outlined" 
              onClick={handleCancelEdit}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleUpdateProfile}
              disabled={loading}
            >
              Save Changes
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <KeyIcon sx={{ mr: 1 }} />
        Security Settings
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          sx={{ mr: 2 }}
          onClick={() => {
            addNotification({
              message: 'Password reset email sent. Please check your inbox.',
              type: 'info'
            });
          }}
        >
          Change Password
        </Button>
      </Box>
    </Paper>
  );
}
